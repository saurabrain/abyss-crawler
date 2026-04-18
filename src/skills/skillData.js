// Passive skill tree nodes shared across all classes + class-specific ones
// Each node: { id, label, desc, x, y, cost, requires[], effect(player) }

export function buildSkillTree(className) {
  const base = [
    { id: 'hp1',    label: '+20 HP',         desc: '+20 Max HP',           x: 200, y: 100, cost: 1, requires: [],       effect: p => { p.maxHp += 20; p.hp += 20; } },
    { id: 'hp2',    label: '+40 HP',         desc: '+40 Max HP',           x: 200, y: 200, cost: 1, requires: ['hp1'],  effect: p => { p.maxHp += 40; p.hp += 40; } },
    { id: 'spd1',   label: '+15 Speed',      desc: '+15 Move Speed',       x: 350, y: 100, cost: 1, requires: [],       effect: p => { p.bonusSpeed += 15; } },
    { id: 'spd2',   label: '+25 Speed',      desc: '+25 Move Speed',       x: 350, y: 200, cost: 1, requires: ['spd1'], effect: p => { p.bonusSpeed += 25; } },
    { id: 'dmg1',   label: '+8 Damage',      desc: '+8 Base Damage',       x: 500, y: 100, cost: 1, requires: [],       effect: p => { p.bonusDamage += 8; } },
    { id: 'dmg2',   label: '+15 Damage',     desc: '+15 Base Damage',      x: 500, y: 200, cost: 1, requires: ['dmg1'], effect: p => { p.bonusDamage += 15; } },
    { id: 'cdr1',   label: '10% CDR',        desc: '10% Cooldown Reduction', x: 650, y: 100, cost: 1, requires: [],    effect: p => { p.bonusCdr += 0.1; } },
    { id: 'atkspd', label: '15% Atk Speed',  desc: '15% faster attacks',   x: 650, y: 200, cost: 1, requires: ['cdr1'],effect: p => { p.bonusAtkSpeed += 0.15; } },
  ];

  const classSpecific = {
    Warrior: [
      { id: 'w_life', label: 'Lifesteal+',  desc: '+10% lifesteal on hits', x: 200, y: 320, cost: 2, requires: ['hp2'],  effect: p => { p._lifeStealBonus = (p._lifeStealBonus ?? 0) + 0.1; } },
      { id: 'w_rage', label: 'Rage Mode',   desc: 'Gain rage on kills',     x: 350, y: 320, cost: 2, requires: ['dmg1'], effect: p => { p._rageMode = true; } },
    ],
    Mage: [
      { id: 'm_nova', label: 'Nova Size+',  desc: '+2 nova projectiles',    x: 200, y: 320, cost: 2, requires: ['dmg1'], effect: p => { p._novaExtra = (p._novaExtra ?? 0) + 2; } },
      { id: 'm_mana', label: '+50 Mana',    desc: '+50 max mana',           x: 350, y: 320, cost: 2, requires: ['hp1'],  effect: p => { p.maxResource += 50; p.resource += 50; } },
    ],
    Ranger: [
      { id: 'r_pierce', label: 'Pierce+',  desc: '+1 arrow pierce',        x: 200, y: 320, cost: 2, requires: ['dmg1'], effect: p => { p._extraPierce = (p._extraPierce ?? 0) + 1; } },
      { id: 'r_dodge',  label: 'Quick Dodge', desc: '-0.5s dodge cooldown', x: 350, y: 320, cost: 2, requires: ['spd1'], effect: p => { p._dodgeCooldownMax = Math.max(0.5, p._dodgeCooldownMax - 0.5); } },
    ],
  };

  return [...base, ...(classSpecific[className] ?? [])];
}
