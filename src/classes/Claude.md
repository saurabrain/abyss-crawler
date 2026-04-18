# CLAUDE.md — Browser-Based Game Development Guide

This file governs how Claude Code assists with this project. Read it fully before taking any action.

---

## 1. Project Overview

This is a **browser-based game** built with vanilla JavaScript / HTML5 Canvas (or specify your framework: Phaser / PixiJS / Three.js). The primary goal is a **stable, playable, performant game** running at a consistent frame rate with zero runtime crashes.

---

## 2. Core Principles — Never Violate These

1. **Never break playability.** A crashing or unresponsive game is a P0 bug. Fix it before anything else.
2. **No code reaches `develop` without passing tests.** No exceptions.
3. **No code reaches `main`/`master` without passing the full regression suite on `develop`.**
4. **One concern per commit.** Small, atomic, reversible changes.
5. **Always run the game loop check** after any change to rendering, physics, input, or state management.

---

## 3. Tech Stack & Tooling

```
Runtime:        Browser (Chrome 120+, Firefox 120+, Safari 17+)
Language:       JavaScript (ES2022) or TypeScript (strict mode)
Renderer:       HTML5 Canvas / WebGL
Test Runner:    Vitest (unit + integration) | Playwright (E2E / smoke)
Linter:         ESLint + eslint-plugin-game (or custom rules)
Formatter:      Prettier
Bundler:        Vite
CI:             GitHub Actions (or specify your CI)
Package Mgr:    npm / yarn / pnpm
```

Adjust the above to match your actual stack. **Keep this section accurate.**

---

## 4. Repository & Branching Strategy

### Branch Hierarchy

```
main (master)         ← production-ready, tagged releases only
  └── develop         ← integration branch, always green
        └── feature/* ← individual feature work
        └── fix/*     ← bug fixes
        └── refactor/*← non-functional changes
        └── test/*    ← test-only additions
        └── chore/*   ← tooling, CI, deps
```

### Rules

| Branch | Protection | Who merges | Requires |
|---|---|---|---|
| `main` | ✅ Protected | Tech Lead / CI | Regression suite green on `develop` |
| `develop` | ✅ Protected | Any dev via PR | Unit + integration suite green |
| `feature/*` | ❌ | Author | Local tests pass before push |

### Workflow — Always Follow This Order

```bash
# 1. Create feature branch from develop
git checkout develop && git pull origin develop
git checkout -b feature/my-feature

# 2. Work, committing atomically
git add -p   # stage hunks, not whole files
git commit -m "feat(player): add double-jump with coyote time [15ms window]"

# 3. Before pushing — run local test suite
npm run test:unit
npm run test:integration
npm run lint

# 4. Push feature branch
git push origin feature/my-feature

# 5. Open PR → develop
#    PR must include: what changed, how to test, screenshots/video if visual

# 6. CI runs on PR — must be green before merge
#    → Unit tests
#    → Integration tests
#    → Lint + type-check

# 7. Merge to develop (squash or merge commit — pick one, stay consistent)

# 8. Run regression suite on develop
npm run test:regression

# 9. If regression passes → open PR develop → main
#    Tag release: git tag -a v1.2.0 -m "Release v1.2.0"
```

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short description> [optional context]

Types: feat | fix | refactor | test | chore | perf | docs
Scopes: player | enemy | physics | renderer | audio | ui | input | state | ai

Examples:
feat(physics): implement AABB collision with spatial hashing
fix(renderer): prevent canvas flicker on tab refocus
perf(enemy): cache path calculations using memoization
test(player): add regression cases for wall-jump edge cases
```

---

## 5. Game Architecture Standards

### 5.1 Game Loop — The Foundation

Every change must preserve the integrity of the game loop. The canonical loop:

```javascript
// ALWAYS use this pattern — never use setInterval for game logic
let lastTimestamp = 0;

function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05); // cap at 50ms
  lastTimestamp = timestamp;

  update(deltaTime);   // physics, AI, input — delta-time based, NEVER frame-rate based
  render();            // draw current state

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Rules:**
- All movement/physics MUST use `deltaTime`. Never use raw frame counts.
- Cap `deltaTime` at 50ms (handles tab switching, debugger pauses).
- `update()` and `render()` must be pure in effect — no cross-contamination.
- Never do DOM queries or resource loading inside the game loop.

### 5.2 State Management

```javascript
// Single source of truth — one GameState object
const GameState = {
  status: 'menu' | 'playing' | 'paused' | 'gameover',
  player: { x, y, vx, vy, health, ... },
  entities: [],
  score: 0,
  level: 1,
};

// State transitions must be explicit functions — never mutate state directly
function transitionTo(newStatus) { ... }
```

- **Never** scatter state across global variables.
- State changes must be traceable (log them in debug mode).
- Serialisable state = save/load + easier testing.

### 5.3 Input Handling

```javascript
// Buffer inputs — decouple raw events from game logic
const InputBuffer = {
  keys: new Set(),
  justPressed: new Set(),
  justReleased: new Set(),

  flush() {
    this.justPressed.clear();
    this.justReleased.clear();
  }
};

// Attach ONCE at init, never inside the game loop
window.addEventListener('keydown', e => {
  if (!InputBuffer.keys.has(e.code)) InputBuffer.justPressed.add(e.code);
  InputBuffer.keys.add(e.code);
});
```

- Always call `InputBuffer.flush()` at the end of each `update()`.
- Support keyboard AND gamepad from the start (add touch later).
- Never trust raw `e.key` — use `e.code` for layout-independent input.

### 5.4 Rendering

- Use **off-screen canvas** for complex scenes (composite, then blit).
- Clear canvas each frame: `ctx.clearRect(0, 0, canvas.width, canvas.height)`.
- Set `canvas.width` / `canvas.height` in CSS pixels AND device pixels (handle `devicePixelRatio`).
- Never read from the canvas (e.g. `getImageData`) inside the render loop — it forces GPU sync.

### 5.5 Asset Loading

```javascript
// ALL assets loaded before game starts — no lazy loading mid-session
const AssetLoader = {
  async loadAll(manifest) {
    const promises = manifest.map(asset => this.load(asset));
    await Promise.all(promises);
  }
};
```

- Show a loading screen with real progress.
- Preload all audio, images, and spritesheets before entering game loop.
- Use texture atlases for sprites — minimise draw calls.

---

## 6. Testing Strategy

### 6.1 Test Pyramid

```
         [E2E / Smoke]         ← Playwright: can the game boot and reach gameplay?
        [Integration Tests]    ← Vitest: do systems interact correctly?
      [Unit Tests]              ← Vitest: does each function behave correctly?
```

### 6.2 Unit Tests

**Location:** `tests/unit/`
**Runner:** `npm run test:unit`
**Target:** All pure functions — physics, collision, scoring, AI, state transitions.

```javascript
// tests/unit/physics.test.js
import { describe, it, expect } from 'vitest';
import { applyGravity, resolveAABB } from '../../src/physics.js';

describe('applyGravity', () => {
  it('increases velocity by gravity * deltaTime', () => {
    const entity = { vy: 0 };
    applyGravity(entity, 0.016); // 60fps frame
    expect(entity.vy).toBeCloseTo(9.8 * 0.016);
  });

  it('clamps velocity at terminal velocity', () => {
    const entity = { vy: 1000 };
    applyGravity(entity, 1);
    expect(entity.vy).toBeLessThanOrEqual(500); // terminal vel constant
  });
});

describe('resolveAABB', () => {
  it('pushes overlapping entities apart', () => { ... });
  it('returns no collision for separated entities', () => { ... });
  it('handles zero-size entities without throwing', () => { ... });
});
```

**Required coverage:** All physics, collision, game-rule, and state-machine logic.

### 6.3 Integration Tests

**Location:** `tests/integration/`
**Runner:** `npm run test:integration`
**Target:** System interactions — player + physics, enemy AI + pathfinding, scoring + events.

```javascript
// tests/integration/player-physics.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer } from '../../src/entities/player.js';
import { PhysicsSystem } from '../../src/systems/physics.js';
import { CollisionWorld } from '../../src/systems/collision.js';

describe('Player + Physics integration', () => {
  let player, physics, world;

  beforeEach(() => {
    player = createPlayer({ x: 100, y: 0 });
    world = new CollisionWorld([
      { x: 0, y: 300, w: 800, h: 20 } // floor
    ]);
    physics = new PhysicsSystem(world);
  });

  it('player falls due to gravity and lands on floor', () => {
    for (let i = 0; i < 120; i++) physics.update(player, 0.016);
    expect(player.y + player.height).toBeCloseTo(300, 0);
    expect(player.onGround).toBe(true);
  });

  it('player cannot fall through floor at high velocity', () => {
    player.vy = 9999; // simulate tunneling scenario
    physics.update(player, 0.016);
    expect(player.y + player.height).toBeLessThanOrEqual(300);
  });
});
```

### 6.4 Regression Suite

**Location:** `tests/regression/`
**Runner:** `npm run test:regression`
**Purpose:** Prevent previously-fixed bugs from returning.

Every bug fix MUST have a corresponding regression test created at the time of fix.

```javascript
// tests/regression/REG-001-player-falls-through-floor.test.js
/**
 * REG-001
 * Bug: Player fell through floor at >30fps delta spikes
 * Fixed: 2024-03-15, commit abc1234
 * Trigger: High deltaTime + high velocity combination
 */
import { describe, it, expect } from 'vitest';

describe('[REG-001] Player floor tunnelling', () => {
  it('does not tunnel at 2x normal delta time', () => { ... });
  it('does not tunnel at 10x normal delta time (tab unfocus)', () => { ... });
});
```

**Regression test naming:** `REG-XXX-short-description.test.js`
**Regression log:** Maintain `REGRESSION_LOG.md` (see Section 9).

### 6.5 Smoke Tests (E2E)

**Location:** `tests/e2e/`
**Runner:** `npm run test:e2e`
**Tool:** Playwright (headless Chromium)

```javascript
// tests/e2e/game-boot.spec.js
import { test, expect } from '@playwright/test';

test('game boots and reaches main menu', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('#main-menu')).toBeVisible({ timeout: 5000 });
});

test('game starts and renders canvas within 3 seconds', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('#start-button');
  const canvas = page.locator('canvas#game-canvas');
  await expect(canvas).toBeVisible({ timeout: 3000 });
});

test('no console errors during 10 seconds of gameplay', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('http://localhost:5173');
  await page.click('#start-button');
  await page.waitForTimeout(10000);
  expect(errors).toHaveLength(0);
});
```

### 6.6 Performance Baseline Test

```javascript
// tests/performance/framerate.test.js
// Run with: npm run test:perf
test('game maintains 60fps average over 5 seconds', async ({ page }) => {
  // Use PerformanceObserver or custom FPS counter in game
  const avgFps = await page.evaluate(() => window.__gameDebug.averageFps);
  expect(avgFps).toBeGreaterThan(55);
});
```

---

## 7. npm Scripts — Required

```json
{
  "scripts": {
    "dev":                "vite",
    "build":              "vite build",
    "preview":            "vite preview",

    "test:unit":          "vitest run tests/unit",
    "test:integration":   "vitest run tests/integration",
    "test:regression":    "vitest run tests/regression",
    "test:e2e":           "playwright test tests/e2e",
    "test:perf":          "playwright test tests/performance",
    "test:all":           "npm run test:unit && npm run test:integration && npm run test:regression",
    "test:ci":            "npm run test:all && npm run test:e2e",

    "lint":               "eslint src tests",
    "lint:fix":           "eslint src tests --fix",
    "typecheck":          "tsc --noEmit",

    "precommit":          "npm run lint && npm run test:unit",
    "prepush":            "npm run test:all"
  }
}
```

Install `husky` to enforce `precommit` and `prepush` hooks automatically.

---

## 8. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: Game CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck        # if using TypeScript
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:regression
      - run: npx playwright install --with-deps chromium
      - run: npm run dev &            # start dev server in background
      - run: npm run test:e2e

  release:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: game-dist
          path: dist/
```

---

## 9. Bug & Regression Log

Maintain `REGRESSION_LOG.md` in the project root. Format:

```markdown
| ID      | Date       | Description                          | Commit  | Test File                                    |
|---------|------------|--------------------------------------|---------|----------------------------------------------|
| REG-001 | 2024-03-15 | Player tunnels through floor at high velocity | abc1234 | tests/regression/REG-001-floor-tunneling.test.js |
| REG-002 | 2024-03-22 | Score counter overflows at 999999    | def5678 | tests/regression/REG-002-score-overflow.test.js  |
```

**Rule:** No bug is closed until its regression test is merged and the log is updated.

---

## 10. Common Game Bugs — Always Check These First

When the game is unplayable, diagnose in this order:

### 10.1 Game Loop Issues
- [ ] Is `requestAnimationFrame` called correctly and not duplicated?
- [ ] Is `deltaTime` capped to prevent death spirals?
- [ ] Is there a missing `return` causing the loop to run twice?

### 10.2 Physics & Collision
- [ ] Is movement multiplied by `deltaTime`? (frame-rate independence)
- [ ] Is collision resolution causing objects to vibrate/jitter?
- [ ] Are fast-moving objects tunnelling through thin geometry?
- [ ] Is gravity accumulating incorrectly when grounded?

### 10.3 State Bugs
- [ ] Can the game enter an invalid state (e.g. `paused` while `gameover`)?
- [ ] Is state being reset properly on game restart?
- [ ] Are event listeners being removed and re-added on state transitions?

### 10.4 Memory & Performance
- [ ] Are objects being created inside the game loop (GC pressure)?
- [ ] Are event listeners stacking up without being removed?
- [ ] Are textures/audio being loaded multiple times?
- [ ] Is canvas context being saved/restored without balance?

### 10.5 Input
- [ ] Are key events firing on wrong element (focus issues)?
- [ ] Is `justPressed` being flushed each frame?
- [ ] Is there input lag due to processing in `render()` instead of `update()`?

---

## 11. Code Style Rules

```javascript
// ✅ GOOD — delta-time based movement
player.x += player.speed * deltaTime;

// ❌ BAD — frame-rate dependent (breaks at non-60fps)
player.x += 5;

// ✅ GOOD — object pooling for frequently spawned entities
const bulletPool = new ObjectPool(Bullet, 100);
const bullet = bulletPool.acquire();

// ❌ BAD — GC pressure inside game loop
const bullet = new Bullet(x, y);

// ✅ GOOD — explicit state transitions
GameState.transition('playing');

// ❌ BAD — scattered state mutation
GameState.status = 'playing';
someOtherSystem.active = true;
uiLayer.visible = false;
```

---

## 12. What Claude Code Must Always Do

1. **Read this file before starting any task.**
2. **Run `npm run test:unit` before and after every code change** — report results.
3. **Never modify more than one system at a time** (e.g. don't change physics and rendering in the same task).
4. **When fixing a bug**, write the regression test first (TDD), then fix the code.
5. **When adding a feature**, write the unit/integration tests alongside the code.
6. **Check the game loop** after every change to `update()` or `render()`.
7. **Before pushing**, run `npm run test:all` and confirm green.
8. **Follow the branching strategy** — never commit directly to `develop` or `main`.
9. **Log all new bugs** in `REGRESSION_LOG.md` with test file reference.
10. **If tests are failing**, fix them before proceeding. Do not skip or comment out failing tests.

---

## 13. Definition of Done

A task is only **Done** when:

- [ ] Feature/fix works correctly in-browser
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if cross-system)
- [ ] Regression test added (if bug fix)
- [ ] `REGRESSION_LOG.md` updated (if bug fix)
- [ ] Linter passes with zero warnings
- [ ] PR opened against `develop` (not `main`)
- [ ] CI pipeline green on the PR
- [ ] Code reviewed (if team project)
- [ ] Merged via PR — no direct pushes

---

*Last updated: April 2026 | Maintained by: [Your Name / Team]*