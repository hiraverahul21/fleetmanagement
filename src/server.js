const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
// Add the slip details endpoint here
app.get('/api/diesel/slip-details/:slipNumber', async (req, res) => {
  try {
    const { slipNumber } = req.params;
    console.log('Received request for slip:', slipNumber);
    
    const [details] = await db.query(`
      SELECT 
        dad.diesel_qty,
        da.vehicle_no,
        dad.status,
        dad.allotment_id
      FROM diesel_allotment_details dad
      JOIN diesel_allotments da ON dad.allotment_id = da.id
      WHERE dad.receipt_number = ?
      LIMIT 1
    `, [slipNumber]);

    console.log('Query results:', details);

    res.status(200).json({
      success: details && details.length > 0,
      data: details && details.length > 0 ? {
        dieselQty: details[0].diesel_qty,
        vehicleNo: details[0].vehicle_no
      } : null,
      message: details && details.length > 0 ? 'Details found' : 'No details found for this slip number'
    });

  } catch (error) {
    console.error('Error fetching slip details:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
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
        v.*,
        COALESCE(p.name, 'Not Assigned') as partner_name,
        COALESCE(dv.name, 'Not Assigned') as petrol_pump_name,
        COALESCE(vc.capacity, 'Not Set') as vehicle_capacity,
        COALESCE(v.vehicle_average, COALESCE(vc.average, 'Not Set')) as vehicle_average
      FROM vehicles v
      LEFT JOIN partners p ON v.partner_id = p.id
      LEFT JOIN diesel_vendors dv ON v.petrol_pump_id = dv.id
      LEFT JOIN vehicle_capacity vc ON v.vehicle_capacity_id = vc.id
      ORDER BY v.licensePlate
    `);
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

// Add these diesel vendor endpoints before app.listen()

// // Get all diesel vendors
// app.get('/api/diesel-vendors', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM diesel_vendors ORDER BY id DESC');
//     res.json(rows);
//   } catch (error) {
//     console.error('Error fetching diesel vendors:', error);
//     res.status(500).json({ error: error.message });
//   }
// });
// Get all diesel vendors (petrol pumps)
app.get('/api/diesel-vendors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        name,
        address,
        contact_person,
        supply_type 
      FROM diesel_vendors       
      ORDER BY name`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching diesel vendors:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add new diesel vendor
app.post('/api/diesel-vendors', async (req, res) => {
  try {
    const { name, address, contact_person, supply_type } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO diesel_vendors (name, address, contact_person, supply_type) VALUES (?, ?, ?, ?)',
      [name, address, contact_person, supply_type]
    );

    const [newVendor] = await db.query('SELECT * FROM diesel_vendors WHERE id = ?', [result.insertId]);
    res.status(201).json(newVendor[0]);
  } catch (error) {
    console.error('Error adding diesel vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update diesel vendor
app.put('/api/diesel-vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contact_person, supply_type } = req.body;

    await db.query(
      'UPDATE diesel_vendors SET name = ?, address = ?, contact_person = ?, supply_type = ? WHERE id = ?',
      [name, address, contact_person, supply_type, id]
    );

    const [updatedVendor] = await db.query('SELECT * FROM diesel_vendors WHERE id = ?', [id]);
    res.json(updatedVendor[0]);
  } catch (error) {
    console.error('Error updating diesel vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete diesel vendor
app.delete('/api/diesel-vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM diesel_vendors WHERE id = ?', [id]);
    res.json({ message: 'Diesel vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting diesel vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// Add these diesel receipt endpoints before app.listen()

// Get all diesel receipts with vendor names
app.get('/api/diesel-receipts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dr.*,
        DATE_FORMAT(dr.issued_date, '%Y-%m-%d') as issued_date,
        dv.name as vendor_name,
        s.name as staff_name
      FROM diesel_receipts dr
      LEFT JOIN diesel_vendors dv ON dr.vendor_id = dv.id
      LEFT JOIN staff s ON dr.staff_id = s.id
      ORDER BY dr.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching diesel receipts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new diesel receipt
app.post('/api/diesel-receipts', async (req, res) => {
  try {
    const { 
      vendor_id, 
      receipt_book_id, 
      issued_date, 
      staff_id,  // Add this line
      receipt_from, 
      receipt_to,
      receipts_count,
      receipts_balance,
      status 
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO diesel_receipts 
       (vendor_id, receipt_book_id, issued_date, staff_id, receipt_from, receipt_to, 
        receipts_count, receipts_balance, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, receipt_book_id, issued_date, staff_id, receipt_from, receipt_to, 
       receipts_count, receipts_balance, status || 'active']
    );

    // Fetch the newly created receipt with vendor and staff names
    const [newReceipt] = await db.query(`
      SELECT dr.*, dv.name as vendor_name, s.name as staff_name
      FROM diesel_receipts dr
      LEFT JOIN diesel_vendors dv ON dr.vendor_id = dv.id
      LEFT JOIN staff s ON dr.staff_id = s.id
      WHERE dr.id = ?
    `, [result.insertId]);

    res.status(201).json(newReceipt[0]);
  } catch (error) {
    console.error('Error adding diesel receipt:', error);
    res.status(500).json({ error: error.message });
  }
});
// Update diesel receipt
app.put('/api/diesel-receipts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Remove vendor_name and staff_name from the update data
    const { vendor_name, staff_name, ...updateData } = req.body;
    
    await db.query(
      'UPDATE diesel_receipts SET ? WHERE id = ?',
      [updateData, id]
    );

    // Fetch the updated receipt with vendor name and staff name
    const [updatedReceipt] = await db.query(`
      SELECT dr.*, dv.name as vendor_name, s.name as staff_name
      FROM diesel_receipts dr
      LEFT JOIN diesel_vendors dv ON dr.vendor_id = dv.id
      LEFT JOIN staff s ON dr.staff_id = s.id
      WHERE dr.id = ?
    `, [id]);

    res.json(updatedReceipt[0]);
  } catch (error) {
    console.error('Error updating diesel receipt:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this endpoint for staff names
app.get('/api/staff/supervisors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name FROM staff 
      WHERE role = 'supervisor' AND status = 'active'
      ORDER BY name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
});
// Get all vehicle capacities
app.get('/api/vehicle-capacities', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, capacity, average FROM vehicle_capacity WHERE status = "active"');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vehicle capacities:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this before app.listen()
app.get('/api/diesel-allotments', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.vehicle_no,
        p.route_id,
        mr.company_route_id,
        mr.route_name,
        p.route_total_kms,
        p.trips_per_day,
        p.no_of_days,
        p.monthly_kms,
        p.actual_kms,
        p.shift,
        p.diesel_status,
        p.status,
        s.name as supervisor_name,
        d.name as driver_name,
        c.name as company_name,
        pt.name as partner_name,
        v.vehicle_average as vehicle_average,
        vc.capacity as vehicle_capacity
      FROM packages p
      LEFT JOIN main_route mr ON p.route_id = mr.route_id
      LEFT JOIN staff s ON p.supervisor_id = s.id
      LEFT JOIN drivers d ON p.driver_id = d.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN partners pt ON p.partner_id = pt.id
      LEFT JOIN vehicles v ON p.vehicle_no = v.licensePlate
      LEFT JOIN vehicle_capacity vc ON v.vehicle_capacity_id = vc.id
      WHERE p.status = 'active'      
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching diesel allotments:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this new endpoint to get only vendors with receipts
app.get('/api/diesel-vendors/active-receipts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT dv.* 
      FROM diesel_vendors dv
      INNER JOIN diesel_receipts dr ON dv.id = dr.vendor_id
      WHERE dr.status = 'active'
      ORDER BY dv.name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vendors with receipts:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this endpoint to get diesel receipts for a specific vendor
app.get('/api/diesel-receipts/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const [rows] = await db.query(`
      SELECT 
        id,
        receipt_book_id,
        receipt_from,
        receipt_to,
        receipts_balance,
        status
      FROM diesel_receipts
      WHERE vendor_id = ? 
        AND status = 'active'
        AND receipts_balance > 0
      ORDER BY receipt_book_id
    `, [vendorId]);
    
    if (rows.length === 0) {
      return res.json([]); // Return empty array if no receipts found
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vendor receipts:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this endpoint before app.listen()
app.get('/api/diesel-receipts/:receiptBookId/numbers', async (req, res) => {
  try {
    const { receiptBookId } = req.params;
    const { currentReceiptNumber } = req.query;
    
    const [receipt] = await db.query(`
      SELECT receipt_from, receipt_to 
      FROM diesel_receipts 
      WHERE receipt_book_id = ? AND status = 'active'
    `, [receiptBookId]);

    if (!receipt.length) {
      return res.json([]);
    }

    // Only get used numbers if we're fetching new options
    if (!currentReceiptNumber) {
      const [usedReceipts] = await db.query(`
        SELECT DISTINCT receipt_number 
        FROM diesel_allotment_details 
        WHERE receipt_book_id = ? AND receipt_number IS NOT NULL
      `, [receiptBookId]);

      const usedNumbers = new Set(usedReceipts.map(r => r.receipt_number));
      const { receipt_from, receipt_to } = receipt[0];
      const availableNumbers = [];
      
      for (let i = receipt_from; i <= receipt_to; i++) {
        if (!usedNumbers.has(i.toString())) {
          availableNumbers.push({ value: i, label: i.toString() });
        }
      }
      
      res.json(availableNumbers);
    } else {
      // Return just the current receipt number for existing selections
      res.json([{ value: currentReceiptNumber, label: currentReceiptNumber }]);
    }
  } catch (error) {
    console.error('Error fetching receipt numbers:', error);
    res.status(500).json({ error: error.message });
  }
});
// Update the save diesel allotments endpoint
app.post('/api/diesel-allotments/save', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const savedAllotments = [];
    const { year, month } = req.body[0];

    await connection.execute(
      `INSERT IGNORE INTO diesel_allotment_periods (year, month) VALUES (?, ?)`,
      [year, parseInt(month)]
    );

    for (const allotment of req.body) {
      // Fixed INSERT query - removed extra ? and aligned values
      const [result] = await connection.execute(
        `INSERT INTO diesel_allotments 
        (vehicle_no, year, month, company_route_id, monthly_kms, vehicle_average, 
         no_of_days, route_name, actual_kms, vehicle_capacity, diesel_require, 
         supervisor_name, status, package_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          allotment.vehicle_no,
          allotment.year,
          parseInt(allotment.month),
          allotment.company_route_id,
          allotment.monthly_kms,
          allotment.vehicle_average,
          allotment.no_of_days,
          allotment.route_name,
          allotment.actual_kms,
          allotment.vehicle_capacity,
          allotment.diesel_require,
          allotment.supervisor_name,
          'active',
          allotment.id  // package_id
        ]
      );

      const allotmentId = result.insertId;
      savedAllotments.push(allotmentId);

      // Rest of the code remains the same
      for (const detail of allotment.diesel_details) {
        await connection.execute(
          `INSERT INTO diesel_allotment_details 
          (allotment_id, date, vendor_id, receipt_book_id, receipt_number, diesel_qty, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            allotmentId,
            detail.date,
            detail.vendor_id || null,
            detail.receipt_book_id || null,
            detail.receipt_number || null,
            detail.diesel_qty,
            'active'
          ]
        );

        if (detail.receipt_book_id && detail.receipt_number) {
          await connection.execute(
            `UPDATE diesel_receipts 
             SET receipts_balance = receipts_balance - 1 
             WHERE receipt_book_id = ? AND receipts_balance > 0`,
            [detail.receipt_book_id]
          );
        }
      }
    }

    await connection.commit();
    res.json({ 
      success: true,
      message: 'Diesel allotments saved successfully',
      allotmentIds: savedAllotments,
      period: { year, month }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error saving diesel allotments:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to save diesel allotments',
      details: error.sqlMessage || error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
// Add new endpoint to check if allotment exists for a period
app.get('/api/diesel-allotments/check-period', async (req, res) => {
  try {
    const { year, month } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM diesel_allotment_periods WHERE year = ? AND month = ?',
      [year, month]
    );
    res.json({ 
      exists: rows.length > 0,
      period: rows[0] || null
    });
  } catch (error) {
    console.error('Error checking allotment period:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this endpoint to get diesel allotment details
app.get('/api/diesel-allotments/details/:allotmentId', async (req, res) => {
  try {
    const { allotmentId } = req.params;
    const [rows] = await db.query(`
      SELECT 
        dad.*,
        dv.name as vendor_name
      FROM diesel_allotment_details dad
      LEFT JOIN diesel_vendors dv ON dad.vendor_id = dv.id
      WHERE dad.allotment_id = ?
      ORDER BY dad.date
    `, [allotmentId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching allotment details:', error);
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/diesel-allotments/details', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // First, get all main allotments
    const [allotments] = await db.query(`
      SELECT 
        da.*,
        p.id as package_id
      FROM diesel_allotments da
      LEFT JOIN packages p ON da.package_id = p.id
      WHERE da.year = ? AND da.month = ? AND da.status = 'active'
      ORDER BY da.id DESC
    `, [year, month]);

    // Then, get all details for these allotments
    const allotmentIds = allotments.map(a => a.id);
    if (allotmentIds.length > 0) {
      const [details] = await db.query(`
        SELECT 
          dad.*,
          dv.name as vendor_name
        FROM diesel_allotment_details dad
        LEFT JOIN diesel_vendors dv ON dad.vendor_id = dv.id
        WHERE dad.allotment_id IN (?)
        ORDER BY dad.date
      `, [allotmentIds]);

      // Group details by allotment_id
      const detailsByAllotment = details.reduce((acc, detail) => {
        if (!acc[detail.allotment_id]) {
          acc[detail.allotment_id] = [];
        }
        acc[detail.allotment_id].push(detail);
        return acc;
      }, {});

      // Combine allotments with their details
      const result = allotments.map(allotment => ({
        ...allotment,
        details: detailsByAllotment[allotment.id] || []
      }));

      res.json(result);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching allotment details:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add the update endpoint for diesel allotments
app.put('/api/diesel-allotments/update', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { allotments } = req.body;

    for (const allotment of allotments) {
      if (allotment.details && allotment.details.length > 0) {
        for (const detail of allotment.details) {
          if (detail.id === null) {
            // Insert new detail with proper date handling
            const [result] = await connection.query(
              `INSERT INTO diesel_allotment_details 
              (allotment_id, date, vendor_id, receipt_book_id, receipt_number, diesel_qty, status,remarks)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                allotment.id,
                detail.date || null, // Use date directly without fallback
                detail.vendor_id || null,
                detail.receipt_book_id || null,
                detail.receipt_number || null,
                detail.diesel_qty ? parseFloat(detail.diesel_qty) : 0,
                detail.status || 'extra',
                detail.remarks || null
              ]
            );

            // Update receipt balance for new entries
            if (detail.receipt_book_id && detail.receipt_number) {
              await connection.query(
                `UPDATE diesel_receipts 
                SET receipts_balance = receipts_balance - 1
                WHERE receipt_book_id = ? AND receipts_balance > 0`,
                [detail.receipt_book_id]
              );
            }
          } else {
            // Update existing detail
            await connection.query(
              `UPDATE diesel_allotment_details 
              SET vendor_id = ?, receipt_book_id = ?, receipt_number = ?, 
                  date = ?, diesel_qty = ?, status = ?, remarks = ?
              WHERE id = ?`,
              [
                detail.vendor_id || null,
                detail.receipt_book_id || null,
                detail.receipt_number || null,
                detail.date || null,
                detail.diesel_qty || 0,
                detail.status || 'extra',
                detail.remarks || null,
                detail.id
              ]
            );
          }
        }
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Allotment details updated successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating allotment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update allotment details',
      error: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
//  FIle uplaod and conversion
// Add these at the top of your file with other requires
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const PDFParser = require('pdf2table');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// PDF to Excel conversion endpoint
app.post('/api/diesel/convert-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    
    // Convert PDF to table data
    const tables = await new Promise((resolve, reject) => {
      PDFParser.parse(pdfBuffer, (err, data) => {
        if (err) reject(err);
        else {
          // Ensure data is in the correct format (array of arrays)
          const formattedData = Array.isArray(data) ? data.map(row => {
            return Array.isArray(row) ? row : [row];
          }) : [[data]];
          resolve([formattedData]); // Wrap in array to handle as multiple tables
        }
      });
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add each table as a worksheet
    tables.forEach((table, index) => {
      if (table && Array.isArray(table) && table.length > 0) {
        // Ensure each row is an array
        const formattedTable = table.map(row => 
          Array.isArray(row) ? row : [row]
        );
        const ws = XLSX.utils.aoa_to_sheet(formattedTable);
        XLSX.utils.book_append_sheet(wb, ws, `Table_${index + 1}`);
      }
    });

    // Save to Excel file
    const excelFileName = path.join(__dirname, 'uploads', 'converted.xlsx');
    XLSX.writeFile(wb, excelFileName);

    // Send file to client
    res.download(excelFileName, 'converted.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up files
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(excelFileName);
    });

  } catch (error) {
    console.error('Error converting PDF:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error converting PDF to Excel' });
  }
});

// Move app.listen() to the end
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});