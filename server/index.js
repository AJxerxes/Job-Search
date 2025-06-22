const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const jobSearchRoutes = require('./routes/jobSearch');
const { startPeriodicSearch } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobSearchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start periodic job search
  startPeriodicSearch();
});

module.exports = app; 