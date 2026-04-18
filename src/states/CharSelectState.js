import { WARRIOR } from '../classes/Warrior.js';
import { MAGE } from '../classes/Mage.js';
import { RANGER } from '../classes/Ranger.js';
import { GameplayState } from './GameplayState.js';

const CLASSES = [WARRIOR, MAGE, RANGER];

export class CharSelectState {
  onEnter(game) {
    this.selected = 0;
    this._t = 0;
  }

  update(game, dt) {
    this._t += dt;
    const { input } = game;
    if (input.isJustPressed('ArrowLeft'))  this.selected = (this.selected + 2) % 3;
    if (input.isJustPressed('ArrowRight')) this.selected = (this.selected + 1) % 3;

    if (input.isMouseJustPressed('left')) {
      const W = game.W, H = game.H;
      const cardW = 220, cardH = 340, gap = 30;
      const totalW = 3 * cardW + 2 * gap;
      const startX = W / 2 - totalW / 2;
      const startY = H / 2 - cardH / 2 - 20;
      for (let i = 0; i < 3; i++) {
        const cx = startX + i * (cardW + gap);
        if (game.input.mouse.x >= cx && game.input.mouse.x < cx + cardW &&
            game.input.mouse.y >= startY && game.input.mouse.y < startY + cardH) {
          this.selected = i;
        }
      }
      // Check confirm button
      const bx = W / 2 - 80, by = H - 90;
      if (game.input.mouse.x >= bx && game.input.mouse.x < bx + 160 &&
          game.input.mouse.y >= by && game.input.mouse.y < by + 40) {
        game.setState(new GameplayState(CLASSES[this.selected]));
      }
    }
    if (input.isJustPressed('Enter') || input.isJustPressed('Space')) {
      game.setState(new GameplayState(CLASSES[this.selected]));
    }
  }

  draw(game, ctx) {
    const { W, H } = game;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHOOSE YOUR CLASS', W / 2, 60);

    const cardW = 220, cardH = 340, gap = 30;
    const totalW = 3 * cardW + 2 * gap;
    const startX = W / 2 - totalW / 2;
    const startY = H / 2 - cardH / 2 - 20;

    for (let i = 0; i < 3; i++) {
      const cls = CLASSES[i];
      const cx = startX + i * (cardW + gap);
      const sel = i === this.selected;

      ctx.fillStyle = sel ? '#1a1a3e' : '#0d0d20';
      ctx.fillRect(cx, startY, cardW, cardH);
      ctx.strokeStyle = sel ? cls.color : '#333';
      ctx.lineWidth = sel ? 3 : 1;
      ctx.strokeRect(cx, startY, cardW, cardH);

      // Class name
      ctx.fillStyle = cls.color;
      ctx.font = `bold 22px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(cls.name, cx + cardW / 2, startY + 36);

      // Preview character (mini render)
      ctx.save();
      const px = cx + cardW / 2;
      const py = startY + 120;
      ctx.translate(px, py);
      const scale = 2.5;
      ctx.scale(scale, scale);
      cls.drawPlayer(ctx, { facingAngle: 0 });
      ctx.restore();

      // Stats
      ctx.fillStyle = '#ccc';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      const stats = [
        `HP: ${cls.baseHp}`,
        `${cls.resourceName}: ${cls.baseResource}`,
        `Damage: ${cls.baseDamage}`,
        `Speed: ${cls.speed}`,
      ];
      stats.forEach((s, si) => ctx.fillText(s, cx + 14, startY + 210 + si * 18));

      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const descWords = cls.description.split(' ');
      let line = '', lines = [];
      for (const w of descWords) {
        if ((line + w).length > 22) { lines.push(line.trim()); line = ''; }
        line += w + ' ';
      }
      lines.push(line.trim());
      lines.forEach((l, li) => ctx.fillText(l, cx + cardW / 2, startY + 295 + li * 14));
    }

    // Confirm button
    const bx = W / 2 - 80, by = H - 90;
    const pulse = 0.8 + 0.2 * Math.sin(this._t * 4);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = CLASSES[this.selected].color;
    ctx.fillRect(bx, by, 160, 40);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER ABYSS', W / 2, by + 26);

    ctx.fillStyle = '#555';
    ctx.font = '12px monospace';
    ctx.fillText('← → to switch  •  Enter or click to confirm', W / 2, H - 20);
  }
}
