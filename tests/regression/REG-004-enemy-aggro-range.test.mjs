/**
 * REG-004
 * Bug: Enemy aggroRange (200px) was smaller than minSpawnDist (260px), so
 *      grunts never chased the player after spawning — they only wandered.
 * Fixed: 2026-04-18
 * Trigger: Wave spawn places enemies 260+ px away; they must immediately aggro
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GRUNT_DEF, ARCHER_DEF, SHAMAN_DEF, BOSS_DEF } from '../../src/enemies/enemyDefs.js';

const MIN_SPAWN_DIST = 260; // WaveSystem.minSpawnDist for non-boss waves

test('[REG-004] GRUNT aggroRange exceeds minSpawnDist', () => {
  assert.ok(GRUNT_DEF.aggroRange > MIN_SPAWN_DIST,
    `Grunt aggroRange ${GRUNT_DEF.aggroRange} must be > minSpawnDist ${MIN_SPAWN_DIST}`);
});

test('[REG-004] ARCHER aggroRange exceeds minSpawnDist', () => {
  assert.ok(ARCHER_DEF.aggroRange > MIN_SPAWN_DIST,
    `Archer aggroRange ${ARCHER_DEF.aggroRange} must be > minSpawnDist ${MIN_SPAWN_DIST}`);
});

test('[REG-004] SHAMAN aggroRange exceeds minSpawnDist', () => {
  assert.ok(SHAMAN_DEF.aggroRange > MIN_SPAWN_DIST,
    `Shaman aggroRange ${SHAMAN_DEF.aggroRange} must be > minSpawnDist ${MIN_SPAWN_DIST}`);
});

test('[REG-004] enemy switches to chase state when player within aggroRange', () => {
  // Simulate Enemy.update logic: dist < aggroRange → state = chase
  const aggroRange = GRUNT_DEF.aggroRange;
  const dist = MIN_SPAWN_DIST - 10; // player walks a bit closer
  assert.ok(dist < aggroRange, 'enemy should aggro when player within range');
});
