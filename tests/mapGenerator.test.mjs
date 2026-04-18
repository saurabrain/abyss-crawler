import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMap, TILE, TILE_SIZE } from '../src/world/MapGenerator.js';

test('generateMap returns rows x cols grid', () => {
  const m = generateMap(80, 60);
  assert.equal(m.rows, 60);
  assert.equal(m.cols, 80);
  assert.equal(m.grid.length, 60);
  assert.equal(m.grid[0].length, 80);
});

test('map has at least 2 rooms', () => {
  const m = generateMap(80, 60);
  assert.ok(m.rooms.length >= 2, `expected >=2 rooms, got ${m.rooms.length}`);
});

test('map has a portal tile', () => {
  const m = generateMap(80, 60);
  let portals = 0;
  for (let r = 0; r < m.rows; r++)
    for (let c = 0; c < m.cols; c++)
      if (m.grid[r][c] === TILE.PORTAL) portals++;
  assert.equal(portals, 1, 'map should have exactly one portal');
});

test('spawn position is on a walkable tile (not wall)', () => {
  for (let i = 0; i < 10; i++) {
    const m = generateMap(80, 60);
    const tx = Math.floor(m.spawn.x / TILE_SIZE);
    const ty = Math.floor(m.spawn.y / TILE_SIZE);
    const tile = m.grid[ty][tx];
    assert.notEqual(tile, TILE.WALL, 'spawn inside wall');
  }
});

test('map has a perimeter of walls', () => {
  const m = generateMap(80, 60);
  for (let c = 0; c < m.cols; c++) {
    assert.equal(m.grid[0][c], TILE.WALL, 'top row must be wall');
    assert.equal(m.grid[m.rows - 1][c], TILE.WALL, 'bottom row must be wall');
  }
});

test('rooms do not overlap the outer wall', () => {
  const m = generateMap(80, 60);
  for (const room of m.rooms) {
    assert.ok(room.x >= 1 && room.x + room.w <= m.cols - 1);
    assert.ok(room.y >= 1 && room.y + room.h <= m.rows - 1);
  }
});
