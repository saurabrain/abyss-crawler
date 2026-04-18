# Abyss Crawler

A browser-based dungeon crawler ARPG inspired by Path of Exile, built with vanilla JavaScript and HTML5 Canvas.

Fight through procedurally generated dungeons, choose your class, collect loot, and unlock skills as you descend deeper into the abyss.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.x | Local dev server |
| Node.js | 18+ | Running tests |
| Git | any | Cloning the repo |

> No build step or npm install needed to play the game — it runs as plain ES modules in the browser.

---

## Clone & Run

```bash
# 1. Clone the repository
git clone https://github.com/saurabrain/abyss-crawler.git
cd abyss-crawler

# 2. Start the local server
python -m http.server 8080

# 3. Open your browser
#    http://localhost:8080
```

The game loads instantly — pick a class and start playing.

---

## Controls

| Key | Action |
|-----|--------|
| `W A S D` / Arrow keys | Move character |
| Mouse | Aim |
| Left click / hold | Primary attack |
| `1` `2` `3` `4` | Use skills |
| `Tab` | Open skill tree |
| `I` | Open inventory |
| `Escape` | Close any open UI panel |
| `Shift` (Ranger) | Dodge roll |

---

## Classes

| Class | Playstyle | Signature Skills |
|-------|-----------|-----------------|
| **Warrior** | Tanky melee fighter. High HP, lifesteal on hits. | Whirlwind (360° AoE), Ground Slam (knockback), Battle Cry (+damage) |
| **Ranger** | Agile ranged fighter. Dodge rolls, quick attacks. | Triple Shot, Explosive Arrow, Evasion |
| **Mage** | Glass cannon. Low HP, high burst damage. | Fireball, Chain Lightning, Frost Nova |

---

## Running Tests

```bash
# All tests (unit + regression)
node --test --import ./tests/_dom-stub.mjs tests/*.test.mjs tests/regression/*.test.mjs

# Quick unit tests only
node --test --import ./tests/_dom-stub.mjs tests/entity.test.mjs tests/inventory.test.mjs tests/itemGenerator.test.mjs tests/mapGenerator.test.mjs tests/skillTree.test.mjs tests/tilemap.test.mjs
```

Expected output: **43 tests passing, 0 failing**.

---

## Project Structure

```
abyss-crawler/
├── index.html              # Entry point
├── style.css
├── src/
│   ├── classes/            # Warrior, Ranger, Mage class definitions
│   ├── enemies/            # Enemy definitions and AI
│   ├── engine/             # Game loop, Camera, InputManager
│   ├── entities/           # Player, Entity base, Projectile
│   ├── items/              # Inventory, Item, ItemGenerator
│   ├── skills/             # Skill tree data and logic
│   ├── states/             # Menu, CharSelect, Gameplay, Loot states
│   ├── systems/            # Combat, Loot, Wave systems
│   ├── ui/                 # HUD, InventoryUI, SkillTreeUI
│   └── world/              # MapGenerator (BSP), Tilemap
└── tests/
    ├── *.test.mjs           # Unit tests
    └── regression/          # REG-001 – REG-005 regression guards
```

---

## Development Workflow

This project follows the branching strategy defined in [`src/classes/Claude.md`](src/classes/Claude.md).

```
main       ← tagged releases only
  └── develop    ← always green, all tests pass
        └── fix/*      ← bug fixes → PR into develop
        └── feature/*  ← new features → PR into develop
        └── docs/*     ← documentation → PR into develop
```

**To contribute:**

```bash
git checkout develop && git pull origin develop
git checkout -b fix/my-bug-description

# Make changes, write regression test first
# Run tests before pushing
node --test --import ./tests/_dom-stub.mjs tests/*.test.mjs tests/regression/*.test.mjs

git push origin fix/my-bug-description
# Open PR → develop on GitHub
```

All PRs require tests to be green before merge. No direct pushes to `develop` or `main`.

---

## Regression Log

Bug fixes are tracked in [`REGRESSION_LOG.md`](REGRESSION_LOG.md). Every fix ships with a corresponding regression test in `tests/regression/`.

---

## License

MIT
