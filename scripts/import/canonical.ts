/**
 * Applies the canonical edition of Sangre y Sueño to its texts (ADR 0057): new titles,
 * sections and order for every text, and the verses and notes of the texts the PDF sets in
 * verses. Without --force it only reports what it would change.
 * Usage: npx tsx scripts/import/canonical.ts [--force]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parse } from 'yaml';
import { contentRoot, overwrite } from '../lib/archive';
import { splitCanonical } from '../lib/canonical';
import { markdownEntry } from '../lib/content-files';
import { type ExistingText, type Manifest, planCanonical } from '../lib/import-canonical';
import { readPdfPages } from '../lib/read-pdf';

const manifest = parse(readFileSync('scripts/import/data/canonical.yml', 'utf8')) as Manifest & {
  pdf: string;
};
const pdf = resolve(process.env.CANONICAL_PDF ?? manifest.pdf);
if (!existsSync(pdf)) {
  throw new Error(`Not found: ${pdf} (set CANONICAL_PDF)`);
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const textsDir = join(contentRoot, 'texts');
const existing = new Map<string, ExistingText>(
  readdirSync(textsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const [, frontmatter = '', body = ''] =
        FRONTMATTER.exec(readFileSync(join(textsDir, file), 'utf8')) ?? [];
      return [basename(file, '.md'), { data: parse(frontmatter) as Record<string, unknown>, body }];
    }),
);

const printed = new Map(
  await Promise.all(
    manifest.sections.map(
      async (section) =>
        [
          section.id,
          splitCanonical(await readPdfPages(pdf, section.firstPage, section.lastPage)),
        ] as const,
    ),
  ),
);
const plan = planCanonical(manifest, printed, existing);

for (const change of ['created', 'replaced', 'reordered'] as const) {
  const ids = plan.texts.filter((text) => text.change === change).map((text) => text.id);
  console.log(`${change} (${String(ids.length)}): ${ids.join(', ')}`);
}
for (const { printed: title, reason } of plan.skipped) {
  console.log(`skipped: «${title}»: ${reason}`);
}
if (!overwrite) {
  console.log('Dry run: run with --force to write the files.');
} else {
  for (const text of plan.texts) {
    writeFileSync(join(textsDir, `${text.id}.md`), markdownEntry(text.data, text.body));
  }
  console.log(`Wrote ${String(plan.texts.length)} texts.`);
}
