import { prisma } from './prisma.service';
import { logger } from './logger.service';
import { smsQueue } from '../workers/sms.worker';

const OPT_OUT_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const OPT_IN_KEYWORDS = ['START', 'YES'];

export const deliveryService = {
  /**
   * Handle Twilio status callback
   */
  async handleStatusUpdate(twilioSid: string, status: string, errorCode?: string) {
    const message = await prisma.message.findUnique({ where: { twilioSid } });
    if (!message) {
      logger.warn('Status update for unknown message', { twilioSid, status });
      return;
    }

    const updateData: Record<string, any> = { status };
    if (status === 'delivered') updateData.deliveredAt = new Date();
    if (status === 'failed' || status === 'undelivered') {
      updateData.failedAt = new Date();
      if (errorCode) updateData.errorCode = errorCode;
    }

    await prisma.message.update({
      where: { id: message.id },
      data: updateData,
    });

    logger.info('Message status updated', { messageId: message.id, twilioSid, status });
  },

  /**
   * Handle inbound SMS — manage opt-out/opt-in
   */
  async handleInbound(from: string, body: string) {
    const normalizedBody = body.trim().toUpperCase();
    const contact = await prisma.contact.findUnique({ where: { phoneNumber: from } });

    if (OPT_OUT_KEYWORDS.includes(normalizedBody)) {
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { optedOut: true },
        });
        logger.info('Contact opted out', { phone: from });
      }
      return 'opted_out';
    }

    if (OPT_IN_KEYWORDS.includes(normalizedBody)) {
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { optedOut: false },
        });
        logger.info('Contact opted in', { phone: from });
      }
      return 'opted_in';
    }

    return 'message';
  },

  /**
   * Retry a failed message
   */
  async retryMessage(messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { contact: true },
    });

    if (!message || message.status !== 'failed') {
      throw new Error('Message not found or not in failed state');
    }

    if (message.retryCount >= 3) {
      throw new Error('Maximum retry attempts reached');
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { status: 'queued', retryCount: { increment: 1 } },
    });

    await smsQueue.add('send-sms', {
      messageId: message.id,
      to: message.contact.phoneNumber,
      body: message.body,
    });

    return message;
  },
};
