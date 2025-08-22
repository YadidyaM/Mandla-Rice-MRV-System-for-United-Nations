/**
 * Notification Routes
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateParams } from '../middleware/validation';
import { commonSchemas } from '../middleware/validation';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();
const notificationController = new NotificationController();

// Get notifications for user
router.get('/',
  asyncHandler(notificationController.getNotifications.bind(notificationController))
);

// Mark notification as read
router.patch('/:id/read',
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  asyncHandler(notificationController.markAsRead.bind(notificationController))
);

// Mark all notifications as read
router.patch('/read-all',
  asyncHandler(notificationController.markAllAsRead.bind(notificationController))
);

export default router;
