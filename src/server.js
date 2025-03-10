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
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const {
      name, contact_person, email, phone, status,
      account_name, bank_name, bank_branch, ifsc_code, payment_terms
    } = req.body;

    // Insert into partners table
    const [partnerResult] = await connection.execute(
      `INSERT INTO partners (name, contact_person, email, phone, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, contact_person, email, phone, status]
    );

    const partnerId = partnerResult.insertId;

    // Insert into partner_bank_details table
    await connection.execute(
      `INSERT INTO partner_bank_details 
       (partner_id, account_name, bank_name, bank_branch, ifsc_code, payment_terms) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [partnerId, account_name, bank_name, bank_branch, ifsc_code, payment_terms]
    );

    await connection.commit();
    res.status(201).json({ 
      success: true, 
      message: 'Partner added successfully', 
      partnerId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding partner:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add partner', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

app.put('/api/partners/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const {
      name, contact_person, email, phone, status,
      account_name, bank_name, bank_branch, ifsc_code, payment_terms
    } = req.body;

    // Update partners table
    const [updatePartner] = await connection.execute(
      `UPDATE partners 
       SET name = ?, contact_person = ?, email = ?, phone = ?, status = ?
       WHERE id = ?`,
      [name, contact_person, email, phone, status, id]
    );

    if (updatePartner.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Partner not found' 
      });
    }

    // Check if bank details exist
    const [bankDetails] = await connection.execute(
      'SELECT id FROM partner_bank_details WHERE partner_id = ?',
      [id]
    );

    if (bankDetails.length > 0) {
      // Update existing bank details
      await connection.execute(
        `UPDATE partner_bank_details 
         SET account_name = ?, bank_name = ?, bank_branch = ?, 
             ifsc_code = ?, payment_terms = ?
         WHERE partner_id = ?`,
        [account_name, bank_name, bank_branch, ifsc_code, payment_terms, id]
      );
    } else {
      // Insert new bank details
      await connection.execute(
        `INSERT INTO partner_bank_details 
         (partner_id, account_name, bank_name, bank_branch, ifsc_code, payment_terms)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, account_name, bank_name, bank_branch, ifsc_code, payment_terms]
      );
    }

    await connection.commit();
    res.json({ 
      success: true,
      message: 'Partner updated successfully',
      id: id
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update partner', 
      error: error.message 
    });
  } finally {
    connection.release();
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