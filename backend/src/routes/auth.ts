import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateRequest, loginSchema } from '../middleware/validation.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Login endpoint
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req: AuthRequest, res) => {
  res.json({
    user: {
      _id: req.user?._id,
      username: req.user?.username,
      role: req.user?.role,
      createdAt: req.user?.createdAt
    }
  });
});

export default router;