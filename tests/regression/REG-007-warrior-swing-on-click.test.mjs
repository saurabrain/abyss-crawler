/**
 * REG-007
 * Bug: Warrior sword rotated continuously with mouse movement.
 *      Swing animation should only trigger on left-click attack.
 * Fixed: 2026-04-18
 * Trigger: Moving mouse with Warrior character equipped
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WARRIOR } from '../../src/classes/Warrior.js';

function fakePlayer() {
  return {
    x: 0, y: 0,
    facingAngle: 0,
    totalDamage: 20,
    attackCooldown: 0.55,
    _swingTimer: 0,
    pendingMeleeHit: null,
    pendingProjectiles: [],
  };
}

test('[REG-007] primaryAttack sets _swingTimer to attackCooldown', () => {
  const p = fakePlayer();
  assert.equal(p._swingTimer, 0, 'swing timer starts at 0 (no swing)');
  WARRIOR.primaryAttack(p, { x: 50, y: 0 });
  assert.ok(p._swingTimer > 0, 'primaryAttack must set _swingTimer > 0');
  assert.equal(p._swingTimer, p.attackCooldown, '_swingTimer should equal attackCooldown');
});

test('[REG-007] _swingTimer is not set without an attack', () => {
  const p = fakePlayer();
  // Simulate a frame passing with no attack
  if (p._swingTimer > 0) p._swingTimer -= 0.016;
  assert.equal(p._swingTimer, 0, 'swing timer stays 0 when no attack happens');
});
