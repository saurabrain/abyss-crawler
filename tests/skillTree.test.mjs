import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SkillTree } from '../src/skills/SkillTree.js';

function mockPlayer() {
  return { maxHp: 100, hp: 100, bonusHp: 0, bonusDamage: 0, bonusSpeed: 0, bonusCdr: 0, bonusAtkSpeed: 0, skillPoints: 0, maxResource: 100, resource: 100 };
}

test('SkillTree.canUnlock requires skill points', () => {
  const tree = new SkillTree('Warrior');
  const p = mockPlayer();
  p.skillPoints = 0;
  assert.equal(tree.canUnlock('hp1', p.skillPoints), false);
  p.skillPoints = 1;
  assert.equal(tree.canUnlock('hp1', p.skillPoints), true);
});

test('SkillTree.canUnlock enforces prerequisites', () => {
  const tree = new SkillTree('Warrior');
  const p = mockPlayer();
  p.skillPoints = 5;
  assert.equal(tree.canUnlock('hp2', p.skillPoints), false, 'hp2 requires hp1');
  assert.equal(tree.unlock('hp1', p), true);
  assert.equal(tree.canUnlock('hp2', p.skillPoints), true);
});

test('SkillTree.unlock deducts skill points and applies effect', () => {
  const tree = new SkillTree('Warrior');
  const p = mockPlayer();
  p.skillPoints = 2;
  tree.unlock('hp1', p);
  assert.equal(p.skillPoints, 1);
  assert.equal(p.maxHp, 120);
});

test('SkillTree cannot unlock same node twice', () => {
  const tree = new SkillTree('Warrior');
  const p = mockPlayer();
  p.skillPoints = 3;
  assert.equal(tree.unlock('hp1', p), true);
  assert.equal(tree.unlock('hp1', p), false, 'already unlocked');
  assert.equal(p.skillPoints, 2);
});

test('SkillTree includes class-specific nodes', () => {
  const warrior = new SkillTree('Warrior');
  const mage    = new SkillTree('Mage');
  const ranger  = new SkillTree('Ranger');
  assert.ok(warrior.nodes.some(n => n.id === 'w_life'));
  assert.ok(mage.nodes.some(n => n.id === 'm_nova'));
  assert.ok(ranger.nodes.some(n => n.id === 'r_pierce'));
});
