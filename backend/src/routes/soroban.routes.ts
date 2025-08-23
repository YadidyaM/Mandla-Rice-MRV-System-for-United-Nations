/**
 * Soroban Blockchain Routes for Equitable Finance
 * Provides API endpoints for carbon credit operations on Stellar blockchain
 */

import { Router, Request, Response } from 'express';
import { SorobanService } from '../services/blockchain/SorobanService';
import { logger } from '../utils/logger';

const router = Router();
const sorobanService = new SorobanService();

// Initialize Soroban service on startup
sorobanService.initialize().catch(error => {
  logger.error('Failed to initialize Soroban service:', error);
});

/**
 * @route   GET /api/soroban/health
 * @desc    Get Soroban service health status
 * @access  Public
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = sorobanService.getHealthStatus();
    res.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Soroban health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Soroban service health',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/mint
 * @desc    Mint carbon credits for a farmer (equitable finance core function)
 * @access  Private (MRV System)
 */
router.post('/mint', async (req: Request, res: Response) => {
  try {
    const {
      farmerAddress,
      farmId,
      seasonId,
      carbonAmount,
      verificationLevel,
      methodology,
      vintage,
      reportHash,
      coordinates,
      metadata
    } = req.body;

    // Validate required fields
    if (!farmerAddress || !farmId || !seasonId || !carbonAmount || !verificationLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for carbon credit minting',
        required: ['farmerAddress', 'farmId', 'seasonId', 'carbonAmount', 'verificationLevel']
      });
    }

    // Mint carbon credits via Soroban
    const result = await sorobanService.mintCarbonCredit({
      farmerAddress,
      farmId,
      seasonId,
      carbonAmount,
      verificationLevel,
      methodology: methodology || 'IPCC 2019',
      vintage: vintage || new Date().getFullYear(),
      reportHash: reportHash || '',
      coordinates: coordinates || [],
      metadata: metadata || {}
    });

    res.json({
      success: true,
      message: 'Carbon credits minted successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Carbon credit minting failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mint carbon credits',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/list-for-sale
 * @desc    List carbon credits for sale on marketplace
 * @access  Private (Farmer)
 */
router.post('/list-for-sale', async (req: Request, res: Response) => {
  try {
    const {
      creditId,
      pricePerTon,
      sellerAddress
    } = req.body;

    // Validate required fields
    if (!creditId || !pricePerTon || !sellerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for listing',
        required: ['creditId', 'pricePerTon', 'sellerAddress']
      });
    }

    // List credit for sale
    const result = await sorobanService.listForSale({
      creditId,
      pricePerTon,
      sellerAddress
    });

    res.json({
      success: true,
      message: 'Carbon credit listed for sale successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Credit listing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list carbon credit for sale',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/buy
 * @desc    Buy carbon credits from marketplace
 * @access  Private (Buyer)
 */
router.post('/buy', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      buyerAddress,
      amount,
      pricePerTon
    } = req.body;

    // Validate required fields
    if (!orderId || !buyerAddress || !amount || !pricePerTon) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for purchase',
        required: ['orderId', 'buyerAddress', 'amount', 'pricePerTon']
      });
    }

    // Buy carbon credits
    const result = await sorobanService.buyCarbonCredits({
      orderId,
      buyerAddress,
      amount,
      pricePerTon
    });

    res.json({
      success: true,
      message: 'Carbon credits purchased successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Credit purchase failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase carbon credits',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/retire
 * @desc    Retire carbon credits (permanent removal)
 * @access  Private (Credit Owner)
 */
router.post('/retire', async (req: Request, res: Response) => {
  try {
    const {
      creditId,
      amount,
      retirementReason,
      ownerAddress
    } = req.body;

    // Validate required fields
    if (!creditId || !amount || !retirementReason || !ownerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for retirement',
        required: ['creditId', 'amount', 'retirementReason', 'ownerAddress']
      });
    }

    // Retire carbon credits
    const result = await sorobanService.retireCredits({
      creditId,
      amount,
      retirementReason,
      ownerAddress
    });

    res.json({
      success: true,
      message: 'Carbon credits retired successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Credit retirement failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retire carbon credits',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/soroban/credit/:creditId
 * @desc    Get carbon credit details
 * @access  Public
 */
router.get('/credit/:creditId', async (req: Request, res: Response) => {
  try {
    const { creditId } = req.params;

    if (!creditId) {
      return res.status(400).json({
        success: false,
        error: 'Credit ID is required'
      });
    }

    // Get credit details
    const credit = await sorobanService.getCarbonCredit(creditId);

    if (!credit) {
      return res.status(404).json({
        success: false,
        error: 'Carbon credit not found'
      });
    }

    res.json({
      success: true,
      data: credit,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get credit details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get carbon credit details',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/soroban/stats
 * @desc    Get contract statistics for transparency
 * @access  Public
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get contract statistics
    const stats = await sorobanService.getContractStats();

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Contract statistics not available'
      });
    }

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get contract stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contract statistics',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/admin/update-settings
 * @desc    Update market settings (admin only)
 * @access  Private (Admin)
 */
router.post('/admin/update-settings', async (req: Request, res: Response) => {
  try {
    const {
      marketOpen,
      minVerificationLevel,
      adminAddress
    } = req.body;

    // Validate required fields
    if (marketOpen === undefined || !minVerificationLevel || !adminAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for settings update',
        required: ['marketOpen', 'minVerificationLevel', 'adminAddress']
      });
    }

    // Update market settings
    const result = await sorobanService.updateMarketSettings({
      marketOpen,
      minVerificationLevel,
      adminAddress
    });

    res.json({
      success: true,
      message: 'Market settings updated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Market settings update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market settings',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/admin/pause
 * @desc    Emergency pause market (admin only)
 * @access  Private (Admin)
 */
router.post('/admin/pause', async (req: Request, res: Response) => {
  try {
    const { adminAddress } = req.body;

    if (!adminAddress) {
      return res.status(400).json({
        success: false,
        error: 'Admin address is required'
      });
    }

    // Pause market
    const result = await sorobanService.pauseMarket(adminAddress);

    res.json({
      success: true,
      message: 'Market paused successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Market pause failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause market',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/soroban/admin/resume
 * @desc    Resume market operations (admin only)
 * @access  Private (Admin)
 */
router.post('/admin/resume', async (req: Request, res: Response) => {
  try {
    const { adminAddress } = req.body;

    if (!adminAddress) {
      return res.status(400).json({
        success: false,
        error: 'Admin address is required'
      });
    }

    // Resume market
    const result = await sorobanService.resumeMarket(adminAddress);

    res.json({
      success: true,
      message: 'Market resumed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Market resume failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume market',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
