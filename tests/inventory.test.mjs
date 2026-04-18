import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Inventory, MAX_SLOTS } from '../src/items/Inventory.js';
import { Item, RARITY, AFFIXES } from '../src/items/Item.js';

function mockPlayer() {
  return {
    maxHp: 100, hp: 100, bonusHp: 0, bonusDamage: 0, bonusSpeed: 0, bonusCdr: 0, bonusAtkSpeed: 0,
  };
}

function makeItem(affixes) {
  return new Item('Sword', RARITY.MAGIC, affixes);
}

test('Inventory.add up to MAX_SLOTS', () => {
  const inv = new Inventory();
  for (let i = 0; i < MAX_SLOTS; i++) {
    assert.equal(inv.add(makeItem([{ affix: AFFIXES[0], value: 5 }])), true);
  }
  assert.equal(inv.add(makeItem([{ affix: AFFIXES[0], value: 5 }])), false);
  assert.equal(inv.items.length, MAX_SLOTS);
});

test('Inventory.equip applies stats to player', () => {
  const inv = new Inventory();
  const p = mockPlayer();
  const dmgAffix = AFFIXES.find(a => a.id === 'flatDmg');
  inv.add(makeItem([{ affix: dmgAffix, value: 10 }]));
  inv.equip(0, p);
  assert.equal(p.bonusDamage, 10);
  assert.equal(inv.equipped.length, 1);
  assert.equal(inv.items.length, 0);
});

test('Inventory.equip with HP affix raises maxHp', () => {
  const inv = new Inventory();
  const p = mockPlayer();
  const hpAffix = AFFIXES.find(a => a.id === 'hp');
  inv.add(makeItem([{ affix: hpAffix, value: 50 }]));
  inv.equip(0, p);
  assert.equal(p.maxHp, 150);
  assert.equal(p.bonusHp, 50);
});

test('Inventory auto-unequips oldest when 5th equipped', () => {
  const inv = new Inventory();
  const p = mockPlayer();
  const dmg = AFFIXES.find(a => a.id === 'flatDmg');
  for (let i = 0; i < 5; i++) {
    inv.add(makeItem([{ affix: dmg, value: 10 }]));
    inv.equip(0, p);
  }
  // After 5 equips, only 4 should remain equipped; total damage = 4 * 10 = 40
  assert.equal(inv.equipped.length, 4);
  assert.equal(p.bonusDamage, 40);
});

test('Inventory.unequipAll removes all stat bonuses', () => {
  const inv = new Inventory();
  const p = mockPlayer();
  const dmg = AFFIXES.find(a => a.id === 'flatDmg');
  inv.add(makeItem([{ affix: dmg, value: 20 }]));
  inv.equip(0, p);
  inv.unequipAll(p);
  assert.equal(p.bonusDamage, 0);
  assert.equal(inv.equipped.length, 0);
});
