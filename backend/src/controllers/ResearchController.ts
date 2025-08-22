import { Request, Response } from 'express';
import { GatesResearchService } from '../services/research/GatesResearchService';
import { logger } from '../utils/logger';

export class ResearchController {
  private gatesResearchService: GatesResearchService;

  constructor() {
    this.gatesResearchService = new GatesResearchService();
  }

  /**
   * Search for research articles
   */
  public searchArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, page = 1, rows = 100, sort } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
        return;
      }

      logger.info(`[Research Controller] Searching articles: ${query}`);
      
      const results = await this.gatesResearchService.searchArticles({
        query,
        page: parseInt(page as string),
        rows: parseInt(rows as string),
        sort: sort as string
      });
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Research articles retrieved successfully'
      });
    } catch (error) {
      logger.error(`[Research Controller] Search error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to search research articles',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get climate and agriculture research
   */
  public getClimateAgricultureResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1 } = req.query;
      logger.info(`[Research Controller] Getting climate-agriculture research, page: ${page}`);
      
      const results = await this.gatesResearchService.searchClimateAgricultureResearch(parseInt(page as string));
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Climate-agriculture research retrieved successfully'
      });
    } catch (error) {
      logger.error(`[Research Controller] Climate-agriculture error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve climate-agriculture research',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get rice methane research
   */
  public getRiceMethaneResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1 } = req.query;
      logger.info(`[Research Controller] Getting rice methane research, page: ${page}`);
      
      const results = await this.gatesResearchService.searchRiceMethaneResearch(parseInt(page as string));
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Rice methane research retrieved successfully'
      });
    } catch (error) {
      logger.error(`[Research Controller] Rice methane error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve rice methane research',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get sustainable agriculture research
   */
  public getSustainableAgricultureResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1 } = req.query;
      logger.info(`[Research Controller] Getting sustainable agriculture research, page: ${page}`);
      
      const results = await this.gatesResearchService.searchSustainableAgriculture(parseInt(page as string));
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Sustainable agriculture research retrieved successfully'
      });
    } catch (error) {
      logger.error(`[Research Controller] Sustainable agriculture error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sustainable agriculture research',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get MRV research insights
   */
  public getMRVResearchInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('[Research Controller] Getting MRV research insights');
      
      const insights = await this.gatesResearchService.getMRVResearchInsights();
      
      res.status(200).json({
        success: true,
        data: insights,
        message: 'MRV research insights retrieved successfully'
      });
    } catch (error) {
      logger.error(`[Research Controller] MRV insights error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve MRV research insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get methodology research for specific component
   */
  public getMethodologyResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { component } = req.params;
      
      if (!['emissions', 'verification', 'monitoring', 'reporting'].includes(component)) {
        res.status(400).json({
          success: false,
          error: 'Invalid methodology component',
          message: 'Component must be one of: emissions, verification, monitoring, reporting'
        });
        return;
      }

      logger.info(`[Research Controller] Getting methodology research for: ${component}`);
      
      const results = await this.gatesResearchService.getMethodologyResearch(component as any);
      
      res.status(200).json({
        success: true,
        data: results,
        message: `Methodology research for ${component} retrieved successfully`
      });
    } catch (error) {
      logger.error(`[Research Controller] Methodology research error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve methodology research',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get article XML by DOI
   */
  public getArticleXML = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doi } = req.params;
      
      if (!doi) {
        res.status(400).json({
          success: false,
          error: 'DOI parameter is required',
          message: 'Please provide a DOI'
        });
        return;
      }

      logger.info(`[Research Controller] Getting XML for DOI: ${doi}`);
      
      const xml = await this.gatesResearchService.getArticleXML(doi);
      
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(xml);
    } catch (error) {
      logger.error(`[Research Controller] XML fetch error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article XML',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get article PDF by DOI
   */
  public getArticlePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doi } = req.params;
      
      if (!doi) {
        res.status(400).json({
          success: false,
          error: 'DOI parameter is required',
          message: 'Please provide a DOI'
        });
        return;
      }

      logger.info(`[Research Controller] Getting PDF for DOI: ${doi}`);
      
      const pdf = await this.gatesResearchService.getArticlePDF(doi);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doi}.pdf"`);
      res.status(200).send(pdf);
    } catch (error) {
      logger.error(`[Research Controller] PDF fetch error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get all article XML URLs
   */
  public getAllArticleURLs = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('[Research Controller] Getting all article XML URLs');
      
      const urls = await this.gatesResearchService.getAllArticleURLs();
      
      res.status(200).json({
        success: true,
        data: { urls, count: urls.length },
        message: 'Article URLs retrieved successfully'
      });
    } catch (error) {
      logger.error(`[Research Controller] URLs fetch error: ${error}`);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article URLs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
