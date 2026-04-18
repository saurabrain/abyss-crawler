/**
 * REG-005
 * Bug: Warrior primary attack arc (PI*0.8 ≈ 144°) missed enemies flanking/behind.
 *      Battle Cry skill never expired — bonusDamage accumulated permanently.
 * Fixed: 2026-04-18
 * Trigger: Surrounded by enemies; Battle Cry used multiple times
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WARRIOR } from '../../src/classes/Warrior.js';

test('[REG-005] Warrior primary attack arc is >= 180 degrees', () => {
  // We read the pendingMeleeHit set by primaryAttack
  const fakePlayer = {
    x: 0, y: 0,
    facingAngle: 0,
    totalDamage: 20,
    pendingMeleeHit: null,
    pendingProjectiles: [],
  };
  WARRIOR.primaryAttack(fakePlayer, { x: 50, y: 0 });
  assert.ok(fakePlayer.pendingMeleeHit !== null, 'primaryAttack must set pendingMeleeHit');
  assert.ok(fakePlayer.pendingMeleeHit.arc >= Math.PI,
    `primary attack arc ${fakePlayer.pendingMeleeHit.arc.toFixed(2)} must be >= PI (180°) for wide melee coverage`);
});

test('[REG-005] Warrior Whirlwind (skill 1) arc is 2*PI (full 360)', () => {
  const fakePlayer = {
    x: 0, y: 0,
    facingAngle: 0,
    totalDamage: 20,
    resource: 100,
    pendingMeleeHit: null,
    pendingProjectiles: [],
  };
  WARRIOR.useSkill(fakePlayer, 1, { x: 0, y: 0 });
  assert.ok(fakePlayer.pendingMeleeHit !== null, 'Whirlwind must set pendingMeleeHit');
  assert.ok(Math.abs(fakePlayer.pendingMeleeHit.arc - Math.PI * 2) < 0.001,
    'Whirlwind must be full 360° AoE');
});

test('[REG-005] Battle Cry sets _battleCryTimer that Player.update must decrement', () => {
  const fakePlayer = {
    x: 0, y: 0,
    facingAngle: 0,
    totalDamage: 20,
    resource: 100,
    bonusDamage: 0,
    _battleCryTimer: 0,
    pendingMeleeHit: null,
    pendingProjectiles: [],
  };
  WARRIOR.useSkill(fakePlayer, 3, { x: 0, y: 0 });
  assert.ok(fakePlayer._battleCryTimer > 0, 'Battle Cry must set a positive timer');
  assert.ok(fakePlayer.bonusDamage > 0, 'Battle Cry must add bonusDamage');
});
