/**
 * Notification Controller
 */

import { Request, Response } from 'express';

export class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: [] });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: { id: req.params.id } });
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  }
}
