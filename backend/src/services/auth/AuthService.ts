/**
 * Authentication Service using MongoDB
 */

import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User';
import { logger } from '../../utils/logger';

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    village: string;
    block: string;
    [key: string]: any;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_here_change_in_production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: data.email }, { phone: data.phone }]
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new Error('Email already registered');
        }
        if (existingUser.phone === data.phone) {
          throw new Error('Phone number already registered');
        }
      }

      // Create new user
      const user = new User({
        email: data.email,
        phone: data.phone,
        password: data.password,
        profile: data.profile,
        role: 'FARMER'
      });

      await user.save();
      logger.info(`New user registered: ${user.email}`);

      return user;
    } catch (error: any) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<{ user: IUser; tokens: AuthTokens }> {
    try {
      // Find user by email or phone
      const user = await User.findOne({
        $or: [
          { email: data.email.toLowerCase() },
          { phone: data.email } // Allow login with phone number
        ]
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(data.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user._id.toString(), user.role);

      logger.info(`User logged in: ${user.email}`);

      return { user, tokens };
    } catch (error: any) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, role: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<IUser['profile']>): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { profile: profileData } },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`Profile updated for user: ${user.email}`);
      return user;
    } catch (error: any) {
      logger.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error: any) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const accessToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      return { accessToken };
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
}
