/**
 * Carbon Credit Routes
 */

import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateParams } from '../middleware/validation';
import { carbonCreditSchemas, commonSchemas } from '../middleware/validation';
import { CarbonCreditController } from '../controllers/CarbonCreditController';

const router = Router();
const carbonCreditController = new CarbonCreditController();

// Get carbon credits
router.get('/',
  asyncHandler(carbonCreditController.getCarbonCredits.bind(carbonCreditController))
);

// Issue carbon credit
router.post('/issue',
  validateRequest(carbonCreditSchemas.issue),
  asyncHandler(carbonCreditController.issueCarbonCredit.bind(carbonCreditController))
);

// Create batch
router.post('/batch',
  validateRequest(carbonCreditSchemas.batch),
  asyncHandler(carbonCreditController.createBatch.bind(carbonCreditController))
);

// Get specific carbon credit
router.get('/:id',
  validateParams(Joi.object({ id: commonSchemas.id.required() })),
  asyncHandler(carbonCreditController.getCarbonCredit.bind(carbonCreditController))
);

export default router;
