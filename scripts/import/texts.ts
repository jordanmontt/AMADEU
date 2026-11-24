/**
 * Imports the provisional texts of Sangre y Sueño from the Tomo I PDF (RT §10, step 1).
 * Usage: npx tsx scripts/import/texts.ts [--force]
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { basename } from 'node:path';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { archivePath, contentRoot, writeContentFile } from '../lib/archive';
import { markdownEntry } from '../lib/content-files';
import { type EditionInfo, type SectionImport, importedTexts } from '../lib/import-texts';
import { type Page, parsePageXml, splitIntoTexts } from '../lib/tomo';

interface Config {
  readonly pdf: string;
  readonly work: string;
  readonly edition: EditionInfo;
  readonly sections: readonly (SectionImport & { firstPage: number; lastPage: number })[];
  readonly titleCorrections: Record<string, string>;
}

const config = parse(readFileSync('scripts/import/data/tomo-i.yml', 'utf8')) as Config;
const pdf = archivePath(config.pdf);
const workIds = new Set(
  readdirSync(join(contentRoot, 'works')).map((file) => basename(file).replace(/\.ya?ml$/, '')),
);

function readPages(firstPage: number, lastPage: number): Page[] {
  const dir = mkdtempSync(join(tmpdir(), 'amadeu-tomo-'));
  try {
    execFileSync('gs', [
      '-q',
      '-dNOPAUSE',
      '-dBATCH',
      '-sDEVICE=txtwrite',
      '-dTextFormat=1',
      `-dFirstPage=${firstPage}`,
      `-dLastPage=${lastPage}`,
      `-sOutputFile=${join(dir, 'page-%04d.xml')}`,
      pdf,
    ]);
    return readdirSync(dir)
      .sort()
      .map((file, index) => ({
        number: firstPage + index,
        lines: parsePageXml(readFileSync(join(dir, file), 'utf8')),
      }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const section of config.sections) {
  const texts = splitIntoTexts(readPages(section.firstPage, section.lastPage));
  const entries = importedTexts(texts, section, { ...config, takenIds: workIds });
  const results = entries.map((entry) =>
    writeContentFile(
      join(contentRoot, 'texts', `${entry.id}.md`),
      markdownEntry(entry.data, entry.body),
    ),
  );
  const written = results.filter((result) => result === 'written').length;
  console.log(
    `${section.section}: ${entries.length} texts (${written} written, ${entries.length - written} kept)`,
  );
}
