const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const securityHeaders = require('./middleware/security');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const statusController = require('./controllers/statusController');

const app = express();

// 1. Security Headers
app.use(securityHeaders);

// 2. CORS & Body Parsers
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. HTTP Request Logging & Metrics
app.use(requestLogger);

// 4. Root Healthcheck (High-availability ping endpoint)
app.get(['/health', '/api/health'], statusController.getHealth);

// 5. Rate-Limited API Routes
app.use('/api', apiLimiter, apiRoutes);

// 6. Serve Production Frontend Client
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// 7. SPA Fallback / 404 Handling
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }

  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 60px 20px;">
          <h2 style="font-weight: 600;">99subcircle API is Running 🚀</h2>
          <p style="color: #666; font-size: 14px;">Frontend assets are currently compiling or running via Vite dev server.</p>
        </div>
      `);
    }
  });
});

// 8. Centralized Error Handler Middleware (Always last)
app.use(errorHandler);

module.exports = app;
