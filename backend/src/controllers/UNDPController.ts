import { Request, Response } from 'express';
import { UNDPService } from '../services/undp/UNDPService';
import { logger } from '../utils/logger';

export class UNDPController {
  private undpService: UNDPService;

  constructor() {
    this.undpService = new UNDPService();
  }

  /**
   * Get socio-economic context for MRV calculations
   */
  public getSocioEconomicContext = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('[UNDP Controller] Getting socio-economic context');
      
      const context = await this.undpService.getSocioEconomicContext();
      
      res.status(200).json({
        success: true,
        data: context,
        message: 'Socio-economic context retrieved successfully'
      });
    } catch (error) {
      logger.error(`[UNDP Controller] Error getting socio-economic context: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve socio-economic context',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get country data for India
   */
  public getCountryData = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = req.params.year ? parseInt(req.params.year) : undefined;
      logger.info(`[UNDP Controller] Getting country data for year: ${year || 'default'}`);
      
      const countryData = await this.undpService.getCountryData(year);
      
      res.status(200).json({
        success: true,
        data: countryData,
        message: 'Country data retrieved successfully'
      });
    } catch (error) {
      logger.error(`[UNDP Controller] Error getting country data: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve country data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get available indicators metadata
   */
  public getAvailableIndicators = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('[UNDP Controller] Getting available indicators');
      
      const indicators = await this.undpService.getAvailableIndicators();
      
      res.status(200).json({
        success: true,
        data: indicators,
        message: 'Indicators metadata retrieved successfully'
      });
    } catch (error) {
      logger.error(`[UNDP Controller] Error getting indicators: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve indicators metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get available countries metadata
   */
  public getAvailableCountries = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('[UNDP Controller] Getting available countries');
      
      const countries = await this.undpService.getAvailableCountries();
      
      res.status(200).json({
        success: true,
        data: countries,
        message: 'Countries metadata retrieved successfully'
      });
    } catch (error) {
      logger.error(`[UNDP Controller] Error getting countries: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve countries metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get composite indices for India
   */
  public getCompositeIndices = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = req.params.year ? parseInt(req.params.year) : undefined;
      logger.info(`[UNDP Controller] Getting composite indices for year: ${year || 'default'}`);
      
      const indices = await this.undpService.getCompositeIndices(year);
      
      res.status(200).json({
        success: true,
        data: indices,
        message: 'Composite indices retrieved successfully'
      });
    } catch (error) {
      logger.error(`[UNDP Controller] Error getting composite indices: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve composite indices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
