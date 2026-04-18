/**
 * REG-006
 * Bug: Camera.follow offset toward mouse cursor caused the viewport to pan
 *      rapidly with mouse movement, making navigation disorienting.
 * Fixed: 2026-04-18
 * Trigger: Moving mouse far from player shifted camera independent of movement
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Camera } from '../../src/engine/Camera.js';

test('[REG-006] camera centers on player regardless of mouse position', () => {
  const cam = new Camera(800, 600);
  const player = { x: 400, y: 300 };
  const mapW = 2560, mapH = 1920;

  // Follow without any mouse influence — call multiple times to let easing settle
  for (let i = 0; i < 120; i++) cam.follow(player, mapW, mapH, 0.016);

  const expectedX = player.x - cam.viewW / 2; // 0
  const expectedY = player.y - cam.viewH / 2; // 0

  assert.ok(Math.abs(cam.x - expectedX) < 2,
    `camera.x ${cam.x.toFixed(1)} should be near ${expectedX} (player-centred)`);
  assert.ok(Math.abs(cam.y - expectedY) < 2,
    `camera.y ${cam.y.toFixed(1)} should be near ${expectedY} (player-centred)`);
});

test('[REG-006] Camera.follow accepts no mouse arguments (signature change)', () => {
  const cam = new Camera(800, 600);
  const player = { x: 500, y: 400 };
  // Must not throw when called without mouse world coords
  assert.doesNotThrow(() => cam.follow(player, 2560, 1920, 0.016));
});
