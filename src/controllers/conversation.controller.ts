import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';
import { conversationService } from '../services/conversation.service';

export const conversationController = {
  async list(req: Request, res: Response) {
    const { status, page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status: status as any } : {};

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { lastMessageAt: 'desc' },
        include: { contact: { select: { phoneNumber: true, fullName: true } } },
      }),
      prisma.conversation.count({ where }),
    ]);
    res.json({ conversations, total, page: Number(page), limit: Number(limit) });
  },

  async get(req: Request, res: Response) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        contact: true,
      },
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = await prisma.message.findMany({
      where: { contactId: conversation.contactId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ ...conversation, messages });
  },

  async close(req: Request, res: Response) {
    try {
      const conversation = await conversationService.close(req.params.id);
      res.json(conversation);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
