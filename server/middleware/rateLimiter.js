const rateLimit = require('express-rate-limit');

// General rate limiter for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter rate limiter for sensitive endpoints (email dispatch, test email)
const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 email actions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many email requests dispatched. Please wait 15 minutes before sending more.'
  }
});

module.exports = {
  apiLimiter,
  emailActionLimiter
};
