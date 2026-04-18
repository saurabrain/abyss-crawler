export const MAX_SLOTS = 12;

export class Inventory {
  constructor() {
    this.items = []; // up to MAX_SLOTS
    this.equipped = []; // equipped items (up to 4)
  }

  add(item) {
    if (this.items.length < MAX_SLOTS) {
      this.items.push(item);
      return true;
    }
    return false;
  }

  equip(index, player) {
    const item = this.items[index];
    if (!item) return;
    // Unequip oldest if full
    if (this.equipped.length >= 4) {
      const old = this.equipped.shift();
      old.removeFrom(player);
    }
    item.applyTo(player);
    this.equipped.push(item);
    this.items.splice(index, 1);
  }

  unequipAll(player) {
    for (const item of this.equipped) item.removeFrom(player);
    this.equipped = [];
  }
}
