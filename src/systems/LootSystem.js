import { generateItem } from '../items/ItemGenerator.js';

export class LootSystem {
  constructor() {
    this.groundItems = []; // { x, y, item }
  }

  processDeaths(enemies, stage) {
    for (const enemy of enemies) {
      if (enemy.dead && !enemy._lootProcessed) {
        enemy._lootProcessed = true;
        if (Math.random() < enemy.lootChance) {
          const item = generateItem(stage);
          this.groundItems.push({
            x: enemy.x + (Math.random() - 0.5) * 20,
            y: enemy.y + (Math.random() - 0.5) * 20,
            item,
          });
        }
      }
    }
  }

  checkPickup(player, pickupRadius = 30) {
    const picked = [];
    this.groundItems = this.groundItems.filter(gi => {
      const dx = gi.x - player.x;
      const dy = gi.y - player.y;
      if (Math.sqrt(dx * dx + dy * dy) < pickupRadius) {
        picked.push(gi.item);
        return false;
      }
      return true;
    });
    return picked;
  }

  draw(ctx, camera) {
    for (const gi of this.groundItems) {
      const s = camera.toScreen(gi.x, gi.y);
      ctx.save();
      ctx.fillStyle = gi.item.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }
}
