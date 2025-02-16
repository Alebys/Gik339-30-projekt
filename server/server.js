const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./gik339-30.db");
const express = require("express");
const server = express();

server
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
  });

server.get("/cars", (req, res) => {
  const sql = "SELECT * FROM cars";
  db.all(sql, (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send({ error: "Database error", details: err.message });
    }
    res.json(rows); 
  });
});
server.put("/cars/:id", (req, res) => {
  const { id } = req.params;
  const { brand, color, year } = req.body;

  if (!brand || !color || !year) {
    return res.status(400).send("Saknar namn, märke eller färg");
  }

  const sql = "UPDATE cars SET brand = ?, color = ?, year = ? WHERE id = ?";

  db.run(sql, [brand, color, year, id], function (err) {
    if (err) {
      return res.status(500).send("Fel vid uppdatering av bil: " + err.message);
    }

    if (this.changes === 0) {
      return res.status(404).send("Bilen hittas inte");
    }

    res.status(200).send({ brand, color, year, id });
  });
});

server.post("/cars", (req, res) => {
  const { brand, color, year } = req.body;

  console.log("Data received on server:", { brand, color, year });  
  if (!brand || !color || !year) {
    return res.status(400).json({ error: "Saknar märke, färg eller år" });
  }

  const sql = "INSERT INTO cars (brand, color, year) VALUES (?, ?, ?)";
  db.run(sql, [brand, color, year], function (err) {
    if (err) {
      console.error("Database Error:", err.message);  
      return res.status(500).json({ error: "Fel vid inmatning i databasen", details: err.message });
    }
    res.status(201).json({ id: this.lastID, brand, color, year });
  });
});

server.delete("/cars/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cars WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Fel vid borttagning av bil" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Bilen hittas inte" });
    }
    res.status(200).json({ message: "Bilen har raderats" });
  });
});

server.listen(3000, () => {
  console.log("Servern körs på http://localhost:3000");
});