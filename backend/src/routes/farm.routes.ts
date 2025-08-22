/**
 * Farm Management Routes for Mandla Rice MRV System
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateParams } from '../middleware/validation';
import { farmSchemas, commonSchemas } from '../middleware/validation';
import { FarmController } from '../controllers/FarmController';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();
const farmController = new FarmController();

// Get all farms for authenticated user
router.get('/',
  authMiddleware,
  requireAuth,
  asyncHandler(farmController.getFarms.bind(farmController))
);

// Create new farm
router.post('/',
  authMiddleware,
  requireAuth,
  validateRequest(farmSchemas.create),
  asyncHandler(farmController.createFarm.bind(farmController))
);

// Get specific farm
router.get('/:id',
  authMiddleware,
  requireAuth,
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  asyncHandler(farmController.getFarm.bind(farmController))
);

// Update farm
router.put('/:id',
  authMiddleware,
  requireAuth,
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  validateRequest(farmSchemas.update),
  asyncHandler(farmController.updateFarm.bind(farmController))
);

// Delete farm
router.delete('/:id',
  authMiddleware,
  requireAuth,
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  asyncHandler(farmController.deleteFarm.bind(farmController))
);

// Get farming seasons for a farm
router.get('/:id/seasons',
  authMiddleware,
  requireAuth,
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  asyncHandler(farmController.getFarmSeasons.bind(farmController))
);

export default router;
