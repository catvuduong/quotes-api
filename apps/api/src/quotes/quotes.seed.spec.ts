import { QUOTE_SEED } from './quotes.seed.js';

describe('QUOTE_SEED', () => {
  it('has about sixty quotes', () => {
    expect(QUOTE_SEED.length).toBeGreaterThanOrEqual(60);
  });

  it('has no duplicate text and author pairs, which the unique index would reject', () => {
    const keys = QUOTE_SEED.map((q) => `${q.author}\u0000${q.text}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps every field within the limits the API accepts', () => {
    for (const quote of QUOTE_SEED) {
      expect(quote.text.trim()).toBe(quote.text);
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.text.length).toBeLessThanOrEqual(500);
      expect(quote.author.length).toBeLessThanOrEqual(100);
      expect(quote.category).toMatch(/^[a-z]+$/);
      expect(quote.language).toMatch(/^[a-z]{2,3}$/);
    }
  });
});
