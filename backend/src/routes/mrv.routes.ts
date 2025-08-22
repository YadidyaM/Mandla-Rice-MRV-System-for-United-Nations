/**
 * MRV (Measurement, Reporting, Verification) Routes
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateParams } from '../middleware/validation';
import { mrvSchemas, commonSchemas } from '../middleware/validation';
import { MRVController } from '../controllers/MRVController';

const router = Router();
const mrvController = new MRVController();

// Start MRV process for a farm season
router.post('/process',
  validateRequest(mrvSchemas.calculate),
  asyncHandler(mrvController.processMRV.bind(mrvController))
);

// Get MRV reports
router.get('/reports',
  asyncHandler(mrvController.getMRVReports.bind(mrvController))
);

// Get specific MRV report
router.get('/reports/:id',
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  asyncHandler(mrvController.getMRVReport.bind(mrvController))
);

// Verify MRV report
router.post('/verify/:id',
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  validateRequest(mrvSchemas.verify),
  asyncHandler(mrvController.verifyMRVReport.bind(mrvController))
);

export default router;
