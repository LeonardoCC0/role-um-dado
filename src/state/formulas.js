// Centralized Game Calculations and Formulas

export const DICE_TIERS = [
  { id: 'wood', name: 'Dado de Madeira', multiplier: 1, baseCost: 0, color: '#b58863', pipColor: '#4a2e18', icon: '🪵' },
  { id: 'bronze', name: 'Dado de Bronze', multiplier: 2.5, baseCost: 250, color: '#cd7f32', pipColor: '#3a200a', icon: '🥉' },
  { id: 'iron', name: 'Dado de Ferro', multiplier: 6, baseCost: 1500, color: '#a19d94', pipColor: '#2b2a28', icon: '⚙️' },
  { id: 'silver', name: 'Dado de Prata', multiplier: 15, baseCost: 8000, color: '#e0e6ed', pipColor: '#1e293b', icon: '🥈' },
  { id: 'gold', name: 'Dado de Ouro', multiplier: 40, baseCost: 45000, color: '#fbbf24', pipColor: '#78350f', icon: '🥇' },
  { id: 'diamond', name: 'Dado de Diamante', multiplier: 120, baseCost: 250000, color: '#38bdf8', pipColor: '#0369a1', icon: '💎' },
  { id: 'emerald', name: 'Dado de Esmeralda', multiplier: 400, baseCost: 1500000, color: '#22c55e', pipColor: '#14532d', icon: '🟢' },
  { id: 'ruby', name: 'Dado de Rubi', multiplier: 1500, baseCost: 10000000, color: '#ef4444', pipColor: '#7f1d1d', icon: '🔴' },
  { id: 'obsidian', name: 'Dado de Obsidiana', multiplier: 5000, baseCost: 75000000, color: '#312e81', pipColor: '#c084fc', icon: '🟣' },
  { id: 'stardust', name: 'Dado Estelar', multiplier: 20000, baseCost: 500000000, color: '#818cf8', pipColor: '#ffffff', icon: '✨', stardustBonus: 1 },
  { id: 'cosmic', name: 'Dado Cósmico', multiplier: 100000, baseCost: 5000000000, color: '#1e1b4b', pipColor: '#f43f5e', icon: '🌌', darkMatterBonus: 1 },
];

export const COMMON_UPGRADE_CONFIG = {
  helperHands: {
    name: 'Mão Ajudante',
    desc: 'Adiciona mãos que empurram e rolam dados automaticamente.',
    baseCost: 100,
    costMult: 2.2,
    maxLevel: 10,
    unit: 'Mãos',
    icon: '🖐️'
  },
  rollPower: {
    name: 'Impulso de Rolagem',
    desc: 'Aumenta a força e a velocidade com que os dados são jogados.',
    baseCost: 50,
    costMult: 1.35,
    maxLevel: 50,
    unit: 'Nível',
    icon: '⚡'
  },
  coinMultiplier: {
    name: 'Multiplicador de Moedas',
    desc: 'Multiplica todos os ganhos de moedas das rolagens (+15% por nível).',
    baseCost: 75,
    costMult: 1.4,
    maxLevel: 100,
    unit: 'x',
    icon: '💰'
  },
  rollFrequency: {
    name: 'Velocidade de Automação',
    desc: 'Reduz o intervalo entre rolagens automáticas das mãos.',
    baseCost: 200,
    costMult: 1.5,
    maxLevel: 25,
    unit: 's',
    icon: '⏱️'
  },
  critChance: {
    name: 'Chance Crítica',
    desc: 'Chance de uma rolagem ser crítica e multiplicar o valor por 5x (+1% por nível).',
    baseCost: 300,
    costMult: 1.6,
    maxLevel: 20,
    unit: '%',
    icon: '🎯'
  },
  trayMagnetism: {
    name: 'Gravidade Central',
    desc: 'Atrai os dados suavemente para o centro da mesa para colidirem mais.',
    baseCost: 150,
    costMult: 1.45,
    maxLevel: 15,
    unit: 'G',
    icon: '🧲'
  },
  cursorArea: {
    name: 'Área do Cursor',
    desc: 'Expande o raio de alcance magnético em volta do mouse para rolar múltiplos dados de longe (+8px por nível).',
    baseCost: 80,
    costMult: 1.35,
    maxLevel: 25,
    unit: 'px',
    icon: '⭕'
  }
};

export class Formulas {
  // Calculate total coin income from a single die landing on a given face
  static calculateDiceIncome(face, dieTierIndex, state, isCrit = false) {
    const tier = DICE_TIERS[dieTierIndex] || DICE_TIERS[0];
    let base = face * 10; // Base: 10 per pip

    // Tier Multiplier
    base *= tier.multiplier;

    // Common Upgrades Multiplier
    const coinUpLvl = state.commonUpgrades?.coinMultiplier || 0;
    const commonMult = 1 + coinUpLvl * 0.15;
    base *= commonMult;

    // Skill Tree Bonuses
    const tree = state.skillTree || {};
    
    // Golden Faces: +50% base coin value per level
    if (tree['tree_golden_faces']) {
      base *= (1 + tree['tree_golden_faces'] * 0.5);
    }

    // Lucky Six: 6 rolls grant 3x value
    if (face === 6 && tree['tree_lucky_six']) {
      base *= (2 + tree['tree_lucky_six']); // Lv 1 = 3x, Lv 2 = 4x
    }

    // Dice Synergy: +15% per additional active die
    const activeDiceCount = state.activeDice?.length || 1;
    if (tree['tree_dice_synergy'] && activeDiceCount > 1) {
      base *= (1 + (activeDiceCount - 1) * 0.15 * tree['tree_dice_synergy']);
    }

    // Trickle Down: Higher tier dice boost lower tiers
    if (tree['tree_trickle_down'] && dieTierIndex > 0) {
      base *= (1 + dieTierIndex * 0.25 * tree['tree_trickle_down']);
    }

    // Stellar Resonance: +2% per 10 Stardust held
    if (tree['tree_stellar_resonance']) {
      const stardustBonus = Math.min(10, Math.floor(state.stardust / 10) * 0.02 * tree['tree_stellar_resonance']);
      base *= (1 + stardustBonus);
    }

    // Exponential Fortune: +10% per total dice owned
    if (tree['tree_exponential_fortune']) {
      const totalOwned = state.inventory?.length || activeDiceCount;
      base *= (1 + totalOwned * 0.1 * tree['tree_exponential_fortune']);
    }

    // Rebirth Multiplier
    const rebirths = state.rebirths || 0;
    const surgeMultiplier = tree['tree_rebirth_surge'] ? 2.0 : 1.0;
    const rebirthMult = 1 + (rebirths * surgeMultiplier);
    base *= rebirthMult;

    // Critical Hit
    if (isCrit) {
      const critMultiplier = tree['tree_crit_master'] ? 10 : 5;
      base *= critMultiplier;
    }

    // Combo streak multiplier
    const combo = state.comboMultiplier || 1;
    base *= combo;

    return Math.round(base);
  }

  // Calculate Stardust chance and amount
  static checkStardustDrop(face, dieTierIndex, state) {
    const tier = DICE_TIERS[dieTierIndex] || DICE_TIERS[0];
    const tree = state.skillTree || {};

    // Stardust Die always drops 1 Stardust
    if (tier.stardustBonus) {
      return { dropped: true, amount: tier.stardustBonus };
    }

    // Stardust Genesis must be unlocked to drop Stardust from normal dice
    if (!tree['tree_stardust_genesis']) {
      return { dropped: false, amount: 0 };
    }

    // Only roll of 6 drops Stardust
    if (face !== 6) {
      return { dropped: false, amount: 0 };
    }

    let chance = 0.05 * tree['tree_stardust_genesis']; // 5% per level

    if (tree['tree_stardust_harvester']) {
      chance += 0.07 * tree['tree_stardust_harvester']; // +7%
    }

    if (tree['tree_eternal_wisdom'] && state.rebirths > 0) {
      chance *= 1.5;
    }

    if (Math.random() < chance) {
      const amount = 1 + (tree['tree_stardust_harvester'] || 0);
      return { dropped: true, amount };
    }

    return { dropped: false, amount: 0 };
  }

  // Check Dark Matter drop
  static checkDarkMatterDrop(face, dieTierIndex, state, isCrit) {
    const tier = DICE_TIERS[dieTierIndex] || DICE_TIERS[0];
    const tree = state.skillTree || {};

    if (tier.darkMatterBonus) {
      return { dropped: true, amount: tier.darkMatterBonus };
    }

    if (!tree['tree_cosmic_catalyst']) {
      return { dropped: false, amount: 0 };
    }

    // Drop Dark Matter on critical rolls or 6 with Cosmic Catalyst
    if (face === 6 && isCrit && Math.random() < 0.15) {
      return { dropped: true, amount: 1 };
    }

    return { dropped: false, amount: 0 };
  }

  // Check if roll is critical
  static checkCritical(state) {
    let chance = (state.commonUpgrades?.critChance || 0) * 0.01;
    const tree = state.skillTree || {};
    if (tree['tree_critical_rolls']) {
      chance += 0.05 * tree['tree_critical_rolls'];
    }
    return Math.random() < chance;
  }

  // Calculate Rebirth requirements
  static getRebirthRequirements(state) {
    const rebirths = state.rebirths || 0;
    const tree = state.skillTree || {};
    const catalystReduction = tree['tree_rebirth_catalyst'] ? 0.75 : 1.0;

    // Scale exponentially: 100k, 350k, 1.2M, 4.2M...
    const baseCoins = 100000;
    const coinsNeeded = Math.round(baseCoins * Math.pow(3.5, rebirths) * catalystReduction);
    const diceNeeded = Math.min(10, 2 + Math.floor(rebirths * 0.5));

    const currentCoins = state.coins || 0;
    const currentDice = state.activeDice?.length || 0;

    const coinsMet = currentCoins >= coinsNeeded;
    const diceMet = currentDice >= diceNeeded;
    const canRebirth = coinsMet && diceMet;

    return {
      coinsNeeded,
      diceNeeded,
      currentCoins,
      currentDice,
      coinsMet,
      diceMet,
      canRebirth,
      coinsProgress: Math.min(1, currentCoins / coinsNeeded),
      diceProgress: Math.min(1, currentDice / diceNeeded)
    };
  }

  // Calculate Rebirth rewards
  static getRebirthRewards(state) {
    const nextRebirth = (state.rebirths || 0) + 1;
    const tree = state.skillTree || {};
    const surge = tree['tree_rebirth_surge'] ? 2.0 : 1.0;
    const nextMultiplier = 1 + (nextRebirth * surge);
    const currentMultiplier = 1 + ((state.rebirths || 0) * surge);
    const stardustReward = 15 + nextRebirth * 10;
    const gemsReward = 5 + nextRebirth * 2;

    return {
      nextRebirth,
      currentMultiplier,
      nextMultiplier,
      multiplierGain: surge,
      stardustReward,
      gemsReward
    };
  }

  // Helper for common upgrades cost
  static getCommonUpgradeCost(key, currentLevel, count = 1) {
    const config = COMMON_UPGRADE_CONFIG[key];
    if (!config) return 0;

    let totalCost = 0;
    for (let i = 0; i < count; i++) {
      const lvl = currentLevel + i;
      if (lvl >= config.maxLevel) break;
      totalCost += Math.round(config.baseCost * Math.pow(config.costMult, lvl));
    }
    return totalCost;
  }

  // Calculate max affordable levels for common upgrade
  static getMaxAffordableCommon(key, currentLevel, coins) {
    const config = COMMON_UPGRADE_CONFIG[key];
    if (!config) return { count: 0, cost: 0 };

    let totalCost = 0;
    let count = 0;
    let lvl = currentLevel;

    while (lvl < config.maxLevel) {
      const nextCost = Math.round(config.baseCost * Math.pow(config.costMult, lvl));
      if (totalCost + nextCost > coins) break;
      totalCost += nextCost;
      count++;
      lvl++;
    }

    return { count, cost: totalCost };
  }

  // Number formatting (e.g. 1.25M, 3.4B)
  static formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num < 1000) return Math.floor(num).toLocaleString('pt-BR');

    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const i = Math.floor(Math.log10(Math.max(1, num)) / 3);
    if (i >= suffixes.length) return num.toExponential(2);

    const formatted = (num / Math.pow(10, i * 3)).toFixed(i === 0 ? 0 : 2);
    return `${formatted} ${suffixes[i]}`;
  }

  // Calculate dynamic mouse interaction aura radius
  static getCursorRadius(state) {
    let baseRadius = 38; // Initial baseline radius
    const upgradeLvl = state.commonUpgrades?.cursorArea || 0;
    baseRadius += upgradeLvl * 8; // +8px per common upgrade level

    const tree = state.skillTree || {};
    let multiplier = 1.0;
    if (tree['tree_cursor_aura']) {
      multiplier += tree['tree_cursor_aura'] * 0.25; // +25% per level in skill tree
    }
    if (tree['tree_gravitational_reach']) {
      multiplier += tree['tree_gravitational_reach'] * 0.40; // +40% per level in skill tree
    }

    return baseRadius * multiplier;
  }
}
