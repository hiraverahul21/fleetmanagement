const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'fleetmanagement',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

router.post('/partners', async (req, res) => {
  try {
    const {
      name, contactPerson, email, phone, status,
      accountName, bankName, bankBranch, ifscCode, paymentTerms
    } = req.body;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert into partners table
      const [result] = await connection.execute(
        `INSERT INTO partners (name, contact_person, email, phone, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, contactPerson, email, phone, status]
      );

      const partnerId = result.insertId;

      // Insert into partner_bank_details table
      await connection.execute(
        `INSERT INTO partner_bank_details 
         (partner_id, account_name, bank_name, bank_branch, ifsc_code, payment_terms) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partnerId, accountName, bankName, bankBranch, ifscCode, paymentTerms]
      );

      await connection.commit();
      res.status(201).json({ message: 'Partner added successfully', partnerId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding partner:', error);
    res.status(500).json({ message: 'Failed to add partner' });
  }
});

module.exports = router;