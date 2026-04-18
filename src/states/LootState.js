import { GameplayState } from './GameplayState.js';
import { RARITY_COLORS } from '../items/Item.js';

export class LootState {
  constructor(items, classDef, nextStage, player, inventory, skillTree) {
    this.items = items;
    this.classDef = classDef;
    this.nextStage = nextStage;
    this.player = player;
    this.inventory = inventory;
    this.skillTree = skillTree;
  }

  onEnter(game) {
    this._t = 0;
    this._taken = new Set();
  }

  update(game, dt) {
    this._t += dt;
    if (game.input.isJustPressed('Enter') || game.input.isJustPressed('Space')) {
      this._proceed(game);
      return;
    }
    if (game.input.isMouseJustPressed('left')) {
      const { W, H } = game;
      // Check continue button
      const bx = W / 2 - 80, by = H - 80;
      if (game.input.mouse.x >= bx && game.input.mouse.x < bx + 160 &&
          game.input.mouse.y >= by && game.input.mouse.y < by + 40) {
        this._proceed(game);
        return;
      }
      // Click items to take
      const layout = this._itemLayout(W, H);
      for (let i = 0; i < this.items.length; i++) {
        if (this._taken.has(i)) continue;
        const slot = layout[i];
        if (!slot) continue;
        if (game.input.mouse.x >= slot.x && game.input.mouse.x < slot.x + slot.w &&
            game.input.mouse.y >= slot.y && game.input.mouse.y < slot.y + slot.h) {
          if (this.inventory.add(this.items[i])) this._taken.add(i);
        }
      }
    }
  }

  _proceed(game) {
    game.setState(new GameplayState(this.classDef, this.nextStage, this.player, this.inventory, this.skillTree));
  }

  _itemLayout(W, H) {
    const slotW = 200, slotH = 60, gap = 8;
    const cols = 4;
    const startX = W / 2 - (cols * (slotW + gap)) / 2;
    const startY = 120;
    return this.items.map((_, i) => ({
      x: startX + (i % cols) * (slotW + gap),
      y: startY + Math.floor(i / cols) * (slotH + gap),
      w: slotW, h: slotH,
    }));
  }

  draw(game, ctx) {
    const { W, H } = game;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${this.nextStage - 1} COMPLETE!`, W / 2, 50);

    ctx.fillStyle = '#ccc';
    ctx.font = '14px monospace';
    ctx.fillText('Click items to pick up (inventory must have space)', W / 2, 80);
    ctx.fillText(`Lv.${this.player.level} • SP: ${this.player.skillPoints}${this.player.skillPoints > 0 ? ' (open Tab in game)' : ''}`, W / 2, 100);

    if (this.items.length === 0) {
      ctx.fillStyle = '#555';
      ctx.font = '16px monospace';
      ctx.fillText('No loot dropped this stage.', W / 2, 200);
    } else {
      const layout = this._itemLayout(W, H);
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const slot = layout[i];
        const taken = this._taken.has(i);
        ctx.fillStyle = taken ? '#111' : '#1a1a2e';
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.strokeStyle = taken ? '#333' : item.color;
        ctx.lineWidth = taken ? 1 : 2;
        ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);

        if (!taken) {
          ctx.fillStyle = item.color;
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(item.name, slot.x + 8, slot.y + 18);
          ctx.fillStyle = '#888';
          ctx.font = '10px monospace';
          const desc = item.description.split('\n')[0];
          ctx.fillText(desc, slot.x + 8, slot.y + 34);
          if (item.affixes.length > 1) ctx.fillText(`+${item.affixes.length - 1} more...`, slot.x + 8, slot.y + 48);
        } else {
          ctx.fillStyle = '#444';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TAKEN', slot.x + slot.w / 2, slot.y + slot.h / 2 + 4);
        }
      }
    }

    // Continue button
    const bx = W / 2 - 80, by = H - 80;
    const pulse = 0.8 + 0.2 * Math.sin(this._t * 3);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#7f00ff';
    ctx.fillRect(bx, by, 160, 40);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${this.nextStage} →`, W / 2, by + 26);

    ctx.fillStyle = '#555';
    ctx.font = '12px monospace';
    ctx.fillText('Enter or click to continue', W / 2, H - 20);
  }
}
