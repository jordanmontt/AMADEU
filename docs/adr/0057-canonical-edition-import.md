# 0057. Canonical edition: its order, titles and notes; verses only where the PDF has them

- **Status:** Accepted; refines [0021](0021-provisional-text-tomo-i.md)
- **Date:** 2026-11-25
- **Requirements:** RF-05, RF-21, RF-22, RF-58, RF-59

## Context

The canonical text of *Sangre y Sueño* arrived as a PDF exported from a word processor: "Texto canónico – Sangre y Sueño 2027", a commemorative edition with introduction, notes and editing by Oscar Jordán Arandia. Alongside it came the audio of each song, grouped and numbered as in the 1981 book.

The PDF covers only the songbook, in two parts:
- **Sangre y sueño 1981:** the 1981 edition in chronological order, with the 1981 titles.
- **Sangre y sueño 1994:** the songs added in the 1994 and 2013 editions, in alphabetical order.

The *Relatos poéticos de Diego Calahumana* are not in it.

The PDF is a draft at different stages:
- **Pages 4 to 25** set 18 texts in verses, with 72 footnotes. The notes give the variants of the 1994 and 2013 editions, the later titles and the changes in the recordings.
- **Pages 27 to 82** set the remaining texts as paragraphs of prose, with no line breaks between verses. A few have only a title: "Vacilando entre intuición y claridad" and "Distancias". "Patria" is in prose and has no other version.
- **"Encuentros"** is in the PDF but not in its table of contents, nor in the numbering of the songs.

## Decision

- **Import from a reviewable manifest** (`scripts/import/data/canonical.yml`, [ADR 0047](0047-initial-import.md)):
  - each printed text maps to the archive's permanent id, so the old URLs and permanent links still work (RF-58);
  - the import checks every printed title against the manifest and refuses any text of the old songbook section that is left out;
  - misprinted titles are corrected in the manifest: "Ayer nomás", "Amiga mía", "Dúo del violín y el mar", "Tú has nacido para ser mujer", "Cordillera Real".
- **The edition decides the structure for every text:**
  - the two sections replace the provisional "Libro de canciones";
  - each text takes its canonical title, section and order;
  - each text keeps the titles of the other editions as alternative titles.
- **The edition replaces the verses only where it sets them as verses.** Those texts take the canonical verses, dedication and notes, and stop being provisional.
- **A text in prose keeps its Tomo I verses and stays provisional.** It is listed in the Foundation's pending tasks as before, until the editor sends it in verses. Turning prose back into verses by guesswork would change the text.
- **Footnotes use the Markdown syntax:**
  - a verse calls a note with `[^3]`;
  - the `notes` field defines it with `[^3]: …`;
  - notes are numbered from 1 in each text;
  - on the page, the call is a superscript link to the note, and the note links back;
  - a call to a note that does not exist is an integrity error (RF-71).
- **Texts the PDF does not give are not created:** the two titles without text, and "Patria".
- **The recordings follow the songs' folder:**
  - "Niñez" is the recording of "Aquel antiguo deseo de llorar";
  - "Cordillera Real" is the recording of "Cordillera de los Andes".

## Consequences

- The songbook reads in the edition's order, with 18 texts final and their notes.
- 54 texts keep provisional verses until the edition sets them in verses. Running the import again with the new PDF replaces them, and keeps the order and title of the texts already done.
- An editor writes a note with the same `[^n]` syntax in the admin panel.
- Doubts for the Foundation are recorded on the texts and listed in the pending tasks:
  - whether "Encuentros" belongs to the book;
  - whether the title is "Cordillera Real" or "Cordillera de Real".

## Rejected alternatives

- **Import the prose as it is:** a song shown as a paragraph is worse than the Tomo I verses.
- **Rebuild the verses from the Tomo I line breaks:** the canonical wording differs from Tomo I, so the result would be a text neither edition printed.
- **Notes as a single paragraph:** the reader could not tell which verse a note is about.
