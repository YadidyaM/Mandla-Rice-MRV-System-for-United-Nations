/**
 * Emission Modeling Service using IPCC methodology
 */

import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export class EmissionModelingService {
  
  async calculateBaselineEmissions(seasonData: any, farmData: any): Promise<any> {
    try {
      // IPCC 2019 Refinement methodology
      // EF = EFc × SFw × SFp × SFo × t
      
      const area = farmData.area; // hectares
      const EFc = config.carbonModel.baselineEmissionFactor; // kg CH4/ha/season
      const SFw = 1.0; // Continuous flooding scaling factor
      const SFp = 1.0; // No pre-season drainage
      const SFo = 1.0; // No organic amendments (baseline)
      const t = 1; // One season
      
      const totalCH4 = area * EFc * SFw * SFp * SFo * t;
      
      return {
        totalCH4,
        area,
        emissionFactor: EFc,
        scalingFactors: { SFw, SFp, SFo },
        methodology: 'IPCC 2019 Refinement Tier 2'
      };
    } catch (error) {
      logger.error('Failed to calculate baseline emissions:', error);
      throw error;
    }
  }
  
  async calculateProjectEmissions(seasonData: any, farmData: any, remoteSensingData: any): Promise<any> {
    try {
      const area = farmData.area;
      const EFc = config.carbonModel.baselineEmissionFactor;
      
      // Determine scaling factor based on farming method
      let SFw = 1.0;
      if (seasonData.farmingMethod === 'AWD') {
        SFw = config.carbonModel.awdScalingFactor; // ~0.52
      } else if (seasonData.farmingMethod === 'SRI') {
        SFw = config.carbonModel.sriScalingFactor; // ~0.68
      }
      
      // Adjust based on satellite verification
      if (remoteSensingData?.confidence < 0.7) {
        SFw = Math.min(SFw * 1.2, 1.0); // Conservative adjustment for low confidence
      }
      
      const SFp = 1.0; // No pre-season drainage
      const SFo = this.calculateOrganicScalingFactor(seasonData.organicInputs || []);
      const t = 1;
      
      const totalCH4 = area * EFc * SFw * SFp * SFo * t;
      
      return {
        totalCH4,
        area,
        emissionFactor: EFc,
        scalingFactors: { SFw, SFp, SFo },
        methodology: 'IPCC 2019 Refinement Tier 2',
        farmingMethod: seasonData.farmingMethod
      };
    } catch (error) {
      logger.error('Failed to calculate project emissions:', error);
      throw error;
    }
  }
  
  private calculateOrganicScalingFactor(organicInputs: any[]): number {
    // Simplified organic amendment scaling
    const totalOrganic = organicInputs.reduce((sum, input) => sum + (input.quantity || 0), 0);
    
    // IPCC scaling factors for organic amendments
    if (totalOrganic > 1000) return 1.5; // High organic input
    if (totalOrganic > 500) return 1.2;  // Medium organic input
    if (totalOrganic > 0) return 1.1;    // Low organic input
    return 1.0; // No organic input
  }
}
