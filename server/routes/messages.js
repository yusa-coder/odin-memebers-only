const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated, ensureMember, ensureAdmin } = require('../middleware/auth');

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.getAll();
    
    // If user is logged in and is a member or admin, show author info
    const isMember = req.isAuthenticated() && (req.user.is_member || req.user.is_admin);
    const isAdmin = req.isAuthenticated() && req.user.is_admin;
    
    const sanitizedMessages = messages.map(msg => {
      // Everyone can see title, text, and date
      const sanitized = {
        id: msg.id,
        title: msg.title,
        text: msg.text,
        createdAt: msg.created_at
      };
      
      // Only members and admins can see author info
      if (isMember) {
        sanitized.author = {
          firstName: msg.first_name,
          lastName: msg.last_name,
          email: msg.email
        };
      } else {
        sanitized.author = null; // Hidden for non-members
      }
      
      // Only admins can delete
      if (isAdmin) {
        sanitized.canDelete = true;
      }
      
      return sanitized;
    });
    
    res.json({ messages: sanitizedMessages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new message (requires login)
router.post('/', ensureAuthenticated, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('text').trim().notEmpty().withMessage('Message text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, text } = req.body;
    const message = await Message.create(title, text, req.user.id);
    
    res.status(201).json({ 
      message: 'Message created',
      data: message
    });
  } catch (err) {
    console.error('Create message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message (admin only)
router.delete('/:id', ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted', data: deleted });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
