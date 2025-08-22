/**
 * WhatsApp Bot Routes
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { whatsappSchemas } from '../middleware/validation';
import { WhatsAppController } from '../controllers/WhatsAppController';

const router = Router();
const whatsappController = new WhatsAppController();

// WhatsApp webhook verification
router.get('/webhook',
  asyncHandler(whatsappController.verifyWebhook.bind(whatsappController))
);

// WhatsApp webhook message handler
router.post('/webhook',
  validateRequest(whatsappSchemas.webhook),
  asyncHandler(whatsappController.handleWebhook.bind(whatsappController))
);

// Send WhatsApp message
router.post('/send',
  asyncHandler(whatsappController.sendMessage.bind(whatsappController))
);

export default router;
