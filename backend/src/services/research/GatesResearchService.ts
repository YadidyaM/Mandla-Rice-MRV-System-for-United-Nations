import axios from 'axios';
import { logger } from '../../utils/logger';

export interface GatesArticle {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  doi: string;
  publicationDate: string;
  journal: string;
  keywords: string[];
  url: string;
}

export interface GatesSearchResult {
  response: {
    numFound: number;
    start: number;
    docs: any[];
  };
  highlighting?: any;
}

export interface GatesSearchParams {
  query: string;
  page?: number;
  rows?: number;
  sort?: string;
  filters?: Record<string, string>;
}

export class GatesResearchService {
  private baseUrl = 'https://gatesopenresearch.org/extapi';
  private rateLimitDelay = 600; // 100 requests per 60 seconds = 600ms between requests
  private lastRequestTime = 0;

  constructor() {
    logger.info('[Gates Research Service] Initialized - No API key required');
  }

  /**
   * Rate limiting helper to respect the 100 requests per minute limit
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Search for articles using Solr-style query syntax
   */
  async searchArticles(params: GatesSearchParams): Promise<GatesSearchResult> {
    try {
      await this.respectRateLimit();
      
      const searchParams = new URLSearchParams({
        q: params.query,
        wt: 'json',
        rows: (params.rows || 100).toString(),
        start: ((params.page || 1) - 1) * (params.rows || 100) + ''
      });

      if (params.sort) {
        searchParams.append('sort', params.sort);
      }

      const url = `${this.baseUrl}/search?${searchParams.toString()}`;
      logger.info(`[Gates Research] Searching: ${params.query}`);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      logger.error(`[Gates Research] Search error: ${error}`);
      throw new Error(`Failed to search Gates Open Research: ${error}`);
    }
  }

  /**
   * Search for climate change and agriculture related research
   */
  async searchClimateAgricultureResearch(page: number = 1): Promise<GatesSearchResult> {
    const query = 'R_ABS:"climate change" OR R_ABS:"agriculture" OR R_ABS:"rice farming" OR R_ABS:"methane emissions"';
    return this.searchArticles({ query, page, rows: 100 });
  }

  /**
   * Search for rice farming and methane research specifically
   */
  async searchRiceMethaneResearch(page: number = 1): Promise<GatesSearchResult> {
    const query = 'R_ABS:"rice farming" AND (R_ABS:"methane" OR R_ABS:"greenhouse gas" OR R_ABS:"emissions")';
    return this.searchArticles({ query, page, rows: 100 });
  }

  /**
   * Search for sustainable agriculture practices
   */
  async searchSustainableAgriculture(page: number = 1): Promise<GatesSearchResult> {
    const query = 'R_ABS:"sustainable agriculture" OR R_ABS:"climate-smart agriculture" OR R_ABS:"alternate wetting drying"';
    return this.searchArticles({ query, page, rows: 100 });
  }

  /**
   * Get article XML by DOI
   */
  async getArticleXML(doi: string): Promise<string> {
    try {
      await this.respectRateLimit();
      
      const url = `${this.baseUrl}/article/xml?doi=${encodeURIComponent(doi)}`;
      logger.info(`[Gates Research] Fetching XML for DOI: ${doi}`);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      logger.error(`[Gates Research] XML fetch error for ${doi}: ${error}`);
      throw new Error(`Failed to fetch article XML: ${error}`);
    }
  }

  /**
   * Get article PDF by DOI
   */
  async getArticlePDF(doi: string): Promise<Buffer> {
    try {
      await this.respectRateLimit();
      
      const url = `${this.baseUrl}/article/pdf?doi=${encodeURIComponent(doi)}`;
      logger.info(`[Gates Research] Fetching PDF for DOI: ${doi}`);
      
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      logger.error(`[Gates Research] PDF fetch error for ${doi}: ${error}`);
      throw new Error(`Failed to fetch article PDF: ${error}`);
    }
  }

  /**
   * Get all published article XML URLs
   */
  async getAllArticleURLs(): Promise<string[]> {
    try {
      await this.respectRateLimit();
      
      const url = 'https://gatesopenresearch.org/published-xml-urls';
      logger.info('[Gates Research] Fetching all article XML URLs');
      
      const response = await axios.get(url);
      const urls = response.data.split('\n').filter((url: string) => url.trim());
      return urls;
    } catch (error) {
      logger.error(`[Gates Research] Error fetching article URLs: ${error}`);
      throw new Error(`Failed to fetch article URLs: ${error}`);
    }
  }

  /**
   * Get research insights for MRV methodology development
   */
  async getMRVResearchInsights(): Promise<any> {
    try {
      const [climateAgri, riceMethane, sustainable] = await Promise.all([
        this.searchClimateAgricultureResearch(1),
        this.searchRiceMethaneResearch(1),
        this.searchSustainableAgriculture(1)
      ]);

      const insights = {
        climateAgriculture: {
          totalResults: climateAgri.response.numFound,
          recentPapers: climateAgri.response.docs.slice(0, 5).map(doc => ({
            title: doc.title,
            doi: doc.doi,
            authors: doc.author,
            publicationDate: doc.publication_date
          }))
        },
        riceMethane: {
          totalResults: riceMethane.response.numFound,
          recentPapers: riceMethane.response.docs.slice(0, 5).map(doc => ({
            title: doc.title,
            doi: doc.doi,
            authors: doc.author,
            publicationDate: doc.publication_date
          }))
        },
        sustainableAgriculture: {
          totalResults: sustainable.response.numFound,
          recentPapers: sustainable.response.docs.slice(0, 5).map(doc => ({
            title: doc.title,
            doi: doc.doi,
            authors: doc.author,
            publicationDate: doc.publication_date
          }))
        },
        recommendations: this.generateResearchRecommendations(climateAgri, riceMethane, sustainable)
      };

      logger.info('[Gates Research] Generated MRV research insights');
      return insights;
    } catch (error) {
      logger.error(`[Gates Research] Error generating insights: ${error}`);
      throw new Error(`Failed to generate research insights: ${error}`);
    }
  }

  /**
   * Generate research-based recommendations for MRV methodology
   */
  private generateResearchRecommendations(
    climateAgri: GatesSearchResult,
    riceMethane: GatesSearchResult,
    sustainable: GatesSearchResult
  ): string[] {
    const recommendations: string[] = [];

    if (climateAgri.response.numFound > 100) {
      recommendations.push('High volume of climate-agriculture research available for methodology validation');
    }

    if (riceMethane.response.numFound > 50) {
      recommendations.push('Substantial rice methane research can inform emission factor calculations');
    }

    if (sustainable.response.numFound > 75) {
      recommendations.push('Rich sustainable agriculture literature supports practice verification methods');
    }

    if (climateAgri.response.numFound < 20) {
      recommendations.push('Limited climate-agriculture research - consider expanding search parameters');
    }

    recommendations.push('Use recent publications (last 5 years) for current methodology standards');
    recommendations.push('Cross-reference findings with IPCC guidelines for emission calculations');

    return recommendations;
  }

  /**
   * Get research papers for specific MRV methodology components
   */
  async getMethodologyResearch(component: 'emissions' | 'verification' | 'monitoring' | 'reporting'): Promise<GatesSearchResult> {
    const queries = {
      emissions: 'R_ABS:"emission factor" AND (R_ABS:"rice" OR R_ABS:"agriculture")',
      verification: 'R_ABS:"verification" AND (R_ABS:"carbon" OR R_ABS:"agriculture")',
      monitoring: 'R_ABS:"monitoring" AND (R_ABS:"agriculture" OR R_ABS:"remote sensing")',
      reporting: 'R_ABS:"reporting" AND (R_ABS:"carbon" OR R_ABS:"agriculture")'
    };

    const query = queries[component];
    return this.searchArticles({ query, page: 1, rows: 50 });
  }
}
