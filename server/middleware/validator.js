const { ValidationError } = require('../errors/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function validateCreateGroup(req, res, next) {
  const { name, amount, adminEmail, billingDay, members } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Circle name is required and must be non-empty');
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Amount must be a positive number greater than 0');
  }

  if (!adminEmail || !isValidEmail(adminEmail)) {
    errors.push('A valid admin email address is required');
  }

  if (billingDay !== undefined) {
    const day = parseInt(billingDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      errors.push('Billing day must be an integer between 1 and 31');
    }
  }

  if (members !== undefined) {
    if (!Array.isArray(members)) {
      errors.push('Members must be an array');
    } else {
      members.forEach((m, idx) => {
        if (!m.name || typeof m.name !== 'string' || m.name.trim().length === 0) {
          errors.push(`Member #${idx + 1} name is required`);
        }
        if (!m.email || !isValidEmail(m.email)) {
          errors.push(`Member #${idx + 1} (${m.name || 'unnamed'}) must have a valid email address`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError('Validation failed for circle payload', errors));
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.adminEmail = adminEmail.trim().toLowerCase();
  req.body.amount = parsedAmount;
  req.body.billingDay = billingDay ? parseInt(billingDay, 10) : 1;
  if (Array.isArray(req.body.members)) {
    req.body.members = req.body.members.map(m => ({
      ...m,
      name: m.name.trim(),
      email: m.email.trim().toLowerCase()
    }));
  }

  next();
}

function validateUpdateGroup(req, res, next) {
  const { name, amount, adminEmail, billingDay, members } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.push('Circle name cannot be empty');
  }

  if (amount !== undefined) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.push('Amount must be a positive number greater than 0');
    } else {
      req.body.amount = parsedAmount;
    }
  }

  if (adminEmail !== undefined && !isValidEmail(adminEmail)) {
    errors.push('Invalid admin email format');
  }

  if (billingDay !== undefined) {
    const day = parseInt(billingDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      errors.push('Billing day must be between 1 and 31');
    } else {
      req.body.billingDay = day;
    }
  }

  if (members !== undefined) {
    if (!Array.isArray(members)) {
      errors.push('Members must be an array');
    } else {
      members.forEach((m, idx) => {
        if (!m.name || typeof m.name !== 'string' || m.name.trim().length === 0) {
          errors.push(`Member #${idx + 1} name is required`);
        }
        if (!m.email || !isValidEmail(m.email)) {
          errors.push(`Member #${idx + 1} (${m.name || 'unnamed'}) must have a valid email address`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError('Validation failed for circle update', errors));
  }

  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.adminEmail) req.body.adminEmail = req.body.adminEmail.trim().toLowerCase();
  if (Array.isArray(req.body.members)) {
    req.body.members = req.body.members.map(m => ({
      ...m,
      name: m.name.trim(),
      email: m.email.trim().toLowerCase()
    }));
  }

  next();
}

function validateTestEmail(req, res, next) {
  const { to } = req.body;
  if (!to || !isValidEmail(to)) {
    return next(new ValidationError('A valid recipient "to" email address is required'));
  }
  req.body.to = to.trim().toLowerCase();
  next();
}

module.exports = {
  validateCreateGroup,
  validateUpdateGroup,
  validateTestEmail
};
