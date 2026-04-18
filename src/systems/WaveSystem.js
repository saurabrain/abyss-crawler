import { Enemy } from '../enemies/Enemy.js';
import { GRUNT_DEF, ARCHER_DEF, SHAMAN_DEF, BOSS_DEF } from '../enemies/enemyDefs.js';

function scaleEnemy(def, stage) {
  const scale = 1 + (stage - 1) * 0.18;
  return {
    ...def,
    hp: Math.round(def.hp * scale),
    damage: Math.round(def.damage * scale),
    xpReward: Math.round(def.xpReward * scale),
  };
}

function pickPool(stage) {
  const pool = [GRUNT_DEF];
  if (stage >= 2) pool.push(GRUNT_DEF); // more grunts
  if (stage >= 3) pool.push(ARCHER_DEF);
  if (stage >= 5) pool.push(SHAMAN_DEF);
  return pool;
}

export class WaveSystem {
  constructor(stage, tilemap) {
    this.stage = stage;
    this.tilemap = tilemap;
    this.isBossStage = stage % 5 === 0;

    const base = 5 + stage * 2;
    this.totalWaves = this.isBossStage ? 1 : 3 + Math.floor(stage / 2);
    this.enemiesPerWave = this.isBossStage ? 1 : base;
    this.currentWave = 0;
    this.enemies = [];
    this._waveDelay = 0;
    this._betweenWaveGap = 4; // seconds before next wave
    this.spawnedAll = false;
    this.complete = false;
  }

  start(player) {
    this.player = player;
    this._spawnWave();
  }

  _spawnWave() {
    if (this.currentWave >= this.totalWaves) { this.spawnedAll = true; return; }
    this.currentWave++;

    const px = this.player?.x ?? 0;
    const py = this.player?.y ?? 0;
    const minSpawnDist = this.isBossStage ? 300 : 260;

    if (this.isBossStage) {
      const center = this.tilemap.spawnPointFarFrom(px, py, minSpawnDist);
      const boss = new Enemy(center.x, center.y, scaleEnemy(BOSS_DEF, this.stage));
      // Patch in _defaultChase inline since we can't bind in plain def
      boss._defaultChaseInline = (player, self) => {
        const dx = player.x - self.x;
        const dy = player.y - self.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        self.vx = dx / len * self.speed;
        self.vy = dy / len * self.speed;
      };
      this.enemies.push(boss);
    } else {
      const pool = pickPool(this.stage);
      const dirs = ['N', 'S', 'E', 'W'];
      for (let i = 0; i < this.enemiesPerWave; i++) {
        const dir = dirs[i % 4];
        const pt  = this.tilemap.spawnPointInDirection(px, py, dir, minSpawnDist);
        const def = pool[Math.floor(Math.random() * pool.length)];
        this.enemies.push(new Enemy(pt.x, pt.y, scaleEnemy(def, this.stage)));
      }
    }
  }

  update(dt) {
    if (this.complete) return;

    // Check all current enemies dead
    const alive = this.enemies.filter(e => !e.dead);

    if (alive.length === 0 && !this.spawnedAll) {
      this._waveDelay -= dt;
      if (this._waveDelay <= 0) {
        this._spawnWave();
        this._waveDelay = this._betweenWaveGap;
      }
    } else if (alive.length === 0 && this.spawnedAll) {
      this.complete = true;
    }

    // Shaman heal pulse
    for (const e of alive) {
      if (e._emitHeal) {
        e._emitHeal = false;
        for (const other of alive) {
          if (other !== e) {
            other.hp = Math.min(other.maxHp, other.hp + other.maxHp * 0.08);
          }
        }
      }
    }
  }

  get aliveEnemies() { return this.enemies.filter(e => !e.dead); }
  get remainingCount() { return this.aliveEnemies.length; }
  get wavesInfo() { return `Wave ${Math.min(this.currentWave, this.totalWaves)}/${this.totalWaves}`; }
}
