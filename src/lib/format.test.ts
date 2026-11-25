import { describe, expect, it } from 'vitest';
import { formatArchiveDate, formatDuration, stanzas } from './format';

describe('formatArchiveDate', () => {
  it('shows years, months, days and intervals the Spanish way', () => {
    expect(formatArchiveDate('1984')).toBe('1984');
    expect(formatArchiveDate('1993-05')).toBe('05/1993');
    expect(formatArchiveDate('1981-06-12')).toBe('12/06/1981');
    expect(formatArchiveDate('1993/1995')).toBe('1993–1995');
  });
});

describe('formatDuration', () => {
  it('shows minutes and seconds, and hours from one hour', () => {
    expect(formatDuration(51)).toBe('0:51');
    expect(formatDuration(146.4)).toBe('2:26');
    expect(formatDuration(2785)).toBe('46:25');
    expect(formatDuration(3350)).toBe('55:50');
    expect(formatDuration(3725)).toBe('1:02:05');
  });
});

describe('stanzas', () => {
  it('splits a body into stanzas of verses, ignoring surrounding blank lines', () => {
    expect(stanzas('\nuno\ndos  \n\ntres\n\n\n')).toEqual([['uno', 'dos'], ['tres']]);
  });

  it('gives no stanza for an empty body', () => {
    expect(stanzas('\n\n')).toEqual([]);
  });
});
