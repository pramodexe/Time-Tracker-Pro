const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database setup
const dbPath = path.join(__dirname, "timer.db");
const db = new sqlite3.Database(dbPath);

// Sample data
const sampleCategories = [
  {
    name: "Rubik's Cube Practice",
    description:
      "Speed solving practice sessions for improving solve times and learning new algorithms",
  },
  {
    name: "Coding Projects",
    description:
      "Time tracking for software development work, debugging, and learning new technologies",
  },
  {
    name: "Fitness & Exercise",
    description:
      "Workout sessions, running, strength training, and other physical activities",
  },
];

const sampleSessions = [
  // Rubik's Cube Practice sessions (category_id: 1)
  {
    category_id: 1,
    name: "3x3 Speed Solve Session",
    duration: 45000, // 45 seconds
    notes: "Working on cross and F2L efficiency. Got a new personal record!",
    tags: ["3x3", "speed", "PB", "CFOP"],
  },
  {
    category_id: 1,
    name: "Algorithm Practice",
    duration: 120000, // 2 minutes
    notes: "Practicing OLL algorithms, focusing on recognition speed",
    tags: ["OLL", "algorithms", "practice", "recognition"],
  },
  {
    category_id: 1,
    name: "Blind Solve Attempt",
    duration: 180000, // 3 minutes
    notes: "First successful 3x3 blindfolded solve! Very slow but completed.",
    tags: ["blind", "3x3", "milestone", "BLD"],
  },
  {
    category_id: 1,
    name: "4x4 Practice",
    duration: 95000, // 1 minute 35 seconds
    notes: "Working on center building and edge pairing techniques",
    tags: ["4x4", "centers", "edges", "practice"],
  },
  {
    category_id: 1,
    name: "Competition Prep",
    duration: 67000, // 1 minute 7 seconds
    notes: "Practicing under pressure with timer. Good consistency today.",
    tags: ["competition", "pressure", "consistency", "3x3"],
  },

  // Coding Projects sessions (category_id: 2)
  {
    category_id: 2,
    name: "React Component Development",
    duration: 7200000, // 2 hours
    notes:
      "Built the user authentication modal with dark mode support. Implemented form validation.",
    tags: ["React", "frontend", "authentication", "modal"],
  },
  {
    category_id: 2,
    name: "API Endpoint Creation",
    duration: 5400000, // 1.5 hours
    notes:
      "Created REST endpoints for user management. Added proper error handling and validation.",
    tags: ["backend", "API", "REST", "validation"],
  },
  {
    category_id: 2,
    name: "Bug Fix - Database Query",
    duration: 3600000, // 1 hour
    notes:
      "Fixed N+1 query problem in user dashboard. Performance improved significantly.",
    tags: ["bug", "database", "performance", "optimization"],
  },
  {
    category_id: 2,
    name: "TypeScript Migration",
    duration: 4800000, // 1 hour 20 minutes
    notes:
      "Converted JavaScript components to TypeScript. Added proper type definitions.",
    tags: ["TypeScript", "migration", "types", "refactor"],
  },
  {
    category_id: 2,
    name: "Unit Testing",
    duration: 2700000, // 45 minutes
    notes:
      "Wrote comprehensive tests for authentication service. Coverage increased to 95%.",
    tags: ["testing", "unit tests", "coverage", "jest"],
  },

  // Fitness & Exercise sessions (category_id: 3)
  {
    category_id: 3,
    name: "Morning Run",
    duration: 1800000, // 30 minutes
    notes:
      "5K run around the neighborhood. Good pace, felt energized throughout.",
    tags: ["cardio", "running", "5K", "morning"],
  },
  {
    category_id: 3,
    name: "Strength Training - Upper Body",
    duration: 2700000, // 45 minutes
    notes:
      "Chest, shoulders, and triceps workout. Increased bench press weight by 5 lbs.",
    tags: ["strength", "upper body", "bench press", "weights"],
  },
  {
    category_id: 3,
    name: "Yoga Session",
    duration: 3600000, // 1 hour
    notes:
      "Vinyasa flow class. Focused on flexibility and mindfulness. Very relaxing.",
    tags: ["yoga", "flexibility", "mindfulness", "vinyasa"],
  },
  {
    category_id: 3,
    name: "HIIT Workout",
    duration: 1200000, // 20 minutes
    notes:
      "High intensity interval training. Burpees, mountain climbers, jumping jacks.",
    tags: ["HIIT", "cardio", "intense", "bodyweight"],
  },
  {
    category_id: 3,
    name: "Leg Day",
    duration: 3300000, // 55 minutes
    notes:
      "Squats, deadlifts, lunges. Challenging but effective workout. Legs are tired!",
    tags: ["strength", "legs", "squats", "deadlifts"],
  },
];

// Function to insert sample data
function insertSampleData() {
  db.serialize(() => {
    console.log("Adding additional sample categories and sessions...");

    // Insert additional categories
    const categoryStmt = db.prepare(
      "INSERT INTO categories (name, description) VALUES (?, ?)"
    );

    sampleCategories.forEach((category, index) => {
      categoryStmt.run(category.name, category.description, function (err) {
        if (err) {
          console.error("Error inserting category:", err);
        } else {
          console.log(
            `Inserted category: ${category.name} (ID: ${this.lastID})`
          );
        }
      });
    });

    categoryStmt.finalize();

    // Insert sessions after categories are inserted
    setTimeout(() => {
      console.log("Inserting sample sessions...");

      // First, get the current max category_id to adjust our sample sessions
      db.get("SELECT MAX(id) as maxId FROM categories", (err, row) => {
        if (err) {
          console.error("Error getting max category ID:", err);
          return;
        }

        const categoryOffset = row.maxId - 2; // Adjust for new category IDs

        const sessionStmt = db.prepare(`
          INSERT INTO sessions (category_id, name, duration, notes, tags) 
          VALUES (?, ?, ?, ?, ?)
        `);

        sampleSessions.forEach((session) => {
          sessionStmt.run(
            session.category_id + categoryOffset,
            session.name,
            session.duration,
            session.notes,
            JSON.stringify(session.tags),
            function (err) {
              if (err) {
                console.error("Error inserting session:", err);
              } else {
                console.log(
                  `Inserted session: ${session.name} (ID: ${this.lastID})`
                );
              }
            }
          );
        });

        sessionStmt.finalize();

        setTimeout(() => {
          console.log("Sample data insertion completed!");
          db.close();
        }, 100);
      });
    }, 500);
  });
}

// Run the insertion
insertSampleData();
