import type { CatalogItem, Pack } from './schema';
import { loadData } from './data';

export type Requirement = NonNullable<CatalogItem['requires']>[number];

export function sumTypicalRange(ids: string[]) {
  const { catalog } = loadData();
  return ids.reduce<[number, number]>(
    (acc, id) => {
      const it = catalog[id];
      if (!it) return acc;
      return [
        acc[0] + it.price.typical_range[0],
        acc[1] + it.price.typical_range[1],
      ];
    },
    [0, 0],
  );
}

export function deriveRequirements(itemIds: string[]) {
  const { catalog } = loadData();
  const reqs: Requirement[] = [];

  itemIds.forEach((id) => {
    const it = catalog[id];
    if (it?.requires) reqs.push(...it.requires);
  });

  const merged: Requirement[] = [];
  const batteryMap = new Map<string, { qty?: number; notes?: string }>();

  reqs.forEach((r) => {
    if (r.kind === 'battery') {
      const current = batteryMap.get(r.title) ?? { qty: 0, notes: r.notes };
      batteryMap.set(r.title, {
        qty: (current.qty ?? 0) + (r.qty ?? 0),
        notes: current.notes ?? r.notes,
      });
    } else {
      merged.push(r);
    }
  });

  for (const [title, info] of batteryMap.entries()) {
    merged.unshift({
      kind: 'battery',
      title,
      qty: info.qty || undefined,
      notes: info.notes,
    });
  }

  return merged;
}

export function packItemIds(pack: Pack) {
  const ids: string[] = [];
  if (pack.items.radio) ids.push(pack.items.radio);
  if (pack.items.goggles) ids.push(pack.items.goggles);
  if (pack.items.drone) ids.push(pack.items.drone);
  if (pack.items.practice) ids.push(pack.items.practice);
  if (pack.items.charger) ids.push(pack.items.charger);
  if (pack.items.batteries?.length) ids.push(...pack.items.batteries);
  if (pack.items.accessories?.length) ids.push(...pack.items.accessories);
  return ids;
}
