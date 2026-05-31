// Mock prisma and logger before importing
jest.mock('../../src/services/prisma.service', () => ({
  prisma: {
    message: { findUnique: jest.fn(), update: jest.fn() },
    contact: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    conversation: { findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
  },
}));
jest.mock('../../src/services/logger.service', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../../src/workers/sms.worker', () => ({
  smsQueue: { add: jest.fn() },
}));

import { deliveryService } from '../../src/services/delivery.service';
import { prisma } from '../../src/services/prisma.service';

describe('deliveryService.handleInbound', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opts out contact on STOP keyword', async () => {
    (prisma.contact.findUnique as jest.Mock).mockResolvedValue({ id: 'c1' });
    (prisma.contact.update as jest.Mock).mockResolvedValue({});
    const result = await deliveryService.handleInbound('+1234567890', 'STOP');
    expect(result).toBe('opted_out');
    expect(prisma.contact.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { optedOut: true } })
    );
  });

  it('opts in contact on START keyword', async () => {
    (prisma.contact.findUnique as jest.Mock).mockResolvedValue({ id: 'c1' });
    (prisma.contact.update as jest.Mock).mockResolvedValue({});
    const result = await deliveryService.handleInbound('+1234567890', 'START');
    expect(result).toBe('opted_in');
    expect(prisma.contact.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { optedOut: false } })
    );
  });

  it('returns "message" for regular inbound text', async () => {
    (prisma.contact.findUnique as jest.Mock).mockResolvedValue({ id: 'c1' });
    const result = await deliveryService.handleInbound('+1234567890', 'What time does it arrive?');
    expect(result).toBe('message');
  });
});

describe('deliveryService.handleStatusUpdate', () => {
  it('updates message status to delivered', async () => {
    (prisma.message.findUnique as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.message.update as jest.Mock).mockResolvedValue({});
    await deliveryService.handleStatusUpdate('SID123', 'delivered');
    expect(prisma.message.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'delivered' }) })
    );
  });

  it('does nothing for unknown twilioSid', async () => {
    (prisma.message.findUnique as jest.Mock).mockResolvedValue(null);
    await deliveryService.handleStatusUpdate('UNKNOWN', 'delivered');
    expect(prisma.message.update).not.toHaveBeenCalled();
  });
});
