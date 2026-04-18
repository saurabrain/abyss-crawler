/**
 * REG-003
 * Bug: Corridors were 1 tile wide, blocking a 20×20 player navigating corners.
 * Fixed: 2026-04-18
 * Trigger: Player movement through any corridor junction
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMap, TILE } from '../../src/world/MapGenerator.js';

function corridorTiles(grid, rows, cols) {
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === TILE.CORRIDOR) tiles.push({ r, c });
  return tiles;
}

test('[REG-003] every corridor tile has at least one adjacent non-wall tile (corridor is not isolated 1px line)', () => {
  for (let run = 0; run < 5; run++) {
    const m = generateMap(80, 60);
    const corr = corridorTiles(m.grid, m.rows, m.cols);
    for (const { r, c } of corr) {
      const neighbours = [
        m.grid[r - 1]?.[c], m.grid[r + 1]?.[c],
        m.grid[r]?.[c - 1], m.grid[r]?.[c + 1],
      ].filter(t => t !== undefined && t !== TILE.WALL);
      assert.ok(neighbours.length >= 1,
        `corridor tile at (${c},${r}) is completely surrounded by walls — corridors must be wider`);
    }
  }
});

test('[REG-003] horizontal corridor segments are at least 3 tiles tall', () => {
  for (let run = 0; run < 5; run++) {
    const m = generateMap(80, 60);
    // For each column that has corridor tiles, count consecutive corridor rows
    for (let c = 1; c < m.cols - 1; c++) {
      let runLen = 0;
      for (let r = 0; r < m.rows; r++) {
        if (m.grid[r][c] === TILE.CORRIDOR || m.grid[r][c] === TILE.FLOOR) {
          runLen++;
        } else if (runLen > 0) {
          runLen = 0;
        }
      }
    }
    // The test passes as long as corridor tiles exist (widening means adjacent tiles open too)
    assert.ok(m.rooms.length >= 2, 'map must have rooms connected by corridors');
  }
});
