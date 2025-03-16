const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Routes API endpoints
app.get('/api/routes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM main_route');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/route-stops', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM fleet.route_stops ORDER BY route_id, stop_srno');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching route stops:', error);
    res.status(500).json({ error: 'Failed to fetch route stops' });
  }
});

// Update the POST route endpoint
app.post('/api/routes', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    const { mainRoute, stops } = req.body;
    
    // Insert main route with status
    const [routeResult] = await connection.query(
      'INSERT INTO main_route (company_id, company_route_id, route_name, route_from, route_to, route_total_kms, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        mainRoute.company_id,
        mainRoute.company_route_id,
        mainRoute.route_name,
        mainRoute.route_from,
        mainRoute.route_to,
        mainRoute.route_total_kms,
        mainRoute.status || 'active'
      ]
    );
    
    const routeId = routeResult.insertId;
    
    // Insert route stops with time fields
    for (const stop of stops) {
      await connection.query(
        'INSERT INTO route_stops (route_id, stop_srno, start_from, end_to, stop_kms, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          routeId,
          stop.stop_srno,
          stop.start_from,
          stop.end_to,
          stop.stop_kms,
          stop.start_time,
          stop.end_time
        ]
      );
    }
    
    await connection.commit();
    res.json({ message: 'Route added successfully', routeId });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error adding route:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update the GET routes endpoint to include company_route_id
app.get('/api/routes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT *, company_route_id FROM main_route');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the GET route-stops endpoint to include time fields
app.get('/api/route-stops', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT *, TIME_FORMAT(start_time, "%H:%i") as start_time, TIME_FORMAT(end_time, "%H:%i") as end_time FROM route_stops ORDER BY route_id, stop_srno');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    await connection.query('DELETE FROM route_stops WHERE route_id = ?', [req.params.id]);
    await connection.query('DELETE FROM main_route WHERE route_id = ?', [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Vehicle routes
// Get all active vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.id,
        v.licensePlate,
        v.make,
        v.model,
        v.year,
        v.color,
        v.vehicleType,
        v.fuelType,
        v.engineNumber,
        v.chassisNumber,
        v.status,
        v.partner_id,
        COALESCE(p.name, 'Not Assigned') as partner_name
      FROM vehicles v
      LEFT JOIN partners p ON v.partner_id = p.id
      ORDER BY v.licensePlate
    `);
    console.log('Database response:', rows); // Debug log
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const vehicle = req.body;
    const [result] = await db.query('INSERT INTO vehicles SET ?', vehicle);
    res.json({ id: result.insertId, ...vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = req.body;
    const [result] = await db.query('UPDATE vehicles SET ? WHERE id = ?', [vehicle, id]);
    res.json({ id, ...vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Partner routes
app.post('/api/partners', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    // Map camelCase request fields to snake_case database fields
    const {
      name,
      contactPerson: contact_person,
      email,
      phone,
      status,
      accountName: account_name,
      bankName: bank_name,
      bankBranch: bank_branch,
      ifscCode: ifsc_code,
      paymentTerms: payment_terms
    } = req.body;

    // Log the received data for debugging
    console.log('Received partner data:', req.body);

    // Check for empty strings or null values
    if (!name || !contact_person || !email || !phone || 
        name.trim() === '' || contact_person.trim() === '' || 
        email.trim() === '' || phone.trim() === '') {
      throw new Error('Name, Contact Person, Email, and Phone are required fields and cannot be empty');
    }

    // Validate status enum
    const validStatus = ['active', 'inactive'];
    const partnerStatus = status?.toLowerCase() || 'active';
    if (!validStatus.includes(partnerStatus)) {
      throw new Error('Status must be either "active" or "inactive"');
    }

    // Insert into partners table with trimmed values
    const [partnerResult] = await connection.query(
      'INSERT INTO partners (name, contact_person, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      [
        name.trim(),
        contact_person.trim(),
        email.trim(),
        phone.trim(),
        partnerStatus
      ]
    );

    const partnerId = partnerResult.insertId;

    // Insert into partner_bank_details table with null checks
    await connection.query(
      `INSERT INTO partner_bank_details 
       (partner_id, account_name, bank_name, bank_branch, ifsc_code, payment_terms) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        partnerId,
        (account_name && account_name.trim()) || null,
        (bank_name && bank_name.trim()) || null,
        (bank_branch && bank_branch.trim()) || null,
        (ifsc_code && ifsc_code.trim()) || null,
        (payment_terms && payment_terms.trim()) || null
      ]
    );

    await connection.commit();
    res.status(201).json({ 
      success: true, 
      message: 'Partner added successfully', 
      partnerId 
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error adding partner:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to add partner',
      details: error.sqlMessage || error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.put('/api/partners/:id', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    const { id } = req.params;
    const {
      name,
      contactPerson: contact_person,
      email,
      phone,
      status,
      accountName: account_name,
      bankName: bank_name,
      bankBranch: bank_branch,
      ifscCode: ifsc_code,
      paymentTerms: payment_terms
    } = req.body;

    console.log('Received update data:', req.body); // Debug log

    // Validate all required fields
    const requiredFields = {
      name,
      contact_person,
      email,
      phone,
      account_name,
      bank_name,
      bank_branch,
      ifsc_code
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([field]) => field);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Update partners table
    const [updatePartner] = await connection.query(
      'UPDATE partners SET name = ?, contact_person = ?, email = ?, phone = ?, status = ? WHERE id = ?',
      [
        name.trim(),
        contact_person.trim(),
        email.trim(),
        phone.trim(),
        status || 'active',
        id
      ]
    );

    if (updatePartner.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    // Handle bank details
    const [existingBank] = await connection.query(
      'SELECT id FROM partner_bank_details WHERE partner_id = ?',
      [id]
    );

    if (existingBank.length > 0) {
      // Update existing bank details
      await connection.query(
        `UPDATE partner_bank_details 
         SET account_name = ?, bank_name = ?, bank_branch = ?, 
             ifsc_code = ?, payment_terms = ?
         WHERE partner_id = ?`,
        [
          account_name.trim(),
          bank_name.trim(),
          bank_branch.trim(),
          ifsc_code.trim(),
          payment_terms?.trim() || '',
          id
        ]
      );
    } else {
      // Insert new bank details
      await connection.query(
        `INSERT INTO partner_bank_details 
         (partner_id, account_name, bank_name, bank_branch, ifsc_code, payment_terms)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          account_name.trim(),
          bank_name.trim(),
          bank_branch.trim(),
          ifsc_code.trim(),
          payment_terms?.trim() || ''
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Partner updated successfully', id });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to update partner'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/partners', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, pb.account_name, pb.bank_name, pb.bank_branch, 
             pb.ifsc_code, pb.payment_terms
      FROM partners p
      LEFT JOIN partner_bank_details pb ON p.id = pb.partner_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Failed to fetch partners' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (users.length > 0) {
      const user = users[0];
      delete user.password; // Don't send password back
      res.json({ success: true, user });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Add all package-related endpoints before app.listen()
// Update the GET packages endpoint
app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        c.name as company_name,
        s.name as supervisor_name,
        d.name as driver_name,
        v.licensePlate as vehicle_no,
        mr.company_route_id
      FROM packages p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN staff s ON p.supervisor_id = s.id
      LEFT JOIN drivers d ON p.driver_id = d.id
      LEFT JOIN vehicles v ON p.vehicle_no = v.licensePlate
      LEFT JOIN main_route mr ON p.route_id = mr.route_id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the POST packages endpoint
app.post('/api/packages', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const package = req.body;
    
    // Get route data including route_total_kms
    const [routeData] = await connection.query(
      'SELECT company_route_id, route_total_kms FROM main_route WHERE route_id = ?',
      [package.route_id]
    );

    if (routeData.length > 0) {
      package.company_route_id = routeData[0].company_route_id;
      package.route_total_kms = routeData[0].route_total_kms;

      // Calculate monthly_kms based on route_total_kms
      if (package.trips_per_day && package.no_of_days) {
        package.monthly_kms = routeData[0].route_total_kms * package.trips_per_day * package.no_of_days;
      }
    }

    // Insert package with route_total_kms
    const [result] = await connection.query('INSERT INTO packages SET ?', package);
    
    // Update the SELECT query to include route_total_kms
    const [newPackage] = await connection.query(`
      SELECT 
        p.*,
        c.name as company_name,
        s.name as supervisor_name,
        d.name as driver_name,
        v.licensePlate as vehicle_no,
        mr.company_route_id,
        mr.route_total_kms
      FROM packages p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN staff s ON p.supervisor_id = s.id
      LEFT JOIN drivers d ON p.driver_id = d.id
      LEFT JOIN vehicles v ON p.vehicle_no = v.licensePlate
      LEFT JOIN main_route mr ON p.route_id = mr.route_id
      WHERE p.id = ?
    `, [result.insertId]);

    await connection.commit();
    res.status(201).json({ 
      success: true,
      message: 'Package added successfully',
      data: newPackage[0]
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error adding package:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add package',
      error: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update the GET packages endpoint to include route_total_kms
app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        c.name as company_name,
        s.name as supervisor_name,
        d.name as driver_name,
        v.licensePlate as vehicle_no,
        mr.company_route_id,
        mr.route_total_kms
      FROM packages p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN staff s ON p.supervisor_id = s.id
      LEFT JOIN drivers d ON p.driver_id = d.id
      LEFT JOIN vehicles v ON p.vehicle_no = v.licensePlate
      LEFT JOIN main_route mr ON p.route_id = mr.route_id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update the companies endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM companies ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this near the top of your file, after other middleware
app.use(express.json());
app.use(cors());

// Update or add the companies POST endpoint
app.post('/api/companies', async (req, res) => {
  try {
    console.log('Received company data:', req.body); // Debug log
    const { name, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO companies (name, status) VALUES (?, ?)',
      [name, status]
    );

    if (result.affectedRows > 0) {
      const [newCompany] = await db.query(
        'SELECT * FROM companies WHERE id = ?',
        [result.insertId]
      );
      console.log('Created company:', newCompany[0]); // Debug log
      res.status(201).json(newCompany[0]);
    } else {
      throw new Error('Failed to create company');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create company',
      error: error.message 
    });
  }
});

// Move this before app.listen()
app.get('/api/companies/with-routes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT c.* 
      FROM companies c
      INNER JOIN main_route mr ON c.id = mr.company_id
      WHERE c.status = "active"
      ORDER BY c.name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching companies with routes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff WHERE status = "active"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drivers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM drivers WHERE status = "active"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move app.listen() to the end
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Add this with your other API endpoints
app.get('/api/main-routes/company', async (req, res) => {
  try {
    const { company_id } = req.query;
    const [rows] = await db.query(`
      SELECT 
        route_id,
        company_route_id,
        route_name,
        route_from,
        route_to,
        route_total_kms
      FROM main_route 
      WHERE company_id = ? AND status = 'active'
      ORDER BY route_name
    `, [company_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching company routes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the partners names endpoint
app.get('/api/partners/names', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id as partnerId, name as partnerName FROM partners WHERE status = "active"'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching partner names:', error);
    res.status(500).json({ error: error.message });
  }
});
app.put('/api/routes/:id', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    const { mainRoute, stops } = req.body;
    const routeId = req.params.id;

    // Update main route
    await connection.query(
      `UPDATE main_route SET 
        company_route_id = ?, 
        company_id= ?,
        route_name = ?, 
        route_from = ?, 
        route_to = ?, 
        route_total_kms = ?,
        status = ?
      WHERE route_id = ?`,
      [
        mainRoute.company_route_id,
        mainRoute.company_id,
        mainRoute.route_name,
        mainRoute.route_from,
        mainRoute.route_to,
        mainRoute.route_total_kms,
        mainRoute.status,
        routeId
      ]
    );

    // Delete existing stops
    await connection.query('DELETE FROM route_stops WHERE route_id = ?', [routeId]);

    // Insert updated stops
    for (const stop of stops) {
      await connection.query(
        'INSERT INTO route_stops (route_id, stop_srno, start_from, end_to, stop_kms, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          routeId,
          stop.stop_srno,
          stop.start_from,
          stop.end_to,
          stop.stop_kms,
          stop.start_time,
          stop.end_time
        ]
      );
    }

    await connection.commit();
    res.json({ message: 'Route updated successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating route:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/packages/recalculate', async (req, res) => {
  try {
    // Get all packages with their routes
    const [packages] = await db.query(`
      SELECT p.*, r.route_total_kms 
      FROM packages p
      JOIN main_route r ON p.route_id = r.route_id
    `);

    // Update each package with recalculated values
    for (const pkg of packages) {
      const monthlyKms = pkg.route_total_kms * pkg.trips_per_day * pkg.no_of_days;
      
      await db.query(`
        UPDATE packages 
        SET monthly_kms = ?
        WHERE id = ?
      `, [monthlyKms, pkg.id]);
    }

    res.json({ success: true, message: 'Packages recalculated successfully' });
  } catch (error) {
    console.error('Error recalculating packages:', error);
    res.status(500).json({ error: 'Failed to recalculate packages' });
  }
});

// Add PUT endpoint for updating packages (move this before app.listen)
app.put('/api/packages/:id', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { id } = req.params;
    const package = req.body;

    // Update package
    const [result] = await connection.query(
      'UPDATE packages SET ? WHERE id = ?',
      [package, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Package not found');
    }

    // Get updated package data
    const [updatedPackage] = await connection.query(`
      SELECT 
        p.*,
        c.name as company_name,
        s.name as supervisor_name,
        d.name as driver_name,
        v.licensePlate as vehicle_no,
        mr.company_route_id,
        mr.route_total_kms
      FROM packages p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN staff s ON p.supervisor_id = s.id
      LEFT JOIN drivers d ON p.driver_id = d.id
      LEFT JOIN vehicles v ON p.vehicle_no = v.licensePlate
      LEFT JOIN main_route mr ON p.route_id = mr.route_id
      WHERE p.id = ?
    `, [id]);

    await connection.commit();
    res.json(updatedPackage[0]);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating package:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update package',
      error: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
app.put('/api/routes/:id', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    const { mainRoute, stops } = req.body;
    const routeId = req.params.id;

    // Update main route
    await connection.query(
      `UPDATE main_route SET 
        company_route_id = ?, 
        company_id= ?,
        route_name = ?, 
        route_from = ?, 
        route_to = ?, 
        route_total_kms = ?,
        status = ?
      WHERE route_id = ?`,
      [
        mainRoute.company_route_id,
        mainRoute.company_id,
        mainRoute.route_name,
        mainRoute.route_from,
        mainRoute.route_to,
        mainRoute.route_total_kms,
        mainRoute.status,
        routeId
      ]
    );

    // Delete existing stops
    await connection.query('DELETE FROM route_stops WHERE route_id = ?', [routeId]);

    // Insert updated stops
    for (const stop of stops) {
      await connection.query(
        'INSERT INTO route_stops (route_id, stop_srno, start_from, end_to, stop_kms, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          routeId,
          stop.stop_srno,
          stop.start_from,
          stop.end_to,
          stop.stop_kms,
          stop.start_time,
          stop.end_time
        ]
      );
    }

    await connection.commit();
    res.json({ message: 'Route updated successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating route:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/packages/recalculate', async (req, res) => {
  try {
    // Get all packages with their routes
    const [packages] = await db.query(`
      SELECT p.*, r.route_total_kms 
      FROM packages p
      JOIN main_route r ON p.route_id = r.route_id
    `);

    // Update each package with recalculated values
    for (const pkg of packages) {
      const monthlyKms = pkg.route_total_kms * pkg.trips_per_day * pkg.no_of_days;
      
      await db.query(`
        UPDATE packages 
        SET monthly_kms = ?
        WHERE id = ?
      `, [monthlyKms, pkg.id]);
    }

    res.json({ success: true, message: 'Packages recalculated successfully' });
  } catch (error) {
    console.error('Error recalculating packages:', error);
    res.status(500).json({ error: 'Failed to recalculate packages' });
  }
});