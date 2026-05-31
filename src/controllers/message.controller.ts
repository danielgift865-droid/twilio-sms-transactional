import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';
import { deliveryService } from '../services/delivery.service';

export const messageController = {
  async list(req: Request, res: Response) {
    const { page = '1', limit = '50', status, contactId, direction } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: Record<string, any> = {};
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (direction) where.direction = direction;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { phoneNumber: true, fullName: true } }, template: { select: { name: true } } },
      }),
      prisma.message.count({ where }),
    ]);
    res.json({ messages, total, page: Number(page), limit: Number(limit) });
  },

  async get(req: Request, res: Response) {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: { contact: true, template: true },
    });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  },

  async retry(req: Request, res: Response) {
    try {
      const message = await deliveryService.retryMessage(req.params.id);
      res.json({ message, retrying: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
