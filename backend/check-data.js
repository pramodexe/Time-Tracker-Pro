const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database setup
const dbPath = path.join(__dirname, "timer.db");
const db = new sqlite3.Database(dbPath);

console.log("Checking current database content...");

db.serialize(() => {
  // Check categories
  db.all("SELECT * FROM categories", (err, categories) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return;
    }

    console.log("\n=== CURRENT CATEGORIES ===");
    if (categories.length === 0) {
      console.log("No categories found.");
    } else {
      categories.forEach((cat) => {
        console.log(
          `ID: ${cat.id}, Name: ${cat.name}, Description: ${cat.description}`
        );
      });
    }

    // Check sessions
    db.all("SELECT * FROM sessions", (err, sessions) => {
      if (err) {
        console.error("Error fetching sessions:", err);
        return;
      }

      console.log("\n=== CURRENT SESSIONS ===");
      if (sessions.length === 0) {
        console.log("No sessions found.");
      } else {
        sessions.forEach((session) => {
          console.log(
            `ID: ${session.id}, Category: ${session.category_id}, Name: ${session.name}, Duration: ${session.duration}ms`
          );
        });
      }

      db.close();
    });
  });
});
