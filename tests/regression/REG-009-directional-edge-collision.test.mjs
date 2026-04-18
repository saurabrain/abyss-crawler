/**
 * REG-009
 * Bug: moveWithCollision checked all 4 AABB corners for both X and Y axes.
 *      When the player's top/bottom corners sat inside a wall tile (valid Y position
 *      near a room edge), ALL X movement was blocked — characters froze on map load.
 * Fixed: 2026-04-19
 * Trigger: Any character approaching any wall from the perpendicular direction
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../tests/_dom-stub.mjs';
import { Entity } from '../../src/entities/Entity.js';
import { generateMap, TILE_SIZE } from '../../src/world/MapGenerator.js';
import { Tilemap } from '../../src/world/Tilemap.js';

function makeMap() {
  return new Tilemap(generateMap(80, 60));
}

// Drive entity into a wall and let it stop naturally, then return it
function driveToWall(e, map, vx, vy, frames = 120) {
  e.vx = vx; e.vy = vy;
  for (let i = 0; i < frames; i++) {
    e.vx = vx; e.vy = vy; // keep velocity applied each frame
    e.moveWithCollision(map, 1 / 60);
  }
}

test('[REG-009] entity can slide horizontally after stopping against top wall', () => {
  const map = makeMap();
  const room = map.rooms[0];
  // Start at room centre
  const cx = (room.x + Math.floor(room.w / 2)) * TILE_SIZE + TILE_SIZE / 2;
  const cy = (room.y + Math.floor(room.h / 2)) * TILE_SIZE + TILE_SIZE / 2;
  const e = new Entity(cx, cy, 20, 20);

  // Drive upward until naturally stopped by top wall
  driveToWall(e, map, 0, -120);
  const stoppedY = e.y;

  // Now try sliding right — must not be blocked by the wall above
  e.vx = 120; e.vy = 0;
  const startX = e.x;
  e.moveWithCollision(map, 1 / 60);

  assert.ok(e.x > startX,
    `entity stopped at top wall (y=${stoppedY.toFixed(1)}) should slide right; x went ${startX.toFixed(1)} → ${e.x.toFixed(1)}`);
});

test('[REG-009] entity can slide vertically after stopping against right wall', () => {
  const map = makeMap();
  const room = map.rooms[0];
  const cx = (room.x + Math.floor(room.w / 2)) * TILE_SIZE + TILE_SIZE / 2;
  const cy = (room.y + Math.floor(room.h / 2)) * TILE_SIZE + TILE_SIZE / 2;
  const e = new Entity(cx, cy, 20, 20);

  // Drive rightward until naturally stopped by right wall
  driveToWall(e, map, 120, 0);
  const stoppedX = e.x;

  // Now try sliding down — must not be blocked by the wall to the right
  e.vx = 0; e.vy = 120;
  const startY = e.y;
  e.moveWithCollision(map, 1 / 60);

  assert.ok(e.y > startY,
    `entity stopped at right wall (x=${stoppedX.toFixed(1)}) should slide down; y went ${startY.toFixed(1)} → ${e.y.toFixed(1)}`);
});

test('[REG-009] entity is still blocked when moving directly into a wall', () => {
  const map = makeMap();
  // Find a floor tile with a wall directly to its right
  let fx = -1, fy = -1;
  outer: for (let r = 2; r < 58; r++) {
    for (let c = 2; c < 76; c++) {
      if (!map.isSolid(c, r) && map.isSolid(c + 2, r)) { fx = c; fy = r; break outer; }
    }
  }
  if (fx === -1) return; // no suitable pair found

  const e = new Entity(fx * TILE_SIZE + TILE_SIZE / 2, fy * TILE_SIZE + TILE_SIZE / 2, 20, 20);
  e.vx = 300;
  e.vy = 0;
  for (let i = 0; i < 30; i++) e.moveWithCollision(map, 1 / 60);

  assert.ok(e.x < (fx + 2) * TILE_SIZE,
    'entity must not pass through the wall tile');
});
