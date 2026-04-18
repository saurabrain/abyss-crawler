import { Player } from '../entities/Player.js';
import { generateMap } from '../world/MapGenerator.js';
import { Tilemap } from '../world/Tilemap.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { LootSystem } from '../systems/LootSystem.js';
import { Inventory } from '../items/Inventory.js';
import { SkillTree } from '../skills/SkillTree.js';
import { HUD } from '../ui/HUD.js';
import { InventoryUI } from '../ui/InventoryUI.js';
import { SkillTreeUI } from '../ui/SkillTreeUI.js';
import { TILE } from '../world/MapGenerator.js';
import { LootState } from './LootState.js';
import { MenuState } from './MenuState.js';

export class GameplayState {
  constructor(classDef, stage = 1, player = null, inventory = null, skillTree = null) {
    this.classDef = classDef;
    this.stage = stage;
    this._existingPlayer = player;
    this._existingInventory = inventory;
    this._existingSkillTree = skillTree;
  }

  onEnter(game) {
    const mapData = generateMap(80, 60);
    this.tilemap = new Tilemap(mapData);
    game.tilemap = this.tilemap;

    if (this._existingPlayer) {
      this.player = this._existingPlayer;
      this.player.x = mapData.spawn.x;
      this.player.y = mapData.spawn.y;
      this.player.hp = this.player.maxHp; // heal on new stage
    } else {
      this.player = new Player(mapData.spawn.x, mapData.spawn.y, this.classDef);
    }

    this.inventory   = this._existingInventory  ?? new Inventory();
    this.skillTree   = this._existingSkillTree  ?? new SkillTree(this.classDef.name);

    this.waves      = new WaveSystem(this.stage, this.tilemap);
    this.combat     = new CombatSystem();
    this.loot       = new LootSystem();
    this.hud        = new HUD();
    this.invUI      = new InventoryUI();
    this.skillUI    = new SkillTreeUI();

    this.projectiles = [];
    this._portalGlow = 0;
    this._stageComplete = false;
    this._deathTimer = null;
    this._transitionTimer = null;

    game.camera.snapTo(this.player, this.tilemap.pixelW, this.tilemap.pixelH);

    this.waves.start(this.player);
  }

  update(game, dt) {
    const { input, camera, W, H } = game;

    if (this._deathTimer !== null) {
      this._deathTimer -= dt;
      if (this._deathTimer <= 0) game.setState(new MenuState());
      return;
    }
    if (this._transitionTimer !== null) {
      this._transitionTimer -= dt;
      if (this._transitionTimer <= 0) {
        const collected = this.loot.groundItems.map(g => g.item);
        game.setState(new LootState(collected, this.classDef, this.stage + 1, this.player, this.inventory, this.skillTree));
      }
      return;
    }

    // UI toggles
    if (input.isJustPressed('Tab')) { this.skillUI.toggle(); this.invUI.visible = false; }
    if (input.isJustPressed('KeyI')) { this.invUI.toggle(); this.skillUI.visible = false; }
    if (input.isJustPressed('Escape')) { this.skillUI.visible = false; this.invUI.visible = false; }

    const uiOpen = this.skillUI.visible || this.invUI.visible;

    // UI click handling
    if (input.isMouseJustPressed('left')) {
      this.skillUI.handleClick(input.mouse.x, input.mouse.y, this.skillTree, this.player);
      this.invUI.handleClick(input.mouse.x, input.mouse.y, this.inventory, this.player);
    }

    if (!uiOpen) {
      // Update camera world coords for mouse
      const wp = camera.toWorld(input.mouse.x, input.mouse.y);
      input.mouse.worldX = wp.x;
      input.mouse.worldY = wp.y;

      this.player.update(game, dt);

      // Collect player projectiles
      this.projectiles.push(...this.player.pendingProjectiles);

      // Update enemies
      const allEnemies = this.waves.enemies;
      for (const e of allEnemies) {
        if (!e.dead) {
          e.update(this.tilemap, this.player, dt);
          this.projectiles.push(...e.pendingProjectiles);
        }
      }

      // Update projectiles
      for (const p of this.projectiles) p.update(this.tilemap, dt);
      this.projectiles = this.projectiles.filter(p => !p.dead);

      // Combat
      this.combat.process(this.player, allEnemies, this.projectiles, dt);

      // XP from kills
      for (const e of allEnemies) {
        if (e.dead && !e._xpGiven) {
          e._xpGiven = true;
          this.player.gainXp(e.xpReward);
        }
      }

      // Loot
      this.loot.processDeaths(allEnemies, this.stage);
      const picked = this.loot.checkPickup(this.player);
      for (const item of picked) this.inventory.add(item);

      // Waves
      this.waves.update(dt);

      // Portal interaction
      if (this.waves.complete) {
        this._portalGlow += dt;
        const portalTile = this.tilemap.tileAt(this.player.x, this.player.y);
        if (portalTile === TILE.PORTAL && this._transitionTimer === null) {
          this._transitionTimer = 1.5;
        }
      }

      // Player death
      if (this.player.dead && this._deathTimer === null) {
        this._deathTimer = 3;
      }
    }

    const mwp = camera.toWorld(input.mouse.x, input.mouse.y);
    camera.follow(this.player, this.tilemap.pixelW, this.tilemap.pixelH, mwp.x, mwp.y, dt);
  }

  draw(game, ctx) {
    const { camera, W, H } = game;

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    camera.apply(ctx);

    this.tilemap.draw(ctx, camera);
    this.loot.draw(ctx, camera);

    // Draw projectiles
    for (const p of this.projectiles) p.draw(ctx, camera);

    // Draw enemies
    for (const e of this.waves.enemies) e.draw(ctx, camera);

    // Draw player
    this.player.draw(ctx, camera);

    ctx.restore();

    // Portal label (screen space)
    if (this.waves.complete) {
      const rooms = this.tilemap.rooms;
      const lastRoom = rooms[rooms.length - 1];
      const pwx = (Math.floor(lastRoom.x + lastRoom.w / 2)) * 32 + 16;
      const pwy = (Math.floor(lastRoom.y + lastRoom.h / 2)) * 32 + 16;
      const ps = camera.toScreen(pwx, pwy);
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(this._portalGlow * 4);
      ctx.fillStyle = '#b266ff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PORTAL — ENTER TO NEXT STAGE', ps.x, ps.y - 30);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Combat damage numbers
    this.combat.drawNumbers(ctx, camera);

    // HUD
    this.hud.draw(ctx, this.player, this.waves, this.stage, W, H);
    this.hud.drawSkillTreeHint(ctx, W, H);

    // UI overlays
    this.skillUI.draw(ctx, this.skillTree, this.player, W, H);
    this.invUI.draw(ctx, this.inventory, W, H);

    // Death screen
    if (this._deathTimer !== null) {
      ctx.fillStyle = 'rgba(150,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU DIED', W / 2, H / 2);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Stage ${this.stage} • Level ${this.player.level}`, W / 2, H / 2 + 40);
      ctx.fillText('Returning to menu...', W / 2, H / 2 + 70);
    }

    // Transition
    if (this._transitionTimer !== null) {
      ctx.fillStyle = 'rgba(127,0,255,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`STAGE ${this.stage + 1}`, W / 2, H / 2);
    }
  }
}
