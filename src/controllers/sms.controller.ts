import { Request, Response } from 'express';
import { z } from 'zod';
import { smsService } from '../services/sms.service';
import { templateService } from '../services/template.service';
import { prisma } from '../services/prisma.service';

const sendSingleSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format'),
  body: z.string().min(1).max(1600),
  contactId: z.string().uuid(),
  priority: z.enum(['high', 'normal', 'low']).optional(),
});

const sendTemplateSchema = z.object({
  contactId: z.string().uuid(),
  templateName: z.string(),
  variables: z.record(z.string()).optional().default({}),
  priority: z.enum(['high', 'normal', 'low']).optional(),
});

export const smsController = {
  async sendSingle(req: Request, res: Response) {
    try {
      const data = sendSingleSchema.parse(req.body);
      const contact = await prisma.contact.findUnique({ where: { id: data.contactId } });
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      if (contact.optedOut) return res.status(422).json({ error: 'Contact has opted out' });

      const message = await smsService.queueSms(data);
      res.status(202).json({ message, queued: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async sendBulk(req: Request, res: Response) {
    try {
      const { recipients } = req.body;
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'recipients must be a non-empty array' });
      }
      const results = await smsService.sendBulk(recipients);
      res.status(202).json({ results, total: results.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async sendTemplate(req: Request, res: Response) {
    try {
      const data = sendTemplateSchema.parse(req.body);
      const contact = await prisma.contact.findUnique({ where: { id: data.contactId } });
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      if (contact.optedOut) return res.status(422).json({ error: 'Contact has opted out' });

      const template = await templateService.getByName(data.templateName);
      if (!template) return res.status(404).json({ error: 'Template not found' });

      const body = templateService.render(template.body, data.variables);
      const message = await smsService.queueSms({
        to: contact.phoneNumber,
        body,
        contactId: contact.id,
        templateId: template.id,
        priority: data.priority,
      });

      res.status(202).json({ message, queued: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
