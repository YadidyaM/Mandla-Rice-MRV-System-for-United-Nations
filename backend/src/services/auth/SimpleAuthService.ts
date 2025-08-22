/**
 * Simple In-Memory Authentication Service
 * This is a temporary solution until MongoDB is properly set up
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export interface SimpleUser {
  id: string;
  email: string;
  phone: string;
  password: string;
  profile: any;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export class SimpleAuthService {
  private users: Map<string, SimpleUser> = new Map();
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private userCounter: number = 1;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_here_change_in_production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    // Create a demo admin user
    this.createDemoUser();
  }

  private async createDemoUser() {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const demoUser: SimpleUser = {
      id: '1',
      email: 'admin@example.com',
      phone: '9876543210',
      password: hashedPassword,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        village: 'Mandla',
        block: 'Mandla',
        district: 'Mandla',
        state: 'Madhya Pradesh'
      },
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date()
    };
    
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);
    this.users.set(demoUser.phone, demoUser);
    
    logger.info('Demo admin user created: admin@example.com / password123');
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<SimpleUser> {
    try {
      // Check if user already exists
      if (this.users.has(data.email) || this.users.has(data.phone)) {
        throw new Error('User already exists with this email or phone');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create new user
      const userId = (++this.userCounter).toString();
      const user: SimpleUser = {
        id: userId,
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashedPassword,
        profile: data.profile,
        role: 'FARMER',
        isActive: true,
        createdAt: new Date()
      };

      // Store user by multiple keys for easy lookup
      this.users.set(userId, user);
      this.users.set(data.email.toLowerCase(), user);
      this.users.set(data.phone, user);

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
  async login(data: LoginData): Promise<{ user: SimpleUser; tokens: AuthTokens }> {
    try {
      // Find user by email or phone
      const user = this.users.get(data.email.toLowerCase()) || this.users.get(data.email);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.role);

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
  async getUserById(userId: string): Promise<SimpleUser | null> {
    try {
      return this.users.get(userId) || null;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Get all users (for debugging)
   */
  getAllUsers(): SimpleUser[] {
    const users: SimpleUser[] = [];
    for (const [key, user] of this.users.entries()) {
      if (key === user.id) { // Only add actual users, not lookup keys
        users.push(user);
      }
    }
    return users;
  }
}
