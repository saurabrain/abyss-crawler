export const TILE = { WALL: 0, FLOOR: 1, CORRIDOR: 2, PORTAL: 3 };
export const TILE_SIZE = 32;

class BSPNode {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.left = null; this.right = null;
    this.room = null;
  }
}

function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function split(node, minSize) {
  if (node.w < minSize * 2 && node.h < minSize * 2) return;
  const horizontal = node.w < minSize * 2 ? true : node.h < minSize * 2 ? false : Math.random() < 0.5;
  if (horizontal) {
    const splitY = rng(minSize, node.h - minSize);
    node.left = new BSPNode(node.x, node.y, node.w, splitY);
    node.right = new BSPNode(node.x, node.y + splitY, node.w, node.h - splitY);
  } else {
    const splitX = rng(minSize, node.w - minSize);
    node.left = new BSPNode(node.x, node.y, splitX, node.h);
    node.right = new BSPNode(node.x + splitX, node.y, node.w - splitX, node.h);
  }
  split(node.left, minSize);
  split(node.right, minSize);
}

function placeRooms(node, minRoom) {
  if (!node.left && !node.right) {
    const rw = rng(minRoom, Math.min(node.w - 2, minRoom + 8));
    const rh = rng(minRoom, Math.min(node.h - 2, minRoom + 8));
    const rx = node.x + rng(1, node.w - rw - 1);
    const ry = node.y + rng(1, node.h - rh - 1);
    node.room = { x: rx, y: ry, w: rw, h: rh };
    return;
  }
  if (node.left) placeRooms(node.left, minRoom);
  if (node.right) placeRooms(node.right, minRoom);
}

function getRoom(node) {
  if (node.room) return node.room;
  const l = node.left ? getRoom(node.left) : null;
  const r = node.right ? getRoom(node.right) : null;
  if (!l) return r;
  if (!r) return l;
  return Math.random() < 0.5 ? l : r;
}

function collectRooms(node, rooms) {
  if (node.room) { rooms.push(node.room); return; }
  if (node.left) collectRooms(node.left, rooms);
  if (node.right) collectRooms(node.right, rooms);
}

function carveCorridors(node, grid, rows, cols) {
  if (!node.left || !node.right) return;
  const l = getRoom(node.left);
  const r = getRoom(node.right);
  const lx = Math.floor(l.x + l.w / 2);
  const ly = Math.floor(l.y + l.h / 2);
  const rx = Math.floor(r.x + r.w / 2);
  const ry = Math.floor(r.y + r.h / 2);

  // Carve 3-tile-wide corridors so a 20×20 player can navigate corners freely
  let cx = lx, cy = ly;
  while (cx !== rx) {
    for (let oy = -1; oy <= 1; oy++) {
      const row = cy + oy;
      if (row > 0 && row < rows - 1) grid[row][cx] = TILE.CORRIDOR;
    }
    cx += cx < rx ? 1 : -1;
  }
  while (cy !== ry) {
    for (let ox = -1; ox <= 1; ox++) {
      const col = cx + ox;
      if (col > 0 && col < cols - 1) grid[cy][col] = TILE.CORRIDOR;
    }
    cy += cy < ry ? 1 : -1;
  }
  carveCorridors(node.left, grid, rows, cols);
  carveCorridors(node.right, grid, rows, cols);
}

export function generateMap(cols = 80, rows = 60) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(TILE.WALL));
  const root = new BSPNode(1, 1, cols - 2, rows - 2);
  split(root, 10);
  placeRooms(root, 6);

  const rooms = [];
  collectRooms(root, rooms);

  for (const room of rooms) {
    for (let ry = room.y; ry < room.y + room.h; ry++)
      for (let rx = room.x; rx < room.x + room.w; rx++)
        grid[ry][rx] = TILE.FLOOR;
  }

  carveCorridors(root, grid, rows, cols);

  // Place portal in last room
  const lastRoom = rooms[rooms.length - 1];
  const px = Math.floor(lastRoom.x + lastRoom.w / 2);
  const py = Math.floor(lastRoom.y + lastRoom.h / 2);
  grid[py][px] = TILE.PORTAL;

  const startRoom = rooms[0];
  const spawn = {
    x: (Math.floor(startRoom.x + startRoom.w / 2)) * TILE_SIZE + TILE_SIZE / 2,
    y: (Math.floor(startRoom.y + startRoom.h / 2)) * TILE_SIZE + TILE_SIZE / 2,
  };

  return { grid, rows, cols, rooms, spawn };
}
