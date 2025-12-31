import React, { useEffect, useMemo, useState } from 'react';

export type Requirement = {
  kind: 'battery' | 'power' | 'tools' | 'account';
  title: string;
  qty?: number;
  notes?: string;
};

export type CatalogItemInput = {
  id: string;
  title: string;
  summary: string;
  type: string;
  tags: string[];
  price: {
    typical_range: [number, number];
  };
  requires?: Requirement[];
};

type Props = {
  catalog: CatalogItemInput[];
  seedItems?: string[];
  packSeeds?: { id: string; items: string[] }[];
};

type Category = {
  id: string;
  label: string;
  types: string[];
  mode: 'single' | 'multi';
  initiallyOpen?: boolean;
  hint?: string;
};

const categories: Category[] = [
  {
    id: 'radio',
    label: 'Radio',
    types: ['radio'],
    mode: 'single',
    initiallyOpen: true,
    hint: 'Pick one controller.',
  },
  {
    id: 'goggles',
    label: 'Goggles',
    types: ['goggles'],
    mode: 'single',
    initiallyOpen: true,
    hint: 'Pick one viewer.',
  },
  {
    id: 'drone',
    label: 'Drone',
    types: ['drone'],
    mode: 'single',
    initiallyOpen: true,
    hint: 'Pick one airframe.',
  },
  {
    id: 'charger',
    label: 'Charger',
    types: ['charger'],
    mode: 'single',
    initiallyOpen: true,
    hint: 'Pick one charger.',
  },
  {
    id: 'simulator',
    label: 'Practice / Simulator',
    types: ['simulator'],
    mode: 'single',
    initiallyOpen: true,
    hint: 'Optional sim time.',
  },
  {
    id: 'batteries',
    label: 'Batteries',
    types: ['battery'],
    mode: 'multi',
    initiallyOpen: false,
    hint: 'Add what you need.',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    types: ['accessory'],
    mode: 'multi',
    initiallyOpen: false,
    hint: 'Extras and spares.',
  },
];

const VIDEO_SYSTEM_TAGS = ['analog', 'hdzero', 'walksnail', 'dji'];

function uniq(list: string[]) {
  return Array.from(new Set(list));
}

function deriveRequirements(items: string[], catalog: CatalogItemInput[]) {
  const map = new Map<string, Requirement>();
  const extras: Requirement[] = [];

  items.forEach((id) => {
    const item = catalog.find((c) => c.id === id);
    if (!item?.requires) return;
    item.requires.forEach((req) => {
      if (req.kind === 'battery') {
        const cur = map.get(req.title) ?? { ...req, qty: 0 };
        map.set(req.title, {
          ...cur,
          qty: (cur.qty ?? 0) + (req.qty ?? 0),
          notes: cur.notes ?? req.notes,
        });
      } else {
        extras.push(req);
      }
    });
  });

  return [...map.values(), ...extras];
}

function formatRange(values: [number, number]) {
  return `$${Math.round(values[0])} – $${Math.round(values[1])}`;
}

function sumRange(items: string[], catalog: CatalogItemInput[]) {
  return items.reduce<[number, number]>(
    (acc, id) => {
      const item = catalog.find((c) => c.id === id);
      if (!item) return acc;
      return [
        acc[0] + item.price.typical_range[0],
        acc[1] + item.price.typical_range[1],
      ];
    },
    [0, 0],
  );
}

function getVideoSystemTag(tags: string[]) {
  const found = tags.find((tag) => VIDEO_SYSTEM_TAGS.includes(tag));
  return found ? found.toUpperCase() : null;
}

export function BuilderIsland({
  catalog,
  seedItems = [],
  packSeeds = [],
}: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState('');
  const hydrated = React.useRef(false);
  const lastSelectedKey = React.useRef('__init__');
  const seeded = React.useRef(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(categories.filter((c) => c.initiallyOpen).map((c) => c.id)),
  );

  const catalogMap = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );

  const categoryByType = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => {
      cat.types.forEach((type) => map.set(type, cat));
    });
    return map;
  }, []);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((item) =>
      `${item.title} ${item.summary} ${item.tags.join(' ')}`
        .toLowerCase()
        .includes(q),
    );
  }, [catalog, query]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, CatalogItemInput[]>();
    filteredCatalog.forEach((item) => {
      const cat = categoryByType.get(item.type);
      if (!cat) return;
      const next = map.get(cat.id) ?? [];
      map.set(cat.id, [...next, item]);
    });
    return map;
  }, [filteredCatalog, categoryByType]);

  const selectedByCategory = useMemo(() => {
    const map = new Map<string, CatalogItemInput[]>();
    selected.forEach((id) => {
      const item = catalogMap.get(id);
      if (!item) return;
      const cat = categoryByType.get(item.type);
      if (!cat) return;
      const next = map.get(cat.id) ?? [];
      map.set(cat.id, [...next, item]);
    });
    return map;
  }, [selected, catalogMap, categoryByType]);

  useEffect(() => {
    hydrated.current = true;
  }, []);

  // Ensure share link is set on first render
  useEffect(() => {
    const url = new URL(window.location.href);
    setShareUrl(url.href);
  }, []);

  // Seed once from URL or provided pack
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('items');
    if (fromUrl) {
      const next = fromUrl.split(',').filter(Boolean);
      setSelected(next);
      return;
    }

    const seedId = params.get('seed');
    if (seedId && packSeeds?.length) {
      const seedPack = packSeeds.find((p) => p.id === seedId);
      if (seedPack) {
        setSelected(uniq(seedPack.items));
        return;
      }
    }

    if (seedItems.length) {
      setSelected(uniq(seedItems));
    }
  }, [packSeeds, seedItems]);

  // Sync URL when selection changes
  useEffect(() => {
    if (!hydrated.current) return;
    const key = selected.join(',');
    if (key === lastSelectedKey.current) return;
    lastSelectedKey.current = key;

    const url = new URL(window.location.href);
    if (selected.length) url.searchParams.set('items', key);
    else url.searchParams.delete('items');
    const next = url.pathname + url.search;
    const current = window.location.pathname + window.location.search;
    if (next !== current) {
      window.history.replaceState({}, '', next);
    }
    setShareUrl(window.location.origin + next);
  }, [selected]);

  const totals = useMemo(
    () => sumRange(selected, catalog),
    [selected, catalog],
  );
  const requirements = useMemo(
    () => deriveRequirements(selected, catalog),
    [selected, catalog],
  );

  const totalLabel = selected.length ? formatRange(totals) : '';

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearCategory(cat: Category) {
    setSelected((prev) =>
      prev.filter((id) => {
        const item = catalogMap.get(id);
        if (!item) return false;
        return !cat.types.includes(item.type);
      }),
    );
  }

  function toggleItem(item: CatalogItemInput) {
    const cat = categoryByType.get(item.type);
    if (!cat) return;

    setSelected((prev) => {
      const isSelected = prev.includes(item.id);
      if (cat.mode === 'single') {
        const withoutType = prev.filter((id) => {
          const cur = catalogMap.get(id);
          return cur && cur.type !== item.type;
        });
        return isSelected ? withoutType : uniq([...withoutType, item.id]);
      }

      return isSelected
        ? prev.filter((id) => id !== item.id)
        : uniq([...prev, item.id]);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card space-y-4">
        <div className="section-title">
          <h2>Builder</h2>
          <p className="muted">Assemble a kit and share a link for feedback.</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalog (e.g., pocket, cobra, 18650)…"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
          />

          <div className="mt-3 space-y-3">
            {categories.map((cat) => {
              const isOpen = expanded.has(cat.id);
              const items = itemsByCategory.get(cat.id) ?? [];
              return (
                <div
                  key={cat.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(cat.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        {cat.label}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {cat.hint}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-muted)]">
                      {items.length
                        ? `${items.length} item${items.length > 1 ? 's' : ''}`
                        : 'Empty'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-2 border-t border-[var(--color-border)] px-3 py-3">
                      {items.length === 0 && (
                        <p className="text-xs text-[var(--color-muted)]">
                          No items found.
                        </p>
                      )}
                      {items.map((item) => {
                        const isSelected = selected.includes(item.id);
                        const video = getVideoSystemTag(item.tags);
                        return (
                          <button
                            key={item.id}
                            className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                              isSelected
                                ? 'border-[var(--color-accent)] bg-[var(--color-surface)]'
                                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                            }`}
                            onClick={() => toggleItem(item)}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-semibold text-[var(--color-ink)]">
                                  {item.title}
                                </p>
                                <p className="text-xs text-[var(--color-muted)]">
                                  {item.summary}
                                </p>
                                <div className="flex flex-wrap gap-1 text-[10px] text-[var(--color-muted)]">
                                  {video ? (
                                    <span className="badge">{video}</span>
                                  ) : null}
                                  {item.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="badge">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-[var(--color-ink)]">
                                  {formatRange(item.price.typical_range)}
                                </p>
                                {isSelected ? (
                                  <span className="inline-block text-[10px] font-semibold text-[var(--color-accent)]">
                                    Selected
                                  </span>
                                ) : (
                                  <span className="inline-block text-[10px] text-[var(--color-muted)]">
                                    {cat.mode === 'single'
                                      ? 'Add / Replace'
                                      : 'Add'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--color-muted)]">Your kit</p>
            <p className="text-lg font-semibold">
              {selected.length ? `${selected.length} items` : 'No items yet'}
            </p>
          </div>
          <p className="text-sm font-semibold">{totalLabel || ''}</p>
        </div>

        {requirements.length ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
            <p className="text-sm font-semibold">Warnings</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {requirements.map((r) => (
                <li key={`${r.title}-${r.kind}`}>
                  {r.kind === 'battery'
                    ? `${r.qty ? `${r.qty}× ` : ''}${r.title}`
                    : r.title}
                  {r.notes ? ` — ${r.notes}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            No extra requirements detected yet.
          </p>
        )}

        <div className="space-y-3">
          {categories.map((cat) => {
            const items = selectedByCategory.get(cat.id) ?? [];
            return (
              <div
                key={cat.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{cat.label}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {cat.mode === 'single'
                        ? items.length
                          ? 'Selected'
                          : 'Pick one'
                        : `${items.length} selected`}
                    </p>
                  </div>
                  {items.length ? (
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => clearCategory(cat)}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                {items.length ? (
                  <div className="mt-2 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-xs text-[var(--color-muted)]">
                            {item.type}
                          </p>
                        </div>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() =>
                            setSelected((prev) =>
                              prev.filter((id) => id !== item.id),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Not selected.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (!shareUrl) return;
              void navigator.clipboard.writeText(shareUrl);
            }}
          >
            Copy share link
          </button>
          <a
            className="btn secondary"
            href={`https://github.com/montreuil-labs/openfpv-kits/issues/new?title=Kit%20feedback&body=${encodeURIComponent(`I built a kit link: ${shareUrl}\n\nWhat I want feedback on:`)}`}
            target="_blank"
          >
            Share as issue
          </a>
          <button
            className="btn secondary"
            type="button"
            onClick={() => setSelected([])}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuilderIsland;
