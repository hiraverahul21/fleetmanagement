const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Vehicle routes
app.get('/api/vehicles', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehicles');
    res.json(rows);
  } catch (error) {
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
      name, contact_person, email, phone, status,
      account_name, bank_name, bank_branch, ifsc_code, payment_terms
    } = req.body;

    // Update partners table
    const [updatePartner] = await connection.query(
      'UPDATE partners SET name = ?, contact_person = ?, email = ?, phone = ?, status = ? WHERE id = ?',
      [name, contact_person, email, phone, status, id]
    );

    if (updatePartner.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    // Update or insert bank details
    const [bankDetails] = await connection.query(
      'SELECT id FROM partner_bank_details WHERE partner_id = ?',
      [id]
    );

    if (bankDetails.length > 0) {
      await connection.query(
        'UPDATE partner_bank_details SET account_name = ?, bank_name = ?, bank_branch = ?, ifsc_code = ?, payment_terms = ? WHERE partner_id = ?',
        [account_name, bank_name, bank_branch, ifsc_code, payment_terms, id]
      );
    } else {
      await connection.query(
        'INSERT INTO partner_bank_details (partner_id, account_name, bank_name, bank_branch, ifsc_code, payment_terms) VALUES (?, ?, ?, ?, ?, ?)',
        [id, account_name, bank_name, bank_branch, ifsc_code, payment_terms]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Partner updated successfully', id });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update partner', error: error.message });
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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Add this with your other API endpoints
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