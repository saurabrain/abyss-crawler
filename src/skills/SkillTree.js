import { buildSkillTree } from './skillData.js';

export class SkillTree {
  constructor(className) {
    this.nodes = buildSkillTree(className);
    this.unlocked = new Set();
  }

  canUnlock(nodeId, skillPoints) {
    if (this.unlocked.has(nodeId) || skillPoints <= 0) return false;
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    if (node.cost > skillPoints) return false;
    return node.requires.every(r => this.unlocked.has(r));
  }

  unlock(nodeId, player) {
    if (!this.canUnlock(nodeId, player.skillPoints)) return false;
    const node = this.nodes.find(n => n.id === nodeId);
    player.skillPoints -= node.cost;
    this.unlocked.add(nodeId);
    node.effect(player);
    return true;
  }
}
