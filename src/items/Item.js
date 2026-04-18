export const RARITY = { NORMAL: 0, MAGIC: 1, RARE: 2, UNIQUE: 3 };
export const RARITY_NAMES = ['Normal', 'Magic', 'Rare', 'Unique'];
export const RARITY_COLORS = ['#aaa', '#88f', '#ff0', '#f80'];

export const ITEM_TYPES = ['Sword', 'Staff', 'Bow', 'Helm', 'Chest', 'Boots', 'Amulet', 'Ring'];

export const AFFIXES = [
  { id: 'flatDmg',   label: '+{v} Damage',         stat: 'bonusDamage',   min: 3,  max: 15 },
  { id: 'hp',        label: '+{v} Max HP',          stat: 'bonusHp',       min: 10, max: 50 },
  { id: 'speed',     label: '+{v} Move Speed',      stat: 'bonusSpeed',    min: 5,  max: 25 },
  { id: 'atkspd',    label: '+{v}% Attack Speed',   stat: 'bonusAtkSpeed', min: 0.05, max: 0.3, isPercent: true },
  { id: 'cdr',       label: '+{v}% Cooldown Reduction', stat: 'bonusCdr', min: 0.03, max: 0.2, isPercent: true },
];

export class Item {
  constructor(type, rarity, affixes) {
    this.type = type;
    this.rarity = rarity;
    this.affixes = affixes; // [{ affix, value }]
    this.id = Math.random().toString(36).slice(2);
  }

  get name() {
    return `${RARITY_NAMES[this.rarity]} ${this.type}`;
  }

  get color() { return RARITY_COLORS[this.rarity]; }

  get description() {
    return this.affixes.map(a => {
      const val = a.affix.isPercent ? `${Math.round(a.value * 100)}%` : Math.round(a.value);
      return a.affix.label.replace('{v}', val);
    }).join('\n');
  }

  applyTo(player) {
    for (const { affix, value } of this.affixes) {
      player[affix.stat] = (player[affix.stat] ?? 0) + value;
      if (affix.stat === 'bonusHp') {
        player.maxHp += value;
        player.hp += value;
      }
    }
  }

  removeFrom(player) {
    for (const { affix, value } of this.affixes) {
      player[affix.stat] = (player[affix.stat] ?? 0) - value;
      if (affix.stat === 'bonusHp') {
        player.maxHp -= value;
        player.hp = Math.min(player.hp, player.maxHp);
      }
    }
  }
}
