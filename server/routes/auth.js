const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

// Secret passcodes (in production, use environment variables)
const MEMBERSHIP_PASSCODE = process.env.MEMBERSHIP_PASSCODE;
const ADMIN_PASSCODE = process.env.ADMIN_PASSWORD;

// Custom validator for confirm password
const validateConfirmPassword = (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  }
  return true;
};

// Sign up route
router.post('/signup', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom(validateConfirmPassword),
  body('adminCode').optional().trim()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, adminCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if admin code is provided and correct
    const isAdmin = adminCode === ADMIN_PASSCODE;

    // Create user (not a member by default)
    const user = await User.create(firstName, lastName, email, password, isAdmin);

    // Auto-login after signup
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after signup' });
      }
      res.status(201).json({ 
        message: 'Signup successful',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          isMember: user.is_member,
          isAdmin: user.is_admin
        }
      });
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in' });
        }
        res.json({ 
          message: 'Login successful',
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            isMember: user.is_member,
            isAdmin: user.is_admin
          }
        });
      });
    })(req, res, next);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        email: req.user.email,
        isMember: req.user.is_member,
        isAdmin: req.user.is_admin
      }
    });
  } else {
    res.json({ user: null });
  }
});

// Join club (become a member)
router.post('/join-club', [
  body('passcode').trim().notEmpty().withMessage('Passcode is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Must be logged in to join the club' });
    }

    const { passcode } = req.body;

    if (passcode !== MEMBERSHIP_PASSCODE) {
      return res.status(400).json({ message: 'Incorrect passcode' });
    }

    const updatedUser = await User.updateMembership(req.user.id, true);

    res.json({ 
      message: 'Welcome to the club!',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        isMember: updatedUser.is_member,
        isAdmin: updatedUser.is_admin
      }
    });
  } catch (err) {
    console.error('Join club error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Become admin
router.post('/become-admin', [
  body('passcode').trim().notEmpty().withMessage('Passcode is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Must be logged in to become admin' });
    }

    const { passcode } = req.body;

    if (passcode !== ADMIN_PASSCODE) {
      return res.status(400).json({ message: 'Incorrect passcode' });
    }

    const updatedUser = await User.updateAdmin(req.user.id, true);

    res.json({ 
      message: 'You are now an admin!',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        isMember: updatedUser.is_member,
        isAdmin: updatedUser.is_admin
      }
    });
  } catch (err) {
    console.error('Become admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
