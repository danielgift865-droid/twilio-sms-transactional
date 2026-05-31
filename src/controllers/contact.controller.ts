import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.service';

const createContactSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format'),
  fullName: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const contactController = {
  async list(req: Request, res: Response) {
    const { page = '1', limit = '50', search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? {
      OR: [
        { phoneNumber: { contains: String(search) } },
        { fullName: { contains: String(search), mode: 'insensitive' as const } },
      ],
    } : {};

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.contact.count({ where }),
    ]);
    res.json({ contacts, total, page: Number(page), limit: Number(limit) });
  },

  async create(req: Request, res: Response) {
    try {
      const data = createContactSchema.parse(req.body);
      const contact = await prisma.contact.create({ data });
      res.status(201).json(contact);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async get(req: Request, res: Response) {
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  },

  async update(req: Request, res: Response) {
    try {
      const contact = await prisma.contact.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(contact);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  },

  async optOut(req: Request, res: Response) {
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { optedOut: true },
    });
    res.json(contact);
  },
};
