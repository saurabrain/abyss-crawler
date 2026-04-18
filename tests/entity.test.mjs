import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Entity } from '../src/entities/Entity.js';

test('Entity.overlaps detects AABB collision', () => {
  const a = new Entity(0, 0, 10, 10);
  const b = new Entity(4, 4, 10, 10);
  const c = new Entity(20, 20, 10, 10);
  assert.equal(a.overlaps(b), true);
  assert.equal(a.overlaps(c), false);
});

test('Entity.distTo computes Euclidean distance', () => {
  const a = new Entity(0, 0, 1, 1);
  const b = new Entity(3, 4, 1, 1);
  assert.equal(a.distTo(b), 5);
});

test('Entity.takeDamage clamps to 0 and sets dead', () => {
  const e = new Entity(0, 0, 1, 1);
  e.maxHp = 10; e.hp = 10;
  e.takeDamage(4);
  assert.equal(e.hp, 6);
  assert.equal(e.dead, false);
  e.takeDamage(100);
  assert.equal(e.hp, 0);
  assert.equal(e.dead, true);
});

test('Entity bounds getters', () => {
  const e = new Entity(100, 100, 20, 40);
  assert.equal(e.left, 90);
  assert.equal(e.right, 110);
  assert.equal(e.top, 80);
  assert.equal(e.bottom, 120);
});
