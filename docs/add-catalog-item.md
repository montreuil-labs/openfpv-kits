# Add a catalog item (template)

Use this link to open a pre-filled file creation form on GitHub:

- [Add catalog item](https://github.com/montreuil-labs/openfpv-kits/new/main/src/data/catalog/items?filename=new-item.yml&value=%23%20Add%20a%20new%20catalog%20item.%20Remove%20comments%20before%20committing.%0A%23%20Guide%3A%20https%3A%2F%2Fgithub.com%2Fmontreuil-labs%2Fopenfpv-kits%2Fblob%2Fmain%2Fdocs%2Fadd-catalog-item.md%0Aid%3A%20your-item-id%0Atype%3A%20radio%20%23%20Types%3A%20radio%20%7C%20goggles%20%7C%20drone%20%7C%20battery%20%7C%20charger%20%7C%20accessory%20%7C%20simulator%0Abrand%3A%20%22%22%0Amodel%3A%20%22%22%0Atitle%3A%20%22Item%20title%22%0Asummary%3A%20%22One-line%20summary.%22%0Atags%3A%0A%20%20-%20beginner%0Aprice%3A%0A%20%20currency%3A%20USD%0A%20%20typical_range%3A%20%5B0%2C%200%5D%0A%20%20note%3A%20%22%22%0Alinks%3A%0A%20%20official%3A%20%22%22%0A%20%20search%3A%20%22%22%0Arequires%3A%20%5B%5D%20%23%20list%20of%20%7Bkind%2Ctitle%2Cqty%3F%2Cnotes%3F%7D%0Aincludes%3A%20%5B%5D%20%23%20same%20shape%20as%20requires%3B%20optional%0Abattery_options%3A%20%5B%5D%20%23%20e.g.%20%5B%7Btitle%3A%20%22%22%2C%20typical_range_usd%3A%20%5B0%2C0%5D%2C%20notes%3A%20%22%22%7D%5D%0Apower_options%3A%20%5B%5D%0Aalso_see%3A%20%5B%5D%20%23%20other%20item%20ids%0A)

## Template (inline hints; remove comments before submitting)

```yml
# Add a new catalog item. Remove comments before committing.
# Guide: https://github.com/montreuil-labs/openfpv-kits/blob/main/docs/add-catalog-item.md
id: your-item-id
type: radio # Types: radio | goggles | drone | battery | charger | accessory | simulator
brand: ''
model: ''
title: 'Item title'
summary: 'One-line summary.'
tags:
  - beginner
price:
  currency: USD
  typical_range: [0, 0]
  note: ''
links:
  official: ''
  search: ''
requires: [] # list of {kind,title,qty?,notes?}
includes: [] # same shape as requires; optional
battery_options: [] # e.g. [{title: "", typical_range_usd: [0,0], notes: ""}]
power_options: []
also_see: [] # other item ids
```

Notes:

- Use lowercase hyphenated `id` (e.g., `betafpv-meteor75-pro-v2`).
- Keep `price.currency` as `USD` for now.
- Remove the comment lines before creating the PR.
- If the item requires power/batteries, fill `requires` with `kind`, `title`, and optional `qty`/`notes`.
