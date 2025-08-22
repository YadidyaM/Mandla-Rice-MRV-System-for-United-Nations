/**
 * Satellite Data Routes
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateParams } from '../middleware/validation';
import { satelliteSchemas, commonSchemas } from '../middleware/validation';
import { SatelliteController } from '../controllers/SatelliteController';

const router = Router();
const satelliteController = new SatelliteController();

// Fetch satellite data for farm
router.post('/fetch',
  validateRequest(satelliteSchemas.fetch),
  asyncHandler(satelliteController.fetchSatelliteData.bind(satelliteController))
);

// Analyze satellite data
router.post('/analyze',
  validateRequest(satelliteSchemas.analyze),
  asyncHandler(satelliteController.analyzeSatelliteData.bind(satelliteController))
);

// Get satellite data for farm
router.get('/farm/:farmId',
  validateParams(Joi.object({ farmId: commonSchemas.id.required() })),
  asyncHandler(satelliteController.getFarmSatelliteData.bind(satelliteController))
);

export default router;
