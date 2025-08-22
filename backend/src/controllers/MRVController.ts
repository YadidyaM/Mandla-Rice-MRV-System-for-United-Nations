/**
 * MRV Controller
 */

import { Request, Response } from 'express';
import { MRVService } from '../services/mrv/MRVService';

export class MRVController {
  private mrvService: MRVService;

  constructor() {
    this.mrvService = new MRVService();
  }

  async processMRV(req: Request, res: Response): Promise<void> {
    const result = await this.mrvService.processMRV(req.body);
    res.status(200).json({ success: true, data: result });
  }

  async getMRVReports(req: Request, res: Response): Promise<void> {
    const reports = await this.mrvService.getMRVReports((req as any).user.id, req.query);
    res.status(200).json({ success: true, data: reports });
  }

  async getMRVReport(req: Request, res: Response): Promise<void> {
    const report = await this.mrvService.getMRVReport(req.params.id);
    res.status(200).json({ success: true, data: report });
  }

  async verifyMRVReport(req: Request, res: Response): Promise<void> {
    const result = await this.mrvService.verifyMRVReport(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  }
}
