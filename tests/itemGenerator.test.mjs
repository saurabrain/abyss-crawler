import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateItem } from '../src/items/ItemGenerator.js';
import { RARITY, ITEM_TYPES } from '../src/items/Item.js';

test('generateItem produces valid rarity', () => {
  for (let i = 0; i < 200; i++) {
    const item = generateItem(1);
    assert.ok(item.rarity >= RARITY.NORMAL && item.rarity <= RARITY.UNIQUE);
  }
});

test('generateItem picks a known item type', () => {
  for (let i = 0; i < 50; i++) {
    const item = generateItem(1);
    assert.ok(ITEM_TYPES.includes(item.type));
  }
});

test('affix count matches rarity', () => {
  const counts = { [RARITY.NORMAL]: 1, [RARITY.MAGIC]: 2, [RARITY.RARE]: 3, [RARITY.UNIQUE]: 4 };
  for (let i = 0; i < 200; i++) {
    const item = generateItem(5);
    assert.equal(item.affixes.length, counts[item.rarity]);
  }
});

test('higher stage increases rare drop chance', () => {
  let stage1Rare = 0, stage20Rare = 0;
  for (let i = 0; i < 500; i++) {
    if (generateItem(1).rarity >= RARITY.RARE) stage1Rare++;
    if (generateItem(20).rarity >= RARITY.RARE) stage20Rare++;
  }
  assert.ok(stage20Rare > stage1Rare, `expected more rares at stage 20 (got s1=${stage1Rare} s20=${stage20Rare})`);
});

test('item description has at least one line', () => {
  const item = generateItem(3);
  assert.ok(item.description.length > 0);
});
