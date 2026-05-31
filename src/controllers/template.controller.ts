import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.service';

const templateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['otp', 'order', 'payment', 'shipping', 'reminder', 'custom']),
  body: z.string().min(1).max(1600),
  isActive: z.boolean().optional().default(true),
});

export const templateController = {
  async list(_req: Request, res: Response) {
    const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(templates);
  },

  async create(req: Request, res: Response) {
    try {
      const data = templateSchema.parse(req.body);
      const template = await prisma.template.create({ data });
      res.status(201).json(template);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const template = await prisma.template.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(template);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    await prisma.template.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  },
};
