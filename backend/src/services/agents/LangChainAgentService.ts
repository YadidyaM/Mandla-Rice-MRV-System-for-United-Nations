/**
 * LangChain Agent Service for Mandla Rice MRV System
 * Implements a multi-agent workflow using LangGraph for MRV processing
 */

import { StateGraph, END } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
// import { PrismaClient } from '@prisma/client';
import { logger, mrvLogger } from '../../utils/logger';
import { config } from '../../config/config';
import { RemoteSensingService } from '../satellite/RemoteSensingService';
import { EmissionModelingService } from '../carbon/EmissionModelingService';
import { QualityAssuranceService } from '../mrv/QualityAssuranceService';
import { IPFSService } from '../storage/IPFSService';
import { BlockchainService } from '../blockchain/BlockchainService';

// State interface for the agent workflow
interface MRVAgentState {
  farmId: string;
  seasonId: string;
  farmData?: any;
  seasonData?: any;
  farmerLogs?: any[];
  satelliteData?: any[];
  remoteSensingAnalysis?: any;
  emissionCalculations?: any;
  qualityAssessment?: any;
  mrvReport?: any;
  attestation?: any;
  blockchainReceipt?: any;
  errors: string[];
  currentStep: string;
  isComplete: boolean;
}

// Agent message types
interface AgentContext {
  messages: BaseMessage[];
  metadata: Record<string, any>;
}

export class LangChainAgentService {
  private llm: ChatOpenAI;
  private graph: any;
  // private prisma: PrismaClient;
  private remoteSensingService: RemoteSensingService;
  private emissionModelingService: EmissionModelingService;
  private qualityAssuranceService: QualityAssuranceService;
  private ipfsService: IPFSService;
  private blockchainService: BlockchainService;

  constructor() {
    // this.prisma = prisma;
    
    // Initialize OpenAI LLM with GPT-5
    this.llm = new ChatOpenAI({
      openAIApiKey: config.langchain.openaiApiKey,
      modelName: "gpt-5",
      temperature: 0.1,
      maxTokens: 4000, // GPT-5 supports higher token limits
    });

    // Initialize services
    this.remoteSensingService = new RemoteSensingService();
    this.emissionModelingService = new EmissionModelingService();
    this.qualityAssuranceService = new QualityAssuranceService();
    this.ipfsService = new IPFSService();
    this.blockchainService = new BlockchainService();

    this.initializeAgentGraph();
  }

  /**
   * Initialize the LangGraph agent workflow
   */
  private initializeAgentGraph(): void {
    const workflow = new StateGraph<MRVAgentState>({
      channels: {
        farmId: { reducer: (a: string, b: string) => b || a },
        seasonId: { reducer: (a: string, b: string) => b || a },
        farmData: { reducer: (a: any, b: any) => b || a },
        seasonData: { reducer: (a: any, b: any) => b || a },
        farmerLogs: { reducer: (a: any[], b: any[]) => b || a },
        satelliteData: { reducer: (a: any[], b: any[]) => b || a },
        remoteSensingAnalysis: { reducer: (a: any, b: any) => b || a },
        emissionCalculations: { reducer: (a: any, b: any) => b || a },
        qualityAssessment: { reducer: (a: any, b: any) => b || a },
        mrvReport: { reducer: (a: any, b: any) => b || a },
        attestation: { reducer: (a: any, b: any) => b || a },
        blockchainReceipt: { reducer: (a: any, b: any) => b || a },
        errors: { reducer: (a: string[], b: string[]) => [...(a || []), ...(b || [])] },
        currentStep: { reducer: (a: string, b: string) => b || a },
        isComplete: { reducer: (a: boolean, b: boolean) => b !== undefined ? b : a },
      }
    });

    // Add agent nodes
    workflow.addNode("data_ingestion", this.dataIngestionAgent.bind(this));
    workflow.addNode("remote_sensing", this.remoteSensingAgent.bind(this));
    workflow.addNode("emission_modeling", this.emissionModelingAgent.bind(this));
    workflow.addNode("quality_assurance", this.qualityAssuranceAgent.bind(this));
    workflow.addNode("report_generation", this.reportGenerationAgent.bind(this));
    workflow.addNode("attestation", this.attestationAgent.bind(this));
    workflow.addNode("blockchain_mint", this.blockchainMintAgent.bind(this));

    // Define workflow edges
    workflow.setEntryPoint("data_ingestion");
    workflow.addEdge("data_ingestion", "remote_sensing");
    workflow.addEdge("remote_sensing", "emission_modeling");
    workflow.addEdge("emission_modeling", "quality_assurance");
    
    // Conditional edge for quality assurance
    workflow.addConditionalEdges(
      "quality_assurance",
      this.shouldProceedAfterQA.bind(this),
      {
        proceed: "report_generation",
        retry: "data_ingestion",
        fail: END
      }
    );
    
    workflow.addEdge("report_generation", "attestation");
    workflow.addEdge("attestation", "blockchain_mint");
    workflow.addEdge("blockchain_mint", END);

    this.graph = workflow.compile();
  }

  /**
   * Data Ingestion Agent - Collects all necessary data for MRV processing
   */
  private async dataIngestionAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting data ingestion', { farmId: state.farmId, seasonId: state.seasonId });

      // Fetch farm data
      const farm = await this.prisma.farm.findUnique({
        where: { id: state.farmId },
        include: {
          farmer: {
            include: { profile: true }
          }
        }
      });

      if (!farm) {
        return { errors: ['Farm not found'], currentStep: 'data_ingestion' };
      }

      // Fetch season data
      const season = await this.prisma.farmingSeason.findUnique({
        where: { id: state.seasonId },
        include: {
          farm: true
        }
      });

      if (!season) {
        return { errors: ['Farming season not found'], currentStep: 'data_ingestion' };
      }

      // Extract farmer irrigation logs
      const irrigationCycles = season.irrigationCycles as any[] || [];
      const organicInputs = season.organicInputs as any[] || [];

      // Create system message for context
      const systemMessage = new SystemMessage(`
        You are an agricultural data analyst for the UN Climate Challenge MRV system.
        You are processing data for farmer ${farm.farmer.profile?.firstName} ${farm.farmer.profile?.lastName}
        in ${farm.village}, ${farm.district}, ${farm.state}.
        
        Farm Details:
        - Area: ${farm.area} hectares
        - Crop: ${season.crop}
        - Farming Method: ${season.farmingMethod}
        - Irrigation Type: ${farm.irrigationType}
        - Season: ${season.season} ${season.year}
        
        Your role is to prepare this data for emission calculations and satellite analysis.
      `);

      return {
        farmData: farm,
        seasonData: season,
        farmerLogs: [...irrigationCycles, ...organicInputs],
        currentStep: 'data_ingestion',
        errors: []
      };

    } catch (error) {
      logger.error('Data ingestion agent failed:', error);
      return { 
        errors: [`Data ingestion failed: ${error.message}`], 
        currentStep: 'data_ingestion' 
      };
    }
  }

  /**
   * Remote Sensing Agent - Analyzes satellite data for irrigation patterns
   */
  private async remoteSensingAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting remote sensing analysis', { farmId: state.farmId });

      if (!state.farmData || !state.seasonData) {
        return { errors: ['Missing farm or season data'], currentStep: 'remote_sensing' };
      }

      // Fetch satellite data
      const satelliteData = await this.remoteSensingService.fetchFarmSatelliteData(
        state.farmId,
        state.seasonData.transplantDate || state.seasonData.sowingDate,
        state.seasonData.harvestDate || new Date()
      );

      // Analyze flood patterns for AWD detection
      const floodAnalysis = await this.remoteSensingService.analyzeFloodPatterns(
        satelliteData,
        state.farmData.coordinates
      );

      // Cross-reference with farmer logs using LLM
      const messages = [
        new SystemMessage(`
          You are analyzing satellite data to verify farmer-reported irrigation practices.
          Compare the satellite-detected flood patterns with farmer irrigation logs.
          
          Farmer's irrigation method: ${state.seasonData.farmingMethod}
          Expected pattern for ${state.seasonData.farmingMethod}:
          - FLOOD: Continuous flooding throughout season
          - AWD: Alternate wetting and drying cycles every 7-14 days
          - SRI: Minimal water with periodic wetting
        `),
        new HumanMessage(`
          Satellite flood detections: ${JSON.stringify(floodAnalysis.floodEvents)}
          Farmer irrigation logs: ${JSON.stringify(state.farmerLogs)}
          
          Please analyze if the satellite data supports the farmer's claimed irrigation method.
          Provide confidence score and flag any discrepancies.
        `)
      ];

      const llmResponse = await this.llm.invoke(messages);

      const remoteSensingAnalysis = {
        satelliteData,
        floodAnalysis,
        verificationResult: llmResponse.content,
        confidence: this.extractConfidenceScore(llmResponse.content as string),
        discrepancies: this.extractDiscrepancies(llmResponse.content as string)
      };

      return {
        satelliteData,
        remoteSensingAnalysis,
        currentStep: 'remote_sensing',
        errors: []
      };

    } catch (error) {
      logger.error('Remote sensing agent failed:', error);
      return { 
        errors: [`Remote sensing failed: ${error.message}`], 
        currentStep: 'remote_sensing' 
      };
    }
  }

  /**
   * Emission Modeling Agent - Calculates CH4 emissions using IPCC methodology
   */
  private async emissionModelingAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting emission modeling', { farmId: state.farmId });

      if (!state.seasonData || !state.remoteSensingAnalysis) {
        return { errors: ['Missing season data or remote sensing analysis'], currentStep: 'emission_modeling' };
      }

      // Calculate baseline emissions (conventional flooding)
      const baselineEmissions = await this.emissionModelingService.calculateBaselineEmissions(
        state.seasonData,
        state.farmData
      );

      // Calculate project emissions based on farming method
      const projectEmissions = await this.emissionModelingService.calculateProjectEmissions(
        state.seasonData,
        state.farmData,
        state.remoteSensingAnalysis
      );

      // Use LLM to validate the emission calculations
      const messages = [
        new SystemMessage(`
          You are a carbon accounting specialist validating methane emission calculations
          for rice farming using IPCC 2019 Refinement methodologies.
          
          Farm area: ${state.farmData.area} hectares
          Farming method: ${state.seasonData.farmingMethod}
          Water management: ${state.farmData.irrigationType}
          
          IPCC parameters:
          - Tier 2 methodology
          - EFc (emission factor): ${config.carbonModel.baselineEmissionFactor} kg CH4/ha/season
          - AWD scaling factor: ${config.carbonModel.awdScalingFactor}
          - SRI scaling factor: ${config.carbonModel.sriScalingFactor}
          - GWP for CH4: ${config.carbonModel.gwpMethane}
        `),
        new HumanMessage(`
          Baseline emissions: ${baselineEmissions.totalCH4} kg CH4
          Project emissions: ${projectEmissions.totalCH4} kg CH4
          Reduction: ${baselineEmissions.totalCH4 - projectEmissions.totalCH4} kg CH4
          
          Please validate these calculations and provide uncertainty assessment.
          Consider factors affecting accuracy and confidence in the results.
        `)
      ];

      const validationResponse = await this.llm.invoke(messages);

      const emissionCalculations = {
        baseline: baselineEmissions,
        project: projectEmissions,
        reduction: {
          ch4Reduction: baselineEmissions.totalCH4 - projectEmissions.totalCH4,
          co2eReduction: (baselineEmissions.totalCH4 - projectEmissions.totalCH4) * config.carbonModel.gwpMethane / 1000,
        },
        uncertainty: this.extractUncertainty(validationResponse.content as string),
        validation: validationResponse.content,
        methodology: 'IPCC 2019 Refinement Tier 2'
      };

      return {
        emissionCalculations,
        currentStep: 'emission_modeling',
        errors: []
      };

    } catch (error) {
      logger.error('Emission modeling agent failed:', error);
      return { 
        errors: [`Emission modeling failed: ${error.message}`], 
        currentStep: 'emission_modeling' 
      };
    }
  }

  /**
   * Quality Assurance Agent - Validates data consistency and flags issues
   */
  private async qualityAssuranceAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting quality assurance', { farmId: state.farmId });

      const qaResults = await this.qualityAssuranceService.performQualityAssurance({
        farmData: state.farmData,
        seasonData: state.seasonData,
        remoteSensingAnalysis: state.remoteSensingAnalysis,
        emissionCalculations: state.emissionCalculations
      });

      // Use LLM for comprehensive quality assessment
      const messages = [
        new SystemMessage(`
          You are a quality assurance specialist for carbon credit MRV systems.
          Your role is to identify potential issues, inconsistencies, or red flags
          that could affect the credibility of emission reduction claims.
          
          Quality criteria:
          - Data completeness and consistency
          - Satellite verification accuracy
          - Emission calculation reasonableness
          - Farmer practice validation
          - Uncertainty levels
        `),
        new HumanMessage(`
          QA Results: ${JSON.stringify(qaResults)}
          
          Satellite confidence: ${state.remoteSensingAnalysis?.confidence || 'N/A'}
          Emission reduction: ${state.emissionCalculations?.reduction?.co2eReduction || 0} tCO2e
          
          Please provide a comprehensive quality assessment with recommendations.
          Should this MRV report proceed to verification?
        `)
      ];

      const qaResponse = await this.llm.invoke(messages);

      const qualityAssessment = {
        ...qaResults,
        overallAssessment: qaResponse.content,
        recommendation: this.extractRecommendation(qaResponse.content as string),
        score: this.calculateQualityScore(qaResults),
        flags: qaResults.issues || []
      };

      return {
        qualityAssessment,
        currentStep: 'quality_assurance',
        errors: []
      };

    } catch (error) {
      logger.error('Quality assurance agent failed:', error);
      return { 
        errors: [`Quality assurance failed: ${error.message}`], 
        currentStep: 'quality_assurance' 
      };
    }
  }

  /**
   * Report Generation Agent - Creates comprehensive MRV report
   */
  private async reportGenerationAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting report generation', { farmId: state.farmId });

      // Generate comprehensive MRV report
      const mrvReport = {
        id: `MRV_${state.farmId}_${state.seasonId}_${Date.now()}`,
        farmId: state.farmId,
        seasonId: state.seasonId,
        reportType: 'EMISSION_CALCULATION',
        methodology: 'IPCC 2019 Refinement',
        tier: 2,
        timestamp: new Date().toISOString(),
        
        // Farm information
        farm: {
          id: state.farmData.id,
          name: state.farmData.name,
          area: state.farmData.area,
          location: {
            village: state.farmData.village,
            district: state.farmData.district,
            state: state.farmData.state,
            coordinates: state.farmData.coordinates
          },
          farmer: {
            id: state.farmData.farmerId,
            name: `${state.farmData.farmer.profile?.firstName} ${state.farmData.farmer.profile?.lastName}`,
            gender: state.farmData.farmer.profile?.gender,
            tribalGroup: state.farmData.farmer.profile?.tribalGroup
          }
        },

        // Season information
        season: {
          id: state.seasonData.id,
          season: state.seasonData.season,
          year: state.seasonData.year,
          crop: state.seasonData.crop,
          farmingMethod: state.seasonData.farmingMethod,
          dates: {
            sowing: state.seasonData.sowingDate,
            transplanting: state.seasonData.transplantDate,
            harvest: state.seasonData.harvestDate
          }
        },

        // Emission calculations
        emissions: state.emissionCalculations,

        // Remote sensing evidence
        remoteSensing: state.remoteSensingAnalysis,

        // Quality assessment
        qualityAssurance: state.qualityAssessment,

        // Farmer data
        farmerReportedData: state.farmerLogs,

        // Metadata
        metadata: {
          processingDate: new Date().toISOString(),
          softwareVersion: '1.0.0',
          dataSourcesCount: {
            satellite: state.satelliteData?.length || 0,
            farmerLogs: state.farmerLogs?.length || 0
          }
        }
      };

      // Save to database
      const savedReport = await this.prisma.mRVReport.create({
        data: {
          farmId: state.farmId,
          farmerId: state.farmData.farmerId,
          seasonId: state.seasonId,
          reportType: 'EMISSION_CALCULATION',
          status: 'SUBMITTED',
          methodology: 'IPCC 2019 Refinement',
          tier: 2,
          baselineEmissions: state.emissionCalculations.baseline.totalCH4,
          projectEmissions: state.emissionCalculations.project.totalCH4,
          emissionReductions: state.emissionCalculations.reduction.co2eReduction,
          uncertaintyRange: state.emissionCalculations.uncertainty || 0.25,
          farmerData: state.farmerLogs || [],
          satelliteData: state.remoteSensingAnalysis || {},
          qualityFlags: state.qualityAssessment.flags || []
        }
      });

      return {
        mrvReport: {
          ...mrvReport,
          databaseId: savedReport.id
        },
        currentStep: 'report_generation',
        errors: []
      };

    } catch (error) {
      logger.error('Report generation agent failed:', error);
      return { 
        errors: [`Report generation failed: ${error.message}`], 
        currentStep: 'report_generation' 
      };
    }
  }

  /**
   * Attestation Agent - Signs and stores report on IPFS
   */
  private async attestationAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting attestation', { farmId: state.farmId });

      if (!state.mrvReport) {
        return { errors: ['Missing MRV report'], currentStep: 'attestation' };
      }

      // Store report on IPFS
      const ipfsHash = await this.ipfsService.uploadJSON(state.mrvReport);

      // Create attestation
      const attestation = {
        reportHash: ipfsHash,
        timestamp: new Date().toISOString(),
        verifier: 'UNDP-MRV-System',
        signature: await this.ipfsService.signData(state.mrvReport),
        metadata: {
          reportId: state.mrvReport.id,
          farmId: state.farmId,
          co2eReduction: state.emissionCalculations.reduction.co2eReduction
        }
      };

      // Update database with IPFS hash
      await this.prisma.mRVReport.update({
        where: { id: state.mrvReport.databaseId },
        data: {
          ipfsHash,
          signedReportHash: attestation.signature,
          verificationStatus: 'VERIFIED'
        }
      });

      return {
        attestation,
        currentStep: 'attestation',
        errors: []
      };

    } catch (error) {
      logger.error('Attestation agent failed:', error);
      return { 
        errors: [`Attestation failed: ${error.message}`], 
        currentStep: 'attestation' 
      };
    }
  }

  /**
   * Blockchain Mint Agent - Issues carbon credits on blockchain
   */
  private async blockchainMintAgent(state: MRVAgentState): Promise<Partial<MRVAgentState>> {
    try {
      mrvLogger.info('Starting blockchain minting', { farmId: state.farmId });

      if (!state.attestation || !state.emissionCalculations) {
        return { errors: ['Missing attestation or emission calculations'], currentStep: 'blockchain_mint' };
      }

      // Mint carbon credits
      const creditQuantity = state.emissionCalculations.reduction.co2eReduction;
      const tokenId = `${state.farmId}_${state.seasonId}_${Date.now()}`;

      const mintReceipt = await this.blockchainService.mintCarbonCredit({
        farmerId: state.farmData.farmerId,
        quantity: creditQuantity,
        tokenId,
        ipfsHash: state.attestation.reportHash,
        methodology: 'IPCC_2019_Tier2_AWD',
        vintage: state.seasonData.year
      });

      // Save carbon credit to database
      const carbonCredit = await this.prisma.carbonCredit.create({
        data: {
          tokenId,
          farmerId: state.farmData.farmerId,
          seasonId: state.seasonId,
          mrvReportId: state.mrvReport.databaseId,
          quantity: creditQuantity,
          methodology: 'IPCC 2019 Refinement',
          vintage: state.seasonData.year,
          serialNumber: `MANDLA-${tokenId}`,
          contractAddress: mintReceipt.contractAddress,
          blockchainTxHash: mintReceipt.transactionHash,
          mintedAt: new Date(),
          status: 'ISSUED'
        }
      });

      return {
        blockchainReceipt: {
          ...mintReceipt,
          carbonCreditId: carbonCredit.id,
          tokenId,
          quantity: creditQuantity
        },
        currentStep: 'blockchain_mint',
        isComplete: true,
        errors: []
      };

    } catch (error) {
      logger.error('Blockchain mint agent failed:', error);
      return { 
        errors: [`Blockchain minting failed: ${error.message}`], 
        currentStep: 'blockchain_mint' 
      };
    }
  }

  /**
   * Conditional edge function for quality assurance
   */
  private shouldProceedAfterQA(state: MRVAgentState): string {
    if (!state.qualityAssessment) {
      return 'fail';
    }

    const score = state.qualityAssessment.score || 0;
    const recommendation = state.qualityAssessment.recommendation || '';

    if (score >= 0.8 && recommendation.toLowerCase().includes('proceed')) {
      return 'proceed';
    } else if (score >= 0.6) {
      return 'retry';
    } else {
      return 'fail';
    }
  }

  /**
   * Main method to process MRV workflow
   */
  public async processMRVWorkflow(farmId: string, seasonId: string): Promise<any> {
    try {
      logger.info('Starting MRV workflow processing', { farmId, seasonId });

      const initialState: MRVAgentState = {
        farmId,
        seasonId,
        errors: [],
        currentStep: 'initialized',
        isComplete: false
      };

      const result = await this.graph.invoke(initialState);

      logger.info('MRV workflow completed', { 
        farmId, 
        seasonId, 
        isComplete: result.isComplete,
        errors: result.errors
      });

      return result;

    } catch (error) {
      logger.error('MRV workflow failed:', error);
      throw error;
    }
  }

  // Utility methods for LLM response parsing
  private extractConfidenceScore(text: string): number {
    const match = text.match(/confidence[:\s]+(\d+(?:\.\d+)?)/i);
    return match ? parseFloat(match[1]) / 100 : 0.5;
  }

  private extractDiscrepancies(text: string): string[] {
    const lines = text.split('\n');
    return lines.filter(line => 
      line.toLowerCase().includes('discrepancy') || 
      line.toLowerCase().includes('inconsistency')
    );
  }

  private extractUncertainty(text: string): number {
    const match = text.match(/uncertainty[:\s]+(\d+(?:\.\d+)?)/i);
    return match ? parseFloat(match[1]) / 100 : 0.25;
  }

  private extractRecommendation(text: string): string {
    if (text.toLowerCase().includes('proceed') || text.toLowerCase().includes('approve')) {
      return 'PROCEED';
    } else if (text.toLowerCase().includes('retry') || text.toLowerCase().includes('revision')) {
      return 'RETRY';
    } else {
      return 'REJECT';
    }
  }

  private calculateQualityScore(qaResults: any): number {
    // Simple scoring algorithm
    let score = 1.0;
    
    if (qaResults.issues && qaResults.issues.length > 0) {
      score -= qaResults.issues.length * 0.1;
    }
    
    if (qaResults.dataCompleteness) {
      score *= qaResults.dataCompleteness;
    }
    
    return Math.max(0, Math.min(1, score));
  }
}
