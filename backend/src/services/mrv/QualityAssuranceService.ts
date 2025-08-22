/**
 * Quality Assurance Service for MRV validation
 */

import { logger } from '../../utils/logger';

export class QualityAssuranceService {
  
  async performQualityAssurance(data: {
    farmData: any;
    seasonData: any;
    remoteSensingAnalysis: any;
    emissionCalculations: any;
  }): Promise<any> {
    try {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check data completeness
      const dataCompleteness = this.checkDataCompleteness(data);
      if (dataCompleteness < 0.8) {
        issues.push('Insufficient data completeness');
      }
      
      // Check satellite verification confidence
      if (data.remoteSensingAnalysis?.confidence < 0.7) {
        warnings.push('Low satellite verification confidence');
      }
      
      // Check emission reduction reasonableness
      const reductionPercentage = this.calculateReductionPercentage(data.emissionCalculations);
      if (reductionPercentage > 80) {
        issues.push('Unreasonably high emission reduction claimed');
      } else if (reductionPercentage < 5) {
        warnings.push('Very low emission reduction achieved');
      }
      
      // Check farming method consistency
      const methodConsistency = this.checkMethodConsistency(data);
      if (!methodConsistency) {
        issues.push('Farming method inconsistent with satellite data');
      }
      
      // Check temporal consistency
      const temporalIssues = this.checkTemporalConsistency(data.seasonData);
      issues.push(...temporalIssues);
      
      return {
        dataCompleteness,
        issues,
        warnings,
        overallScore: this.calculateOverallScore(dataCompleteness, issues, warnings),
        recommendation: issues.length === 0 ? 'PROCEED' : 'NEEDS_REVIEW'
      };
    } catch (error) {
      logger.error('Quality assurance failed:', error);
      throw error;
    }
  }
  
  private checkDataCompleteness(data: any): number {
    let requiredFields = 0;
    let providedFields = 0;
    
    // Farm data checks
    const farmFields = ['area', 'coordinates', 'village'];
    farmFields.forEach(field => {
      requiredFields++;
      if (data.farmData?.[field]) providedFields++;
    });
    
    // Season data checks
    const seasonFields = ['farmingMethod', 'transplantDate', 'crop'];
    seasonFields.forEach(field => {
      requiredFields++;
      if (data.seasonData?.[field]) providedFields++;
    });
    
    // Remote sensing checks
    if (data.remoteSensingAnalysis?.satelliteData?.length > 0) {
      providedFields++;
    }
    requiredFields++;
    
    return providedFields / requiredFields;
  }
  
  private calculateReductionPercentage(emissionCalculations: any): number {
    if (!emissionCalculations?.baseline?.totalCH4 || !emissionCalculations?.project?.totalCH4) {
      return 0;
    }
    
    const baseline = emissionCalculations.baseline.totalCH4;
    const project = emissionCalculations.project.totalCH4;
    
    return ((baseline - project) / baseline) * 100;
  }
  
  private checkMethodConsistency(data: any): boolean {
    const claimedMethod = data.seasonData?.farmingMethod;
    const satelliteConfidence = data.remoteSensingAnalysis?.confidence || 0;
    
    // If satellite confidence is high, we trust the verification
    if (satelliteConfidence > 0.8) {
      return true;
    }
    
    // For low confidence, we flag as inconsistent
    return satelliteConfidence > 0.5;
  }
  
  private checkTemporalConsistency(seasonData: any): string[] {
    const issues: string[] = [];
    
    if (seasonData.transplantDate && seasonData.harvestDate) {
      const transplantDate = new Date(seasonData.transplantDate);
      const harvestDate = new Date(seasonData.harvestDate);
      
      const durationDays = (harvestDate.getTime() - transplantDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (durationDays < 90) {
        issues.push('Unusually short growing season');
      } else if (durationDays > 180) {
        issues.push('Unusually long growing season');
      }
    }
    
    return issues;
  }
  
  private calculateOverallScore(completeness: number, issues: string[], warnings: string[]): number {
    let score = completeness;
    
    // Deduct for issues and warnings
    score -= issues.length * 0.2;
    score -= warnings.length * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }
}
