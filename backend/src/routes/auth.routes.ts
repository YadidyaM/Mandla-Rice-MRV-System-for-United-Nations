/**
 * Authentication Routes
 */

import express from 'express';
import { SimpleAuthService } from '../services/auth/SimpleAuthService';
import { logger } from '../utils/logger';

const router = express.Router();
const authService = new SimpleAuthService();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, profile } = req.body;

    // Validate required fields
    if (!email || !phone || !password || !profile) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          details: 'Email, phone, password, and profile are required'
        }
      });
    }

    // Validate profile fields
    if (!profile.firstName || !profile.lastName || !profile.village || !profile.block) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required profile fields',
          details: 'First name, last name, village, and block are required'
        }
      });
    }

    const user = await authService.register({
      email,
      phone,
      password,
      profile
    });

    // Generate tokens for immediate login
    const tokens = await authService.login({ email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens
      }
    });

  } catch (error: any) {
    logger.error('Registration error:', error);
    
    if (error.message.includes('already registered')) {
      return res.status(409).json({
        success: false,
        error: {
          message: error.message,
          code: 'USER_EXISTS'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
        details: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required'
        }
      });
    }

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });

  } catch (error: any) {
    logger.error('Login error:', error);
    
    if (error.message.includes('Invalid credentials') || error.message.includes('not found')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    if (error.message.includes('deactivated')) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        details: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required'
        }
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });

  } catch (error: any) {
    logger.error('Token refresh error:', error);
    
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      }
    });
  }
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', async (req: any, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'MISSING_TOKEN'
        }
      });
    }

    const { userId } = await authService.verifyToken(token);
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    logger.error('Profile fetch error:', error);
    
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch profile',
        details: error.message
      }
    });
  }
});

export default router;
