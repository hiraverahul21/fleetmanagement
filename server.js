// ... existing code ...

// Add new route with stops
app.post('/api/routes', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { mainRoute, stops } = req.body;
    
    // Insert main route
    const [routeResult] = await conn.query(
      'INSERT INTO main_route (company_id, route_name, route_from, route_to, route_total_kms) VALUES (?, ?, ?, ?, ?)',
      [mainRoute.company_id, mainRoute.route_name, mainRoute.route_from, mainRoute.route_to, mainRoute.route_total_kms]
    );
    
    const routeId = routeResult.insertId;
    
    // Insert route stops
    for (const stop of stops) {
      await conn.query(
        'INSERT INTO route_stops (route_id, stop_srno, start_from, end_to, stop_kms) VALUES (?, ?, ?, ?, ?)',
        [routeId, stop.stop_srno, stop.start_from, stop.end_to, stop.stop_kms]
      );
    }
    
    await conn.commit();
    res.json({ message: 'Route added successfully', routeId });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// ... rest of existing code ...