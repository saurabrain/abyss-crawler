import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMap, TILE, TILE_SIZE } from '../src/world/MapGenerator.js';
import { Tilemap } from '../src/world/Tilemap.js';

function makeTilemap() {
  return new Tilemap(generateMap(80, 60));
}

test('Tilemap.isSolid returns true for walls', () => {
  const tm = makeTilemap();
  assert.equal(tm.isSolid(0, 0), true);
  assert.equal(tm.isSolid(-1, -1), true);
  assert.equal(tm.isSolid(tm.cols, 0), true);
});

test('Tilemap.isSolid returns false for floor tiles', () => {
  const tm = makeTilemap();
  const room = tm.rooms[0];
  const tx = room.x + Math.floor(room.w / 2);
  const ty = room.y + Math.floor(room.h / 2);
  assert.equal(tm.isSolid(tx, ty), false);
});

test('spawnPointFarFrom returns a floor tile', () => {
  const tm = makeTilemap();
  for (let i = 0; i < 50; i++) {
    const p = tm.spawnPointFarFrom(0, 0, 100);
    const tx = Math.floor(p.x / TILE_SIZE);
    const ty = Math.floor(p.y / TILE_SIZE);
    assert.equal(tm.isSolid(tx, ty), false,
      `spawn tile (${tx},${ty}) should be floor`);
  }
});

test('spawnPointFarFrom respects minimum distance when possible', () => {
  const tm = makeTilemap();
  const room = tm.rooms[0];
  const cx = (room.x + room.w / 2) * TILE_SIZE;
  const cy = (room.y + room.h / 2) * TILE_SIZE;
  // Use small minDist to ensure it can find one
  let satisfied = 0;
  for (let i = 0; i < 30; i++) {
    const p = tm.spawnPointFarFrom(cx, cy, 200);
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d >= 200) satisfied++;
  }
  assert.ok(satisfied > 15, `expected most spawns to be far (got ${satisfied}/30)`);
});

test('randomFloorTile returns a floor tile', () => {
  const tm = makeTilemap();
  for (let i = 0; i < 30; i++) {
    const p = tm.randomFloorTile();
    const tx = Math.floor(p.x / TILE_SIZE);
    const ty = Math.floor(p.y / TILE_SIZE);
    assert.notEqual(tm.grid[ty][tx], TILE.WALL);
  }
});
