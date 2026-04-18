/**
 * REG-002
 * Bug: moveWithCollision only checked entity centre point on each axis,
 *      so corners could pass through wall tiles.
 * Fixed: 2026-04-18
 * Trigger: entity approaching a wall diagonally or near a corridor edge
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../tests/_dom-stub.mjs';
import { Entity } from '../../src/entities/Entity.js';
import { generateMap, TILE_SIZE } from '../../src/world/MapGenerator.js';
import { Tilemap } from '../../src/world/Tilemap.js';

function makeMap() {
  const m = generateMap(80, 60);
  return new Tilemap(m);
}

test('[REG-002] entity does not pass through wall when approaching from top-right corner', () => {
  const map = makeMap();
  // Place entity just inside a floor tile, moving right into a wall
  // Find a wall tile to the right of a floor tile
  let fx = -1, fy = -1;
  outer: for (let r = 2; r < 58; r++) {
    for (let c = 2; c < 78; c++) {
      if (!map.isSolid(c, r) && map.isSolid(c + 1, r)) {
        fx = c; fy = r; break outer;
      }
    }
  }
  if (fx === -1) return; // no suitable tile found, skip

  const e = new Entity(fx * TILE_SIZE + TILE_SIZE / 2, fy * TILE_SIZE + TILE_SIZE / 2, 20, 20);
  e.vx = 300;
  e.vy = 0;
  const startX = e.x;
  for (let i = 0; i < 10; i++) e.moveWithCollision(map, 0.016);

  // Entity should have been stopped before entering the wall
  assert.ok(e.x <= (fx + 1) * TILE_SIZE, 'entity must not enter the wall tile');
});

test('[REG-002] entity does not pass through wall when approaching from bottom-left corner', () => {
  const map = makeMap();
  let fx = -1, fy = -1;
  outer: for (let r = 2; r < 58; r++) {
    for (let c = 2; c < 78; c++) {
      if (!map.isSolid(c, r) && map.isSolid(c, r + 1)) {
        fx = c; fy = r; break outer;
      }
    }
  }
  if (fx === -1) return;

  const e = new Entity(fx * TILE_SIZE + TILE_SIZE / 2, fy * TILE_SIZE + TILE_SIZE / 2, 20, 20);
  e.vx = 0;
  e.vy = 300;
  for (let i = 0; i < 10; i++) e.moveWithCollision(map, 0.016);

  assert.ok(e.y <= (fy + 1) * TILE_SIZE, 'entity must not enter the wall tile below');
});
