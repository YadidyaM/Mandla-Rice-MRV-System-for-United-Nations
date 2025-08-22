import axios from 'axios';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export interface UNDPIndicator {
  country: string;
  year: number;
  indicator: string;
  value: number;
  unit?: string;
  source?: string;
}

export interface UNDPCountryData {
  countryCode: string;
  countryName: string;
  hdiRank?: number;
  hdiValue?: number;
  lifeExpectancy?: number;
  educationIndex?: number;
  gniPerCapita?: number;
  co2Emissions?: number;
  year: number;
}

export class UNDPService {
  private baseUrl: string;
  private apiKey: string;
  private countryCode: string;
  private defaultYear: number;

  constructor() {
    this.baseUrl = config.undp.apiUrl;
    this.apiKey = config.undp.apiKey;
    this.countryCode = config.undp.countryCode;
    this.defaultYear = config.undp.defaultYear;
  }

  /**
   * Get composite indices for India (Mandla region context)
   */
  async getCompositeIndices(year?: number): Promise<any> {
    try {
      const targetYear = year || this.defaultYear;
      const url = `${this.baseUrl}/CompositeIndices/query`;
      
      const response = await axios.get(url, {
        params: {
          apikey: this.apiKey,
          countryOrAggregation: this.countryCode,
          year: targetYear,
          indicator: config.undp.indicators
        }
      });

      logger.info(`[UNDP Service] Retrieved composite indices for ${this.countryCode} in ${targetYear}`);
      return response.data;
    } catch (error) {
      logger.error(`[UNDP Service] Error fetching composite indices: ${error}`);
      throw new Error(`Failed to fetch UNDP data: ${error}`);
    }
  }

  /**
   * Get detailed country data for India
   */
  async getCountryData(year?: number): Promise<UNDPCountryData> {
    try {
      const targetYear = year || this.defaultYear;
      const url = `${this.baseUrl}/CompositeIndices/${this.countryCode}/${targetYear}`;
      
      const response = await axios.get(url, {
        params: {
          apikey: this.apiKey
        }
      });

      const data = response.data;
      
      // Map the response to our standardized format
      const countryData: UNDPCountryData = {
        countryCode: this.countryCode,
        countryName: 'India',
        year: targetYear,
        hdiRank: data.hdi_rank,
        hdiValue: data.hdi_value,
        lifeExpectancy: data.life_exp,
        educationIndex: data.edu_index,
        gniPerCapita: data.gni_per_capita,
        co2Emissions: data.co2_prod
      };

      logger.info(`[UNDP Service] Retrieved country data for ${this.countryCode} in ${targetYear}`);
      return countryData;
    } catch (error) {
      logger.error(`[UNDP Service] Error fetching country data: ${error}`);
      throw new Error(`Failed to fetch UNDP country data: ${error}`);
    }
  }

  /**
   * Get available indicators metadata
   */
  async getAvailableIndicators(): Promise<any> {
    try {
      const url = `${this.baseUrl}/Metadata/Indicators`;
      
      const response = await axios.get(url, {
        params: {
          apikey: this.apiKey
        }
      });

      logger.info(`[UNDP Service] Retrieved available indicators metadata`);
      return response.data;
    } catch (error) {
      logger.error(`[UNDP Service] Error fetching indicators metadata: ${error}`);
      throw new Error(`Failed to fetch UNDP indicators metadata: ${error}`);
    }
  }

  /**
   * Get available countries metadata
   */
  async getAvailableCountries(): Promise<any> {
    try {
      const url = `${this.baseUrl}/Metadata/Countries`;
      
      const response = await axios.get(url, {
        params: {
          apikey: this.apiKey
        }
      });

      logger.info(`[UNDP Service] Retrieved available countries metadata`);
      return response.data;
    } catch (error) {
      logger.error(`[UNDP Service] Error fetching countries metadata: ${error}`);
      throw new Error(`Failed to fetch UNDP countries metadata: ${error}`);
    }
  }

  /**
   * Get socio-economic context for MRV calculations
   * This helps contextualize the carbon credit value in local development terms
   */
  async getSocioEconomicContext(): Promise<any> {
    try {
      const [countryData, compositeIndices] = await Promise.all([
        this.getCountryData(),
        this.getCompositeIndices()
      ]);

      const context = {
        country: countryData,
        developmentMetrics: {
          hdiRank: countryData.hdiRank,
          hdiValue: countryData.hdiValue,
          lifeExpectancy: countryData.lifeExpectancy,
          educationIndex: countryData.educationIndex,
          gniPerCapita: countryData.gniPerCapita,
          co2Emissions: countryData.co2Emissions
        },
        carbonCreditContext: {
          // Calculate the relative value of carbon credits in local context
          localValueMultiplier: this.calculateLocalValueMultiplier(countryData),
          developmentImpact: this.assessDevelopmentImpact(countryData)
        }
      };

      logger.info(`[UNDP Service] Generated socio-economic context for MRV calculations`);
      return context;
    } catch (error) {
      logger.error(`[UNDP Service] Error generating socio-economic context: ${error}`);
      throw new Error(`Failed to generate socio-economic context: ${error}`);
    }
  }

  /**
   * Calculate how much more valuable carbon credits are in local development context
   */
  private calculateLocalValueMultiplier(countryData: UNDPCountryData): number {
    // Higher multiplier for countries with lower HDI (more impact per dollar)
    if (!countryData.hdiValue) return 1.0;
    
    // India's HDI is around 0.633 (2021), so credits have higher relative value
    const baseHDI = 0.633;
    const multiplier = 1 + (1 - countryData.hdiValue) * 2;
    
    return Math.min(multiplier, 3.0); // Cap at 3x to avoid unrealistic values
  }

  /**
   * Assess the development impact potential of carbon credits
   */
  private assessDevelopmentImpact(countryData: UNDPCountryData): string {
    if (!countryData.hdiValue) return 'unknown';
    
    if (countryData.hdiValue < 0.5) return 'very_high';
    if (countryData.hdiValue < 0.7) return 'high';
    if (countryData.hdiValue < 0.8) return 'medium';
    return 'low';
  }
}
