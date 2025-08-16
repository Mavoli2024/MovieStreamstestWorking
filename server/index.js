const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Simple API routes for testing
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    authenticated: false,
    message: 'Basic server running - authentication will be added next',
    timestamp: new Date().toISOString()
  });
});

// Mock auth endpoint for now
app.get('/api/auth/user', (req, res) => {
  res.status(401).json({ message: 'Not authenticated - login system coming soon' });
});

// Mock movies endpoint
app.get('/api/movies', (req, res) => {
  res.status(401).json({ message: 'Please sign in to access movies' });
});

// Login redirect (temporary)
app.get('/api/login', (req, res) => {
  res.json({ 
    message: 'Authentication system is being set up',
    status: 'coming_soon'
  });
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Madifa Streaming Server running on port ${port}`);
  console.log(`🔐 Basic API endpoints ready`);
  console.log(`🎬 Visit http://0.0.0.0:${port} to access your streaming app`);
  console.log(`📡 Status: http://0.0.0.0:${port}/api/status`);
});