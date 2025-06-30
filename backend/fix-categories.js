const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database setup
const dbPath = path.join(__dirname, "timer.db");
const db = new sqlite3.Database(dbPath);

console.log("Fixing session category assignments...");

db.serialize(() => {
  // Update Rubik's Cube sessions (sessions 3-7 should be in category 3)
  db.run(
    "UPDATE sessions SET category_id = 3 WHERE id IN (3, 4, 5, 6, 7)",
    (err) => {
      if (err) {
        console.error("Error updating Rubik's Cube sessions:", err);
      } else {
        console.log("Updated Rubik's Cube sessions to category 3");
      }
    }
  );

  // Update Coding Project sessions (sessions 8-12 should be in category 4)
  db.run(
    "UPDATE sessions SET category_id = 4 WHERE id IN (8, 9, 10, 11, 12)",
    (err) => {
      if (err) {
        console.error("Error updating Coding Project sessions:", err);
      } else {
        console.log("Updated Coding Project sessions to category 4");
      }
    }
  );

  // Update Fitness sessions (sessions 13-17 should be in category 5)
  db.run(
    "UPDATE sessions SET category_id = 5 WHERE id IN (13, 14, 15, 16, 17)",
    (err) => {
      if (err) {
        console.error("Error updating Fitness sessions:", err);
      } else {
        console.log("Updated Fitness sessions to category 5");
      }

      // Verify the changes
      setTimeout(() => {
        db.all(
          "SELECT id, category_id, name FROM sessions WHERE id >= 3",
          (err, sessions) => {
            if (err) {
              console.error("Error verifying sessions:", err);
            } else {
              console.log("\nVerification - Updated sessions:");
              sessions.forEach((session) => {
                console.log(
                  `Session ${session.id}: ${session.name} -> Category ${session.category_id}`
                );
              });
            }
            db.close();
          }
        );
      }, 100);
    }
  );
});
