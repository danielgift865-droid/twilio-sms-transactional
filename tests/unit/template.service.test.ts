import { templateService } from '../../src/services/template.service';

describe('templateService.render', () => {
  it('replaces single variable', () => {
    expect(templateService.render('Hello {{name}}!', { name: 'Daniel' })).toBe('Hello Daniel!');
  });

  it('replaces multiple variables', () => {
    const result = templateService.render('Order {{id}} total: {{amount}}', { id: '123', amount: '$50' });
    expect(result).toBe('Order 123 total: $50');
  });

  it('leaves missing variables as-is', () => {
    expect(templateService.render('Hello {{name}}!', {})).toBe('Hello {{name}}!');
  });

  it('handles empty variables object', () => {
    expect(templateService.render('No vars here', {})).toBe('No vars here');
  });
});

describe('templateService.isMultiPart', () => {
  it('returns false for short messages', () => {
    expect(templateService.isMultiPart('Hello!')).toBe(false);
  });

  it('returns true for messages over 160 chars', () => {
    expect(templateService.isMultiPart('A'.repeat(161))).toBe(true);
  });
});

describe('templateService.splitIntoSegments', () => {
  it('returns single segment for short messages', () => {
    expect(templateService.splitIntoSegments('Hello!')).toHaveLength(1);
  });

  it('splits long messages correctly', () => {
    const long = 'A'.repeat(400);
    const parts = templateService.splitIntoSegments(long);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.join('')).toBe(long);
  });
});
