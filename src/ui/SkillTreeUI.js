export class SkillTreeUI {
  constructor() {
    this.visible = false;
  }

  toggle() { this.visible = !this.visible; }

  handleClick(mx, my, skillTree, player) {
    if (!this.visible) return;
    for (const node of skillTree.nodes) {
      const nx = node.x, ny = node.y;
      if (mx >= nx - 24 && mx <= nx + 24 && my >= ny - 24 && my <= ny + 24) {
        skillTree.unlock(node.id, player);
        return;
      }
    }
  }

  draw(ctx, skillTree, player, W, H) {
    if (!this.visible) return;
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SKILL TREE  [Tab to close]', W / 2, 32);

    ctx.fillStyle = '#f1c40f';
    ctx.font = '14px monospace';
    ctx.fillText(`Skill Points: ${player.skillPoints}`, W / 2, 54);

    // Draw connections
    for (const node of skillTree.nodes) {
      for (const reqId of node.requires) {
        const req = skillTree.nodes.find(n => n.id === reqId);
        if (!req) continue;
        ctx.strokeStyle = skillTree.unlocked.has(reqId) ? '#555' : '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(req.x, req.y + 70);
        ctx.lineTo(node.x, node.y + 70);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const node of skillTree.nodes) {
      const nx = node.x, ny = node.y + 70;
      const unlocked = skillTree.unlocked.has(node.id);
      const canGet = skillTree.canUnlock(node.id, player.skillPoints);

      ctx.fillStyle = unlocked ? '#2ecc71' : canGet ? '#f39c12' : '#2c3e50';
      ctx.fillRect(nx - 24, ny - 24, 48, 48);
      ctx.strokeStyle = unlocked ? '#27ae60' : canGet ? '#e67e22' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(nx - 24, ny - 24, 48, 48);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const words = node.label.split(' ');
      words.forEach((w, i) => ctx.fillText(w, nx, ny - 6 + i * 11));

      ctx.fillStyle = '#aaa';
      ctx.font = '9px monospace';
      ctx.fillText(`(${node.cost}SP)`, nx, ny + 20);
    }

    ctx.fillStyle = '#555';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Green=unlocked  Orange=available  Click to unlock', W / 2, H - 20);
  }
}
