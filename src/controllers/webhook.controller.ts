import { Request, Response } from 'express';
import { deliveryService } from '../services/delivery.service';
import { conversationService } from '../services/conversation.service';
import { prisma } from '../services/prisma.service';
import { logger } from '../services/logger.service';

export const webhookController = {
  async handleInbound(req: Request, res: Response) {
    try {
      const { From, Body, MessageSid } = req.body;
      logger.info('Inbound SMS received', { from: From, sid: MessageSid });

      // Find or create contact
      let contact = await prisma.contact.findUnique({ where: { phoneNumber: From } });
      if (!contact) {
        contact = await prisma.contact.create({ data: { phoneNumber: From } });
      }

      // Handle opt-out / opt-in keywords
      const result = await deliveryService.handleInbound(From, Body);

      // Save the inbound message
      await prisma.message.create({
        data: {
          contactId: contact.id,
          direction: 'inbound',
          body: Body,
          twilioSid: MessageSid,
          status: 'delivered',
          deliveredAt: new Date(),
        },
      });

      // Update/create conversation
      await conversationService.getOrCreate(contact.id);
      await conversationService.touch(contact.id);

      logger.info('Inbound message processed', { from: From, result });

      // Respond with empty TwiML (no auto-reply)
      res.set('Content-Type', 'text/xml');
      res.send('<Response></Response>');
    } catch (err: any) {
      logger.error('Webhook inbound error', { error: err.message });
      res.status(500).send('<Response></Response>');
    }
  },

  async handleStatus(req: Request, res: Response) {
    try {
      const { MessageSid, MessageStatus, ErrorCode } = req.body;
      logger.info('Status callback received', { sid: MessageSid, status: MessageStatus });

      await deliveryService.handleStatusUpdate(MessageSid, MessageStatus, ErrorCode);
      res.sendStatus(204);
    } catch (err: any) {
      logger.error('Status callback error', { error: err.message });
      res.status(500).json({ error: err.message });
    }
  },
};
