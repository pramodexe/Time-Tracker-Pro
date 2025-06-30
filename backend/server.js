const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, "timer.db");
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sessions table
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    duration INTEGER, -- in milliseconds
    notes TEXT,
    tags TEXT, -- JSON string of tags array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  )`);
});

// Helper function to update timestamps
const updateTimestamp = (table, id, callback) => {
  db.run(
    `UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id],
    callback
  );
};

// CATEGORIES ROUTES

// Get all categories
app.get("/api/categories", (req, res) => {
  db.all("SELECT * FROM categories ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get category by ID
app.get("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(row);
  });
});

// Create new category
app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  db.run(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description || ""],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, description });
    }
  );
});

// Update category
app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  db.run(
    "UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, description || "", id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json({ id, name, description });
    }
  );
});

// Delete category
app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM categories WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ message: "Category deleted successfully" });
  });
});

// SESSIONS ROUTES

// Get all sessions for a category
app.get("/api/categories/:categoryId/sessions", (req, res) => {
  const { categoryId } = req.params;
  db.all(
    "SELECT * FROM sessions WHERE category_id = ? ORDER BY created_at DESC",
    [categoryId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // Parse tags JSON for each session
      const sessions = rows.map((session) => ({
        ...session,
        tags: session.tags ? JSON.parse(session.tags) : [],
      }));
      res.json(sessions);
    }
  );
});

// Get session by ID
app.get("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM sessions WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    // Parse tags JSON
    const session = {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
    };
    res.json(session);
  });
});

// Create new session
app.post("/api/categories/:categoryId/sessions", (req, res) => {
  const { categoryId } = req.params;
  const { name, notes, tags } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const tagsJson = JSON.stringify(tags || []);

  db.run(
    "INSERT INTO sessions (category_id, name, notes, tags) VALUES (?, ?, ?, ?)",
    [categoryId, name, notes || "", tagsJson],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        category_id: categoryId,
        name,
        notes,
        tags: tags || [],
      });
    }
  );
});

// Start timer for session
app.post("/api/sessions/:id/start", (req, res) => {
  const { id } = req.params;
  const startTime = new Date().toISOString();

  db.run(
    "UPDATE sessions SET start_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [startTime, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      res.json({ message: "Timer started", start_time: startTime });
    }
  );
});

// Stop timer for session
app.post("/api/sessions/:id/stop", (req, res) => {
  const { id } = req.params;
  const endTime = new Date().toISOString();

  // First get the start time
  db.get("SELECT start_time FROM sessions WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row || !row.start_time) {
      res.status(400).json({ error: "Session not started or not found" });
      return;
    }

    const startTime = new Date(row.start_time);
    const endTimeDate = new Date(endTime);
    const duration = endTimeDate - startTime;

    db.run(
      "UPDATE sessions SET end_time = ?, duration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [endTime, duration, id],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: "Timer stopped",
          end_time: endTime,
          duration: duration,
        });
      }
    );
  });
});

// Update session
app.put("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  const { name, notes, tags } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const tagsJson = JSON.stringify(tags || []);

  db.run(
    "UPDATE sessions SET name = ?, notes = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, notes || "", tagsJson, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      res.json({ id, name, notes, tags: tags || [] });
    }
  );
});

// Delete session
app.delete("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM sessions WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json({ message: "Session deleted successfully" });
  });
});

// STATISTICS ROUTES

// Get statistics for a category
app.get("/api/categories/:categoryId/stats", (req, res) => {
  const { categoryId } = req.params;

  db.all(
    `SELECT duration, created_at FROM sessions 
     WHERE category_id = ? AND duration IS NOT NULL 
     ORDER BY created_at ASC`,
    [categoryId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (rows.length === 0) {
        res.json({
          average: 0,
          fastest: 0,
          slowest: 0,
          totalSessions: 0,
          progressData: [],
        });
        return;
      }

      const durations = rows.map((row) => row.duration);
      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      const fastest = Math.min(...durations);
      const slowest = Math.max(...durations);

      // Progress data for chart (last 10 sessions)
      const progressData = rows.slice(-10).map((row, index) => ({
        session: index + 1,
        duration: row.duration,
        date: row.created_at,
      }));

      res.json({
        average: Math.round(average),
        fastest,
        slowest,
        totalSessions: rows.length,
        progressData,
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nClosing database connection...");
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Database connection closed.");
    process.exit(0);
  });
});
