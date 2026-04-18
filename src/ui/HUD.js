export class HUD {
  draw(ctx, player, waveSystem, stage, W, H) {
    // Bottom bar background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, H - 70, W, 70);

    // HP bar
    this._bar(ctx, 10, H - 60, 160, 18, player.hp / player.maxHp, '#e74c3c', '#600');
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.maxHp}`, 14, H - 45);

    // Resource bar
    const rc = player.classDef.resourceColor;
    this._bar(ctx, 10, H - 38, 160, 14, player.resource / player.maxResource, rc, '#034');
    ctx.fillStyle = '#ccc';
    ctx.font = '10px monospace';
    ctx.fillText(`${player.classDef.resourceName} ${Math.floor(player.resource)}/${player.maxResource}`, 14, H - 27);

    // XP bar
    ctx.fillStyle = '#222';
    ctx.fillRect(0, H - 8, W, 8);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, H - 8, W * (player.xp / player.xpToNext), 8);

    // Level / skill points
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Lv.${player.level}`, 10, H - 10);
    if (player.skillPoints > 0) {
      ctx.fillStyle = '#f1c40f';
      ctx.fillText(` (${player.skillPoints} SP)`, 40, H - 10);
    }

    // Skill hotbar
    const skillKeys = ['1', '2', '3', '4'];
    const cds = player.skillCooldowns;
    const maxCds = player.skillMaxCooldowns;
    for (let i = 0; i < 4; i++) {
      const bx = W / 2 - 90 + i * 46;
      const by = H - 62;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, 40, 40);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, 40, 40);

      // Cooldown overlay
      if (cds[i] > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(bx, by, 40, 40 * (cds[i] / (maxCds[i] || 1)));
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cds[i].toFixed(1), bx + 20, by + 24);
      }

      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(skillKeys[i], bx + 20, by + 35);
    }

    // Wave info (top right)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W - 180, 10, 170, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Stage ${stage}`, W - 15, 30);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ccc';
    if (waveSystem) {
      ctx.fillText(waveSystem.wavesInfo, W - 15, 50);
      ctx.fillText(`Enemies: ${waveSystem.remainingCount}`, W - 15, 65);
    }
  }

  _bar(ctx, x, y, w, h, pct, fill, bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }

  drawSkillTreeHint(ctx, W, H) {
    ctx.fillStyle = '#f1c40f';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[Tab] Skill Tree  [I] Inventory  [Shift] Dodge (Ranger)', W / 2, H - 78);
  }
}
