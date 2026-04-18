import { Item, RARITY, ITEM_TYPES, AFFIXES } from './Item.js';

function roll(min, max) { return min + Math.random() * (max - min); }

export function generateItem(stage) {
  const rarityRoll = Math.random();
  let rarity;
  if (rarityRoll < 0.02 + stage * 0.005) rarity = RARITY.UNIQUE;
  else if (rarityRoll < 0.12 + stage * 0.01) rarity = RARITY.RARE;
  else if (rarityRoll < 0.45 + stage * 0.02) rarity = RARITY.MAGIC;
  else rarity = RARITY.NORMAL;
  rarity = Math.min(rarity, RARITY.UNIQUE);

  const affixCount = rarity === RARITY.UNIQUE ? 4 :
                     rarity === RARITY.RARE   ? 3 :
                     rarity === RARITY.MAGIC  ? 2 : 1;

  const shuffled = [...AFFIXES].sort(() => Math.random() - 0.5);
  const affixes = shuffled.slice(0, affixCount).map(a => ({
    affix: a,
    value: roll(a.min, a.max) * (1 + stage * 0.05),
  }));

  const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
  return new Item(type, rarity, affixes);
}
