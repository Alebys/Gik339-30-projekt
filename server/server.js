// Importerar sqlite3 och skapar en databasanslutning
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./gik339-30.db");

// Importerar Express och skapar en serverinstans
const express = require("express");
const server = express();

// Middleware för att hantera JSON och URL-enkodad data samt CORS-headers
server
  .use(express.json()) // Hanterar JSON-data
  .use(express.urlencoded({ extended: false })) // Hanterar URL-enkodad data
  .use((req, res, next) => {
    // Tillåter alla ursprung (CORS) för alla metoder
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next(); // Fortsätt till nästa middleware
  });

// Route för att hämta alla bilar från databasen
server.get("/cars", (req, res) => {
  const sql = "SELECT * FROM cars"; // SQL-fråga för att hämta alla bilar
  db.all(sql, (err, rows) => {
    if (err) {
      // Om ett fel uppstår vid databasanropet
      console.error("Database error:", err.message);
      return res.status(500).send({ error: "Database error", details: err.message });
    }
    res.json(rows); // Skickar tillbaka alla bilar som JSON
  });
});

// Route för att uppdatera en bil i databasen
server.put("/cars/:id", (req, res) => {
  const { id } = req.params; // Hämtar id från URL-parametern
  const { brand, color, year } = req.body; // Hämtar data från request body

  // Om någon fält saknas, returneras ett felmeddelande
  if (!brand || !color || !year) {
    return res.status(400).send("Saknar namn, märke eller färg");
  }

  const sql = "UPDATE cars SET brand = ?, color = ?, year = ? WHERE id = ?"; // SQL-fråga för att uppdatera en bil

  db.run(sql, [brand, color, year, id], function (err) {
    if (err) {
      // Om ett fel uppstår vid uppdateringen
      return res.status(500).send("Fel vid uppdatering av bil: " + err.message);
    }

    if (this.changes === 0) {
      // Om ingen bil ändrades (t.ex. om bilens id inte finns)
      return res.status(404).send("Bilen hittas inte");
    }

    // Skickar tillbaka den uppdaterade bilen
    res.status(200).send({ brand, color, year, id });
  });
});

// Route för att lägga till en ny bil i databasen
server.post("/cars", (req, res) => {
  const { brand, color, year } = req.body; // Hämtar data från request body

  console.log("Data received on server:", { brand, color, year }); // Skriver ut datan som tas emot

  // Om någon fält saknas, returneras ett felmeddelande
  if (!brand || !color || !year) {
    return res.status(400).json({ error: "Saknar märke, färg eller år" });
  }

  const sql = "INSERT INTO cars (brand, color, year) VALUES (?, ?, ?)"; // SQL-fråga för att lägga till en ny bil
  db.run(sql, [brand, color, year], function (err) {
    if (err) {
      // Om ett fel uppstår vid inmatningen
      console.error("Databas Error:", err.message);
      return res.status(500).json({ error: "Fel vid inmatning i databasen", details: err.message });
    }
    // Skickar tillbaka den nyligen skapade bilen med det unika id:t
    res.status(201).json({ id: this.lastID, brand, color, year });
  });
});

// Route för att ta bort en bil från databasen
server.delete("/cars/:id", (req, res) => {
  const { id } = req.params; // Hämtar id från URL-parametern
  const sql = "DELETE FROM cars WHERE id = ?"; // SQL-fråga för att ta bort en bil
  db.run(sql, [id], function (err) {
    if (err) {
      // Om ett fel uppstår vid borttagningen
      return res.status(500).json({ error: "Fel vid borttagning av bil" });
    }
    if (this.changes === 0) {
      // Om ingen bil togs bort (t.ex. om bilens id inte finns)
      return res.status(404).json({ error: "Bilen hittas inte" });
    }
    // Skickar tillbaka ett meddelande om att bilen raderades
    res.status(200).json({ message: "Bilen har raderats" });
  });
});

// Startar servern på port 3000
server.listen(3000, () => {
  console.log("Servern körs på http://localhost:3000"); 
});