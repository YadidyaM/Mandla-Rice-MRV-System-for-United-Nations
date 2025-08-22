/**
 * Satellite Controller
 */

import { Request, Response } from 'express';

export class SatelliteController {
  async fetchSatelliteData(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: req.body });
  }

  async analyzeSatelliteData(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: req.body });
  }

  async getFarmSatelliteData(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: { farmId: req.params.farmId } });
  }
}
