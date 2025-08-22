/**
 * Authentication Middleware for Mandla Rice MRV System
 * TODO: Replace with proper JWT authentication
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Implement proper JWT authentication
    // For now, we'll use a simple header-based approach for development
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // For development, create a temporary user if none exists
      let user = await prisma.user.findFirst();
      
      if (!user) {
        // Create a default user for development
        user = await prisma.user.create({
          data: {
            email: 'farmer@example.com',
            phone: '9876543210',
            role: 'FARMER',
            isActive: true,
            profile: {
              create: {
                firstName: 'Demo',
                lastName: 'Farmer',
                language: 'hi',
                village: 'Mandla',
                block: 'Mandla',
                district: 'Mandla',
                state: 'Madhya Pradesh',
                tribalGroup: 'Gond',
                isMarginalised: false,
                irrigationAccess: true,
                hasSmartphone: true,
                preferredContact: 'WHATSAPP'
              }
            }
          }
        });
      }
      
      req.user = user;
      next();
      return;
    }
    
    // TODO: Validate JWT token and get user
    // const token = authHeader.replace('Bearer ', '');
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    // For now, just get the first user
    const user = await prisma.user.findFirst();
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }
  next();
};
