/**
 * Authentication Controller
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/auth/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    const result = await this.authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await this.authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const result = await this.authService.refreshToken(req.body.refreshToken);
    res.status(200).json({ success: true, data: result });
  }

  async logout(req: Request, res: Response): Promise<void> {
    await this.authService.logout((req as any).user.id);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await this.authService.getProfile((req as any).user.id);
    res.status(200).json({ success: true, data: profile });
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const profile = await this.authService.updateProfile((req as any).user.id, req.body);
    res.status(200).json({ success: true, data: profile });
  }
}
