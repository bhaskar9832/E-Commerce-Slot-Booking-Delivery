const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// Initialize tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS delivery_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_name TEXT,
        shift_timing TEXT,
        max_orders_capacity INTEGER,
        current_assigned_orders INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id INTEGER,
        order_token TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed data
    db.get("SELECT COUNT(*) AS count FROM delivery_runs", (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO delivery_runs (driver_name, shift_timing, max_orders_capacity, current_assigned_orders) VALUES ('Bhaskar sarkar', 'Morning', 10, 8)`);
            db.run(`INSERT INTO delivery_runs (driver_name, shift_timing, max_orders_capacity, current_assigned_orders) VALUES ('Disha mondal', 'Evening', 12, 12)`);
            db.run(`INSERT INTO delivery_runs (driver_name, shift_timing, max_orders_capacity, current_assigned_orders) VALUES ('Apurba malakar', 'Morning', 15, 5)`);
        }
    });
});

app.get('/api/delivery-runs', (req, res) => {
    db.all("SELECT * FROM delivery_runs", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/delivery-runs', (req, res) => {
    const { driver_name, shift_timing, max_orders_capacity } = req.body;
    
    if (!driver_name || !shift_timing || !max_orders_capacity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    db.run("INSERT INTO delivery_runs (driver_name, shift_timing, max_orders_capacity, current_assigned_orders) VALUES (?, ?, ?, 0)", 
        [driver_name, shift_timing, max_orders_capacity], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, message: "Driver added successfully" });
    });
});

app.post('/api/delivery-runs/book', (req, res) => {
    const { run_id, order_token } = req.body;
    
    db.get("SELECT * FROM delivery_runs WHERE id = ?", [run_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Run not found" });
        if (row.current_assigned_orders >= row.max_orders_capacity) {
            return res.status(400).json({ error: "Capacity reached" });
        }

        db.run("UPDATE delivery_runs SET current_assigned_orders = current_assigned_orders + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [run_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.run("INSERT INTO logs (run_id, order_token) VALUES (?, ?)", [run_id, order_token], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, message: "Order booked successfully" });
            });
        });
    });
});

app.get('/api/logs', (req, res) => {
    db.all(`
        SELECT logs.*, delivery_runs.driver_name, delivery_runs.shift_timing 
        FROM logs 
        JOIN delivery_runs ON logs.run_id = delivery_runs.id 
        ORDER BY logs.timestamp DESC LIMIT 10
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
