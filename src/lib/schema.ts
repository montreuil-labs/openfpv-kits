import { z } from 'zod';

export const priceSchema = z.object({
  currency: z.literal('USD'),
  typical_range: z.tuple([z.number(), z.number()]),
  note: z.string().optional(),
});

const requirementBase = z.object({
  title: z.string(),
  notes: z.string().optional(),
});

export const requirementSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('battery'),
      qty: z.number().optional(),
    })
    .merge(requirementBase),
  z.object({ kind: z.literal('power') }).merge(requirementBase),
  z.object({ kind: z.literal('tools') }).merge(requirementBase),
  z.object({ kind: z.literal('account') }).merge(requirementBase),
]);

const includedSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('battery'),
      qty: z.number().optional(),
    })
    .merge(requirementBase),
  z.object({ kind: z.literal('cable') }).merge(requirementBase),
  z.object({ kind: z.literal('misc') }).merge(requirementBase),
]);

const batteryOptionSchema = z.object({
  title: z.string(),
  typical_range_usd: z.tuple([z.number(), z.number()]).optional(),
  notes: z.string().optional(),
});

const powerOptionSchema = z.object({
  title: z.string(),
  notes: z.string().optional(),
});

export const catalogItemSchema = z.object({
  id: z.string(),
  type: z.enum([
    'radio',
    'goggles',
    'drone',
    'battery',
    'charger',
    'accessory',
    'simulator',
  ]),
  brand: z.string().optional(),
  model: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  price: priceSchema,
  links: z
    .object({
      official: z.string().optional(),
      search: z.string().optional(),
    })
    .optional(),
  requires: z.array(requirementSchema).optional(),
  includes: z.array(includedSchema).optional(),
  battery_options: z.array(batteryOptionSchema).optional(),
  power_options: z.array(powerOptionSchema).optional(),
  also_see: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  replaced_by: z.string().optional(),
});

const packItemsSchema = z.object({
  radio: z.string().optional(),
  goggles: z.string().optional(),
  drone: z.string().optional(),
  practice: z.string().optional(),
  batteries: z.array(z.string()).optional(),
  charger: z.string().optional(),
  accessories: z.array(z.string()).optional(),
});

const upgradePathSchema = z.object({
  id: z.string(),
  title: z.string(),
  delta_usd_typical: z.tuple([z.number(), z.number()]),
  why: z.string(),
  change: z.object({
    replace: packItemsSchema.partial().optional(),
    note: z.string().optional(),
  }),
});

export const packSchema = z.object({
  id: z.string(),
  title: z.string(),
  video_system: z
    .enum(['analog', 'hdzero', 'walksnail', 'dji', 'mixed'])
    .default('analog'),
  form_factor: z.enum(['tinywhoop', '2-3inch', '5inch', 'cinewhoop', 'mixed']),
  skill_level: z
    .enum(['beginner', 'beginner_plus', 'intermediate'])
    .default('beginner'),
  items: packItemsSchema,
  est_total: priceSchema,
  pitch: z.object({
    best_for: z.array(z.string()).default([]),
    tradeoffs: z.array(z.string()).default([]),
  }),
  upgrade_paths: z.array(upgradePathSchema).default([]),
  checklist_refs: z.array(z.string()).default([]),
  notes_ref: z.string().optional(),
  status: z.string().optional(),
});

export const checklistSchema = z.object({
  id: z.string(),
  title: z.string(),
  groups: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          linkText: z.string().optional(),
          href: z.string().optional(),
          tags: z.array(z.string()).optional(),
        }),
      ),
    }),
  ),
});

export const notesSchema = z.object({
  id: z.string(),
  substitutes: z.array(z.object({ text: z.string() })).default([]),
  pitfalls: z.array(z.object({ text: z.string() })).default([]),
  regrets: z.array(z.object({ text: z.string() })).default([]),
  tips: z.array(z.object({ text: z.string() })).default([]),
});

export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type Pack = z.infer<typeof packSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
export type Notes = z.infer<typeof notesSchema>;
