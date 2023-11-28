const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('data.db');

// Create a table to store user data
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    password TEXT
  )
`);

// Create a table to store appointment data
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
app.get('/appointment', (req, res) => {
  res.sendFile(__dirname + '/appointment_page.html');
});

// Handle setting an appointment
app.get('/setAppointment', (req, res) => {
  const { printer } = req.query;
  // You can use the printer value to set the appointment

  // For simplicity, let's just send a response indicating success
  res.status(200).send(`you are malking an appointment for 3D Printer : ${printer}`);
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
// Handle user registration
app.post('/register', (req, res) => {
  const { register_user_id, password } = req.body;

  // Check if the user already exists in the database
  db.get("SELECT * FROM users WHERE user_id = ?", [register_user_id], (err, row) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send(err.message);
    }

    if (row) {
      console.log('User already exists');
      return res.status(409).send('User already exists. Please choose a different User ID.');
    }

    // User does not exist, proceed to register
    db.run("INSERT INTO users (user_id, password) VALUES (?, ?)", [register_user_id, password], function (err) {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).send(err.message);
      }
      console.log('User registered successfully');
      res.status(201).send('User registered successfully.');
    });
  });
});

// Handle user login with password authentication
app.post('/login', (req, res) => {
  const { login_user_id, login_password } = req.body;

  console.log('Received login request:', login_user_id, login_password);

  // Check if the user exists in the database
  db.get("SELECT * FROM users WHERE user_id = ?", [login_user_id], (err, row) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send(err.message);
    }

    if (!row) {
      console.log('User not found');
      return res.status(404).send('User not found. Please sign up.');
    }

    // User exists, check password
    if (row.password !== login_password) {
      console.log('Incorrect password');
      return res.status(401).send('Incorrect password. Please try again.');
    }

    // Password is correct, redirect to reservation page
    res.redirect('/reservation.html');
  });
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
