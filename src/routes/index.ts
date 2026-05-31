import { Router } from 'express';
import { smsController } from '../controllers/sms.controller';
import { webhookController } from '../controllers/webhook.controller';
import { contactController } from '../controllers/contact.controller';
import { messageController } from '../controllers/message.controller';
import { templateController } from '../controllers/template.controller';
import { conversationController } from '../controllers/conversation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const router = Router();

// Webhook routes (no auth - validated by Twilio signature)
router.post('/webhooks/twilio/inbound', webhookController.handleInbound);
router.post('/webhooks/twilio/status', webhookController.handleStatus);

// API routes (require API key auth)
router.use('/api', authMiddleware);

// SMS sending
router.post('/api/sms/send', smsController.sendSingle);
router.post('/api/sms/send-bulk', smsController.sendBulk);
router.post('/api/sms/send-template', smsController.sendTemplate);

// Contacts
router.get('/api/contacts', contactController.list);
router.post('/api/contacts', contactController.create);
router.get('/api/contacts/:id', contactController.get);
router.put('/api/contacts/:id', contactController.update);
router.delete('/api/contacts/:id', contactController.remove);
router.post('/api/contacts/:id/opt-out', contactController.optOut);

// Messages
router.get('/api/messages', messageController.list);
router.get('/api/messages/:id', messageController.get);
router.post('/api/messages/:id/retry', messageController.retry);

// Templates
router.get('/api/templates', templateController.list);
router.post('/api/templates', templateController.create);
router.put('/api/templates/:id', templateController.update);
router.delete('/api/templates/:id', templateController.remove);

// Conversations
router.get('/api/conversations', conversationController.list);
router.get('/api/conversations/:id', conversationController.get);
router.put('/api/conversations/:id/close', conversationController.close);
