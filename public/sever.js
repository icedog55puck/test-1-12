const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('data.db');

// Create a table to store appointment data
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      start_time TEXT,
      end_time TEXT,
      FOREIGN KEY (user_id) REFERENCES users (user_id)
    )
  `);
});

// Insert a new appointment for a user
app.post('/createAppointment', (req, res) => {
  const { user_id, date, start_time, end_time } = req.body;
  db.run("INSERT INTO appointments (user_id, date, start_time, end_time) VALUES (?, ?, ?, ?)", [user_id, date, start_time, end_time], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).send('Appointment created successfully.');
  });
});

// Retrieve user's appointments
app.get('/userAppointments', (req, res) => {
  const user_id = req.query.user_id;
  db.all("SELECT * FROM appointments WHERE user_id = ?", [user_id], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
