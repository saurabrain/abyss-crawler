# Regression Log

| ID      | Date       | Description                                                               | Commit  | Test File                                                        |
|---------|------------|---------------------------------------------------------------------------|---------|------------------------------------------------------------------|
| REG-001 | 2026-04-18 | Skill tree opened with Tab had no Escape to close; Tab also caused browser focus shift | e263c30 | tests/regression/REG-001-escape-closes-ui.test.mjs               |
| REG-002 | 2026-04-18 | moveWithCollision only checked entity centre, allowing corners to clip through walls | 3b30c6c | tests/regression/REG-002-aabb-corner-collision.test.mjs          |
| REG-003 | 2026-04-18 | BSP corridors were 1 tile wide; 20×20 player got stuck at junctions       | 3b30c6c | tests/regression/REG-003-corridors-three-tiles-wide.test.mjs     |
| REG-004 | 2026-04-18 | Grunt aggroRange (200px) < minSpawnDist (260px) — grunts never chased player | 07fdf29 | tests/regression/REG-004-enemy-aggro-range.test.mjs              |
| REG-005 | 2026-04-18 | Warrior primary arc 144° missed flankers; Battle Cry bonus never expired  | be30d2d | tests/regression/REG-005-warrior-aoe.test.mjs                    |
| REG-006 | 2026-04-18 | Camera look-ahead toward mouse made viewport pan rapidly with mouse movement | c439776 | tests/regression/REG-006-camera-no-lookahead.test.mjs            |
| REG-007 | 2026-04-18 | Warrior sword rotated continuously with mouse; should only swing on click  | 926dca0 | tests/regression/REG-007-warrior-swing-on-click.test.mjs         |
| REG-008 | 2026-04-18 | Enemies spawned at random tiles; now cycle N/S/E/W cardinal directions     | 857bb87 | tests/regression/REG-008-cardinal-spawn-directions.test.mjs      |
