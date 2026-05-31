import twilio from 'twilio';
import { logger } from './logger.service';
import { prisma } from './prisma.service';
import { smsQueue } from '../workers/sms.worker';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export interface SendSmsOptions {
  to: string;
  body: string;
  contactId: string;
  templateId?: string;
  priority?: 'high' | 'normal' | 'low';
}

export const smsService = {
  /**
   * Queue a single SMS for sending
   */
  async queueSms(options: SendSmsOptions) {
    const message = await prisma.message.create({
      data: {
        contactId: options.contactId,
        direction: 'outbound',
        body: options.body,
        templateId: options.templateId,
        status: 'queued',
      },
    });

    await smsQueue.add('send-sms', {
      messageId: message.id,
      to: options.to,
      body: options.body,
    }, {
      priority: options.priority === 'high' ? 1 : options.priority === 'low' ? 10 : 5,
      attempts: 3,
      backoff: { type: 'exponential', delay: 60000 },
    });

    logger.info('SMS queued', { messageId: message.id, to: options.to });
    return message;
  },

  /**
   * Send SMS immediately via Twilio
   */
  async sendImmediate(messageId: string, to: string, body: string) {
    try {
      const twilioMessage = await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to,
        body,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK,
      });

      await prisma.message.update({
        where: { id: messageId },
        data: {
          twilioSid: twilioMessage.sid,
          status: 'sent',
          sentAt: new Date(),
        },
      });

      logger.info('SMS sent', { messageId, twilioSid: twilioMessage.sid, to });
      return twilioMessage;
    } catch (error: any) {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'failed',
          errorCode: error.code?.toString() || 'UNKNOWN',
          failedAt: new Date(),
        },
      });
      logger.error('SMS send failed', { messageId, to, error: error.message });
      throw error;
    }
  },

  /**
   * Send bulk SMS to multiple contacts
   */
  async sendBulk(recipients: Array<{ contactId: string; to: string; body: string }>) {
    const results = await Promise.allSettled(
      recipients.map(r => this.queueSms({ ...r, priority: 'normal' }))
    );
    return results;
  },
};
