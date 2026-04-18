export class InventoryUI {
  constructor() {
    this.visible = false;
    this.hovered = -1;
  }

  toggle() { this.visible = !this.visible; }

  handleClick(mx, my, inventory, player) {
    if (!this.visible) return;
    const layout = this._layout(800, 540);
    for (let i = 0; i < inventory.items.length; i++) {
      const slot = layout.slots[i];
      if (!slot) continue;
      if (mx >= slot.x && mx < slot.x + slot.size && my >= slot.y && my < slot.y + slot.size) {
        inventory.equip(i, player);
        return;
      }
    }
  }

  handleMove(mx, my, W, H) {
    if (!this.visible) return;
    // track hover
  }

  draw(ctx, inventory, W, H) {
    if (!this.visible) return;
    const { panelX, panelY, panelW, panelH, slots } = this._layout(W, H);

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INVENTORY  [I to close]', panelX + 10, panelY + 24);

    // Inventory slots
    ctx.font = '11px monospace';
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const item = inventory.items[i];
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(slot.x, slot.y, slot.size, slot.size);
      ctx.strokeStyle = '#555';
      ctx.strokeRect(slot.x, slot.y, slot.size, slot.size);
      if (item) {
        ctx.fillStyle = item.color;
        ctx.fillRect(slot.x + 4, slot.y + 4, slot.size - 8, slot.size - 8);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(item.type[0], slot.x + slot.size / 2, slot.y + slot.size / 2 + 4);
      }
    }

    // Equipped
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Equipped:', panelX + 10, panelY + 280);
    for (let i = 0; i < inventory.equipped.length; i++) {
      const it = inventory.equipped[i];
      ctx.fillStyle = it.color;
      ctx.font = '11px monospace';
      ctx.fillText(`${it.name}: ${it.description.replace(/\n/g, ', ')}`, panelX + 10, panelY + 298 + i * 18);
    }

    // Tooltip hint
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.fillText('Click item to equip (max 4 equipped)', panelX + 10, panelY + panelH - 12);
  }

  _layout(W, H) {
    const panelW = 400;
    const panelH = 380;
    const panelX = W / 2 - panelW / 2;
    const panelY = H / 2 - panelH / 2;
    const slotSize = 52;
    const cols = 6;
    const slots = [];
    for (let i = 0; i < 12; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      slots.push({ x: panelX + 10 + col * (slotSize + 4), y: panelY + 36 + row * (slotSize + 4), size: slotSize });
    }
    return { panelX, panelY, panelW, panelH, slots };
  }
}
