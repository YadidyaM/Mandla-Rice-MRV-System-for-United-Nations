/**
 * Extended Express Request types for Mandla Rice MRV System
 */

import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
