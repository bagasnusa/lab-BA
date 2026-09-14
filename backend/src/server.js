const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('./data/db');
const authRoutes = require('./routes/authRoutes');
const labRoutes = require('./routes/labRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbLabel = process.env.NODE_ENV === 'production'
    ? 'TiDB Cloud (Production)'
    : 'MySQL Laragon (Local)';
  res.json({
    status: 'OK',
    database: db.isConnected ? `${dbLabel} Connected` : 'Fallback (JSON)',
    timestamp: new Date().toISOString(),
    service: 'LAB TI Polinema Backend Service'
  });
});

// Fallback to frontend index.html for Single Page App routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Initialize database & Start Server
async function startServer() {
  await db.initMysql();

  const server = app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 LAB ILKOM Server is running at http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${frontendPath}`);
    console.log(`🔌 API Endpoints: http://localhost:${PORT}/api/`);
    console.log(`🗄️ Database: ${db.isConnected ? 'MySQL (Laragon Connected: db_lab_ilkom)' : 'Fallback JSON (Nyalakan Laragon untuk MySQL)'}`);
    console.log('====================================================');
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
