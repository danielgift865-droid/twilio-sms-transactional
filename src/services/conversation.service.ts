import { prisma } from './prisma.service';
import { logger } from './logger.service';

export const conversationService = {
  /**
   * Get or create an open conversation for a contact
   */
  async getOrCreate(contactId: string) {
    let conversation = await prisma.conversation.findFirst({
      where: { contactId, status: 'open' },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { contactId, status: 'open', lastMessageAt: new Date() },
      });
      logger.info('New conversation created', { conversationId: conversation.id, contactId });
    }

    return conversation;
  },

  /**
   * Update last message timestamp
   */
  async touch(contactId: string) {
    await prisma.conversation.updateMany({
      where: { contactId, status: 'open' },
      data: { lastMessageAt: new Date() },
    });
  },

  /**
   * Close a conversation
   */
  async close(conversationId: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'closed' },
    });
  },
};
