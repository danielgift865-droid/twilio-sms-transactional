import { prisma } from './prisma.service';

const MAX_SMS_LENGTH = 160;

export const templateService = {
  /**
   * Render a template with variable substitution
   */
  render(body: string, variables: Record<string, string>): string {
    return body.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  },

  /**
   * Get a template by name
   */
  async getByName(name: string) {
    return prisma.template.findUnique({ where: { name, isActive: true } });
  },

  /**
   * Check if message needs multi-part splitting
   */
  isMultiPart(body: string): boolean {
    return body.length > MAX_SMS_LENGTH;
  },

  /**
   * Split long message into SMS segments
   */
  splitIntoSegments(body: string): string[] {
    const segmentLength = 153; // Multi-part SMS uses 7 bytes for header
    if (body.length <= MAX_SMS_LENGTH) return [body];
    const segments: string[] = [];
    for (let i = 0; i < body.length; i += segmentLength) {
      segments.push(body.slice(i, i + segmentLength));
    }
    return segments;
  },
};
