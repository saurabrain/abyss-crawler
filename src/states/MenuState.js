import { CharSelectState } from './CharSelectState.js';

export class MenuState {
  onEnter(game) { this._t = 0; }

  update(game, dt) {
    this._t += dt;
    if (game.input.isJustPressed('Space') || game.input.isJustPressed('Enter') || game.input.isMouseJustPressed('left')) {
      game.setState(new CharSelectState());
    }
  }

  draw(game, ctx) {
    const { W, H } = game;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137.5 + this._t * 2) % W);
      const sy = (i * 97.3) % H;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Title
    ctx.save();
    ctx.shadowColor = '#7f00ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#b266ff';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ABYSS CRAWLER', W / 2, H / 2 - 60);
    ctx.restore();

    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A Path of Exile-inspired Browser ARPG', W / 2, H / 2 - 20);

    const pulse = 0.7 + 0.3 * Math.sin(this._t * 3);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('CLICK OR PRESS SPACE TO BEGIN', W / 2, H / 2 + 40);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#555';
    ctx.font = '12px monospace';
    ctx.fillText('WASD to move  •  Mouse to aim & attack  •  1-4 skills  •  Tab skill tree  •  I inventory', W / 2, H - 20);
  }
}
