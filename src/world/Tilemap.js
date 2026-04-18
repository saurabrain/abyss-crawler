import { TILE, TILE_SIZE } from './MapGenerator.js';

const COLORS = {
  [TILE.WALL]:     '#1a1a2e',
  [TILE.FLOOR]:    '#2a2a3e',
  [TILE.CORRIDOR]: '#252535',
  [TILE.PORTAL]:   '#7f00ff',
};
const WALL_TOP = '#0d0d1a';
const FLOOR_LINE = '#1e1e30';

export class Tilemap {
  constructor(mapData) {
    this.grid = mapData.grid;
    this.rows = mapData.rows;
    this.cols = mapData.cols;
    this.rooms = mapData.rooms;
    this.pixelW = this.cols * TILE_SIZE;
    this.pixelH = this.rows * TILE_SIZE;
    this._cache = null;
    this._buildCache();
  }

  _buildCache() {
    const offscreen = document.createElement('canvas');
    offscreen.width = this.pixelW;
    offscreen.height = this.pixelH;
    const ctx = offscreen.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.grid[r][c];
        const px = c * TILE_SIZE;
        const py = r * TILE_SIZE;
        ctx.fillStyle = COLORS[t] ?? '#000';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        if (t === TILE.FLOOR || t === TILE.CORRIDOR) {
          ctx.strokeStyle = FLOOR_LINE;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        }
        if (t === TILE.WALL) {
          ctx.fillStyle = WALL_TOP;
          ctx.fillRect(px, py, TILE_SIZE, 4);
        }
        if (t === TILE.PORTAL) {
          ctx.fillStyle = '#b266ff';
          ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
          ctx.fillStyle = '#fff';
          ctx.fillRect(px + 14, py + 14, 4, 4);
        }
      }
    }
    this._cache = offscreen;
  }

  isSolid(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return true;
    return this.grid[ty][tx] === TILE.WALL;
  }

  isSolidWorld(wx, wy) {
    return this.isSolid(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE));
  }

  tileAt(wx, wy) {
    const tx = Math.floor(wx / TILE_SIZE);
    const ty = Math.floor(wy / TILE_SIZE);
    if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return TILE.WALL;
    return this.grid[ty][tx];
  }

  setTile(tx, ty, tile) {
    if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return;
    this.grid[ty][tx] = tile;
    this._buildCache();
  }

  draw(ctx, camera) {
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol   = Math.min(this.cols, Math.ceil((camera.x + camera.viewW) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow   = Math.min(this.rows, Math.ceil((camera.y + camera.viewH) / TILE_SIZE));

    ctx.drawImage(
      this._cache,
      startCol * TILE_SIZE, startRow * TILE_SIZE,
      (endCol - startCol) * TILE_SIZE, (endRow - startRow) * TILE_SIZE,
      startCol * TILE_SIZE, startRow * TILE_SIZE,
      (endCol - startCol) * TILE_SIZE, (endRow - startRow) * TILE_SIZE
    );
  }

  randomFloorTile() {
    const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
    return {
      x: (room.x + Math.floor(Math.random() * room.w)) * TILE_SIZE + TILE_SIZE / 2,
      y: (room.y + Math.floor(Math.random() * room.h)) * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  // Pick a floor tile at least minDist pixels from the given world coords.
  spawnPointFarFrom(wx, wy, minDist = 360) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const tx = room.x + Math.floor(Math.random() * room.w);
      const ty = room.y + Math.floor(Math.random() * room.h);
      if (this.isSolid(tx, ty)) continue;
      const px = tx * TILE_SIZE + TILE_SIZE / 2;
      const py = ty * TILE_SIZE + TILE_SIZE / 2;
      const dx = px - wx;
      const dy = py - wy;
      if (Math.sqrt(dx * dx + dy * dy) >= minDist) return { x: px, y: py };
    }
    return this.randomFloorTile();
  }

  spawnPointsFarFrom(count, wx, wy, minDist = 360) {
    const points = [];
    for (let i = 0; i < count; i++) points.push(this.spawnPointFarFrom(wx, wy, minDist));
    return points;
  }
}
