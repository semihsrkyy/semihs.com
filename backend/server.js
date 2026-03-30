const express = require('express');
const cors = require('cors');
const config = require('../config/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/appointments', (req, res) => {
  res.json({ message: 'Fetch appointments' });
});

app.post('/api/appointments/track', (req, res) => {
  const { country, details } = req.body;
  res.json({ message: `Tracking appointment for ${country}`, status: 'success' });
});

app.post('/api/appointments/book', (req, res) => {
  const { userInfo, appointmentDetails } = req.body;
  res.json({ message: 'Booking appointment', status: 'pending' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});