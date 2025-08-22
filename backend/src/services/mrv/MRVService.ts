/**
 * MRV Service - Delegates to LangChain Agent
 */

import { PrismaClient } from '@prisma/client';
import { LangChainAgentService } from '../agents/LangChainAgentService';

export class MRVService {
  private prisma: PrismaClient;
  private agentService: LangChainAgentService;

  constructor() {
    this.prisma = new PrismaClient();
    this.agentService = new LangChainAgentService(this.prisma);
  }

  async processMRV(data: { farmId: string; seasonId: string }): Promise<any> {
    return await this.agentService.processMRVWorkflow(data.farmId, data.seasonId);
  }

  async getMRVReports(userId: string, query: any): Promise<any> {
    return await this.prisma.mRVReport.findMany({
      where: { farmerId: userId },
      include: {
        farm: true,
        season: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMRVReport(reportId: string): Promise<any> {
    return await this.prisma.mRVReport.findUnique({
      where: { id: reportId },
      include: {
        farm: true,
        season: true,
        carbonCredits: true
      }
    });
  }

  async verifyMRVReport(reportId: string, data: any): Promise<any> {
    return await this.prisma.mRVReport.update({
      where: { id: reportId },
      data: {
        verificationStatus: data.status,
        verificationNotes: data.verificationNotes,
        verificationDate: new Date(),
        verifiedBy: 'SYSTEM' // In real implementation, this would be the verifier ID
      }
    });
  }
}
