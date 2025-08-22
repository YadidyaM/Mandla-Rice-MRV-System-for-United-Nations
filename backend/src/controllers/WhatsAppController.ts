/**
 * WhatsApp Controller
 */

import { Request, Response } from 'express';

export class WhatsAppController {
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    // Process WhatsApp webhook
    res.status(200).json({ success: true });
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: req.body });
  }
}
