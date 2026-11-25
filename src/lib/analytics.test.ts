import { describe, expect, it } from 'vitest';
import { goatCounter } from './analytics';

describe('goatCounter (RF-62)', () => {
  it('counts nothing until a site code is configured', () => {
    expect(goatCounter(undefined)).toBeUndefined();
    expect(goatCounter('')).toBeUndefined();
  });

  it("gives the site's counter and its public dashboard", () => {
    expect(goatCounter('marcelo-urioste')).toEqual({
      endpoint: 'https://marcelo-urioste.goatcounter.com/count',
      dashboard: 'https://marcelo-urioste.goatcounter.com/',
    });
  });

  it('refuses a code that would point elsewhere', () => {
    expect(() => goatCounter('evil.example/x')).toThrow(/not a GoatCounter site code/);
  });
});
