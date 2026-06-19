require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initializeDatabase } = require('./db');
const taskRoutes = require('../../interfaces/routes/task-routes');
const app = express();

const uploadsDir = path.join(__dirname, '..', '..', '..', 'public', 'uploads');

// Initialize database
initializeDatabase();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve generated images from backend/public/uploads
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/v1', taskRoutes);

// Basic Error Handling (for unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT);

server.on('listening', () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});


module.exports = app;
