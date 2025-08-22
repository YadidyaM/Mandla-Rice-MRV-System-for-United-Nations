import { Router } from 'express';
import { UNDPController } from '../controllers/UNDPController';
import { validateRequest } from '../middleware/validation';
import { undpSchemas } from '../middleware/validation';

const router = Router();
const undpController = new UNDPController();

/**
 * @route GET /api/v1/undp/context
 * @desc Get socio-economic context for MRV calculations
 * @access Public
 */
router.get('/context', undpController.getSocioEconomicContext);

/**
 * @route GET /api/v1/undp/country/:year?
 * @desc Get country data for India (default: current year)
 * @access Public
 */
router.get('/country/:year?', undpController.getCountryData);

/**
 * @route GET /api/v1/undp/indicators
 * @desc Get available indicators metadata
 * @access Public
 */
router.get('/indicators', undpController.getAvailableIndicators);

/**
 * @route GET /api/v1/undp/countries
 * @desc Get available countries metadata
 * @access Public
 */
router.get('/countries', undpController.getAvailableCountries);

/**
 * @route GET /api/v1/undp/composite/:year?
 * @desc Get composite indices for India
 * @access Public
 */
router.get('/composite/:year?', undpController.getCompositeIndices);

export default router;
