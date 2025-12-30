import { parse } from 'yaml';
import type { ZodSchema } from 'zod';
import {
  catalogItemSchema,
  checklistSchema,
  notesSchema,
  packSchema,
  type CatalogItem,
  type Checklist,
  type Notes,
  type Pack,
} from './schema';

const itemFiles = import.meta.glob('../data/catalog/items/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const packFiles = import.meta.glob('../data/packs/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const checklistFiles = import.meta.glob('../data/checklists/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const noteFiles = import.meta.glob('../data/notes/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function loadCollection<T extends { id: string }>(
  files: Record<string, string>,
  schema: ZodSchema<T>,
  label: string,
) {
  const entries: Record<string, T> = {};

  for (const [path, raw] of Object.entries(files)) {
    try {
      const parsed = parse(raw) as unknown;
      const item = schema.parse(parsed);
      entries[item.id] = item;
    } catch (err) {
      console.error(`[data] Failed to parse ${label} from ${path}`, err);
    }
  }

  return entries;
}

function warnMissing(ids: string[], kind: string) {
  if (!ids.length) return;
  console.warn(`[data] Missing ${kind}: ${ids.join(', ')}`);
}

let cached: {
  catalog: Record<string, CatalogItem>;
  packs: Record<string, Pack>;
  checklists: Record<string, Checklist>;
  notes: Record<string, Notes>;
} | null = null;

export function loadData() {
  if (cached) return cached;

  const catalog = loadCollection(itemFiles, catalogItemSchema, 'catalog');
  const checklists = loadCollection(
    checklistFiles,
    checklistSchema,
    'checklist',
  );
  const notes = loadCollection(noteFiles, notesSchema, 'notes');
  const packs = loadCollection(packFiles, packSchema, 'pack');

  // Basic referential integrity checks
  for (const pack of Object.values(packs)) {
    const missingItems: string[] = [];
    const requiredIds = [
      pack.items.radio,
      pack.items.goggles,
      pack.items.drone,
      pack.items.practice,
      pack.items.charger,
      ...(pack.items.batteries ?? []),
      ...(pack.items.accessories ?? []),
    ].filter(Boolean) as string[];

    requiredIds.forEach((id) => {
      if (!catalog[id]) missingItems.push(id);
    });

    if (missingItems.length) {
      warnMissing(missingItems, `items referenced by pack ${pack.id}`);
    }

    if (pack.notes_ref && !notes[pack.notes_ref]) {
      warnMissing([pack.notes_ref], `notes for pack ${pack.id}`);
    }

    const missingChecklists = (pack.checklist_refs ?? []).filter(
      (id) => !checklists[id],
    );
    if (missingChecklists.length)
      warnMissing(missingChecklists, `checklists for pack ${pack.id}`);
  }

  cached = { catalog, packs, checklists, notes };
  return cached;
}

export function getCatalogList() {
  return Object.values(loadData().catalog).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

export function getPackList() {
  return Object.values(loadData().packs).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

export function getPackById(id: string) {
  return loadData().packs[id];
}

export function getItemById(id: string) {
  return loadData().catalog[id];
}

export function getChecklistById(id: string) {
  return loadData().checklists[id];
}

export function getNotesById(id: string) {
  return loadData().notes[id];
}
