/**
 * Admin Routes - Comprehensive System Administration
 * UN Climate Challenge 2024
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Dashboard and Overview
router.get('/dashboard',
  asyncHandler(adminController.getDashboard.bind(adminController))
);

router.get('/stats',
  asyncHandler(adminController.getSystemStats.bind(adminController))
);

// User Management
router.get('/users',
  asyncHandler(adminController.getUsers.bind(adminController))
);

router.put('/users/:userId',
  asyncHandler(adminController.updateUser.bind(adminController))
);

// Farm Management
router.get('/farms',
  asyncHandler(adminController.getFarms.bind(adminController))
);

// Carbon Credit Management
router.get('/carbon-credits',
  asyncHandler(adminController.getCarbonCredits.bind(adminController))
);

// Transaction Management
router.get('/transactions',
  asyncHandler(adminController.getTransactions.bind(adminController))
);

// System Monitoring
router.get('/system/health',
  asyncHandler(adminController.getSystemHealth.bind(adminController))
);

router.get('/system/blockchain',
  asyncHandler(adminController.getBlockchainStatus.bind(adminController))
);

// Audit and Compliance
router.get('/audit-logs',
  asyncHandler(adminController.getAuditLogs.bind(adminController))
);

// Data Export
router.get('/export/:type',
  asyncHandler(adminController.exportData.bind(adminController))
);

export default router;
