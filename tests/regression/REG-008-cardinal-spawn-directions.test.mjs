/**
 * REG-008
 * Bug: Enemies spawned at random floor tiles — no directional spread.
 *      Player had no sense of being surrounded from distinct directions.
 * Fixed: 2026-04-18
 * Trigger: Wave spawn — enemies should come from N/S/E/W relative to player
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../tests/_dom-stub.mjs';
import { generateMap } from '../../src/world/MapGenerator.js';
import { Tilemap } from '../../src/world/Tilemap.js';

function makeMap() {
  return new Tilemap(generateMap(80, 60));
}

const DIR_ANGLES = {
  N: -Math.PI / 2,
  S:  Math.PI / 2,
  E:  0,
  W:  Math.PI,
};

function angleDiff(a, b) {
  let d = a - b;
  while (d >  Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

test('[REG-008] spawnPointInDirection returns tile in correct quadrant (N)', () => {
  const map = makeMap();
  const px = map.pixelW / 2, py = map.pixelH / 2;
  let successes = 0;
  for (let i = 0; i < 10; i++) {
    const pt = map.spawnPointInDirection(px, py, 'N', 150);
    const angle = Math.atan2(pt.y - py, pt.x - px);
    if (angleDiff(angle, DIR_ANGLES.N) <= Math.PI / 2) successes++;
  }
  assert.ok(successes >= 6, `N spawns in correct quadrant ${successes}/10 times`);
});

test('[REG-008] spawnPointInDirection returns tile in correct quadrant (S)', () => {
  const map = makeMap();
  const px = map.pixelW / 2, py = map.pixelH / 2;
  let successes = 0;
  for (let i = 0; i < 10; i++) {
    const pt = map.spawnPointInDirection(px, py, 'S', 150);
    const angle = Math.atan2(pt.y - py, pt.x - px);
    if (angleDiff(angle, DIR_ANGLES.S) <= Math.PI / 2) successes++;
  }
  assert.ok(successes >= 6, `S spawns in correct quadrant ${successes}/10 times`);
});

test('[REG-008] spawnPointInDirection returns a non-solid tile', () => {
  const map = makeMap();
  const px = map.pixelW / 2, py = map.pixelH / 2;
  for (const dir of ['N', 'S', 'E', 'W']) {
    const pt = map.spawnPointInDirection(px, py, dir, 100);
    assert.equal(map.isSolidWorld(pt.x, pt.y), false,
      `${dir} spawn point must not be inside a wall`);
  }
});
