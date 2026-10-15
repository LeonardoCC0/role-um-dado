// Unified Reactive Game State & Persistence Engine
import { Formulas, DICE_TIERS, COMMON_UPGRADE_CONFIG } from './formulas.js';
import { SKILL_TREE_NODES } from '../systems/treeData.js';
import { sounds } from '../audio/soundEngine.js';

const SAVE_KEY = 'roll_a_dice_save_v2';

export class GameState {
  constructor() {
    this.listeners = new Set();
    this.initDefaultState();
    this.load();
    this.setupAutoSave();
  }

  initDefaultState() {
    this.coins = 0;
    this.stardust = 3; // Give 3 starter Stardust so player can explore the Skill Tree immediately
    this.gems = 0;
    this.darkMatter = 0;
    this.rebirths = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;

    // Active dice on board
    this.activeDice = [
      { id: 'die_' + Date.now(), tierIndex: 0 } // 1 Wood die
    ];
    this.inventory = [0]; // Tier indices owned

    // Common Upgrades
    this.commonUpgrades = {
      helperHands: 0,
      rollPower: 0,
      coinMultiplier: 0,
      rollFrequency: 0,
      critChance: 0,
      trayMagnetism: 0
    };

    // Skill Tree progress { [nodeId]: level }
    this.skillTree = {
      tree_origin: 1 // Origin unlocked by default
    };

    // Stats
    this.stats = {
      totalRolls: 0,
      totalCoinsEarned: 0,
      totalStardustEarned: 0,
      totalGemsEarned: 0,
      totalDarkMatterEarned: 0,
      highestRollIncome: 0,
      criticalRollsCount: 0,
      playTimeSeconds: 0
    };

    // Redeemed codes
    this.redeemedCodes = [];

    // Achievements unlocked
    this.achievements = {};

    // Settings
    this.settings = {
      soundMuted: false,
      soundVolume: 0.5,
      autoRoll: false,
      autoRollInterval: 4,
      graphicsQuality: 'high'
    };
  }

  // Reactive subscription
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      try {
        cb(this);
      } catch (err) {
        console.error("State listener error:", err);
      }
    }
  }

  // Currency manipulation
  addCoins(amount) {
    if (amount <= 0) return;
    this.coins += amount;
    this.stats.totalCoinsEarned += amount;
    if (amount > this.stats.highestRollIncome) {
      this.stats.highestRollIncome = amount;
    }
    this.notify();
  }

  addStardust(amount) {
    if (amount <= 0) return;
    this.stardust += amount;
    this.stats.totalStardustEarned += amount;
    sounds.playStardust();
    this.notify();
  }

  addGems(amount) {
    if (amount <= 0) return;
    this.gems += amount;
    this.stats.totalGemsEarned += amount;
    this.notify();
  }

  addDarkMatter(amount) {
    if (amount <= 0) return;
    this.darkMatter += amount;
    this.stats.totalDarkMatterEarned += amount;
    this.notify();
  }

  canAfford(resource, amount) {
    if (resource === 'coins') return this.coins >= amount;
    if (resource === 'stardust') return this.stardust >= amount;
    if (resource === 'gems') return this.gems >= amount;
    if (resource === 'darkMatter') return this.darkMatter >= amount;
    return false;
  }

  spendResource(resource, amount) {
    if (!this.canAfford(resource, amount)) return false;
    if (resource === 'coins') this.coins -= amount;
    if (resource === 'stardust') this.stardust -= amount;
    if (resource === 'gems') this.gems -= amount;
    if (resource === 'darkMatter') this.darkMatter -= amount;
    this.notify();
    return true;
  }

  // Maximum allowed active dice
  getMaxActiveDice() {
    let max = 5; // Base limit
    if (this.skillTree['tree_extra_slot_1']) max += 2;
    if (this.skillTree['tree_extra_slot_2']) max += 3;
    return max;
  }

  // Buy common upgrade
  buyCommonUpgrade(key, count = 1) {
    const config = COMMON_UPGRADE_CONFIG[key];
    if (!config) return false;

    const currentLvl = this.commonUpgrades[key] || 0;
    if (currentLvl >= config.maxLevel) return false;

    let targetCount = count;
    if (count === 'max') {
      const afford = Formulas.getMaxAffordableCommon(key, currentLvl, this.coins);
      targetCount = afford.count;
    }

    if (targetCount <= 0) return false;

    const cost = Formulas.getCommonUpgradeCost(key, currentLvl, targetCount);
    if (!this.spendResource('coins', cost)) return false;

    this.commonUpgrades[key] = currentLvl + targetCount;
    sounds.playPurchase();
    this.notify();
    this.save();
    return true;
  }

  // Buy skill tree node
  buySkillTreeNode(nodeId) {
    const node = SKILL_TREE_NODES[nodeId];
    if (!node) return { success: false, reason: 'Nó inexistente' };

    const currentLvl = this.skillTree[nodeId] || 0;
    if (currentLvl >= node.maxLevel) {
      return { success: false, reason: 'Nível máximo atingido' };
    }

    // Check prerequisites
    for (const reqId of node.reqs) {
      if (!this.skillTree[reqId] || this.skillTree[reqId] <= 0) {
        return { success: false, reason: 'Requisitos prévios não atendidos' };
      }
    }

    // Check cost
    const cost = node.costs[currentLvl];
    const resource = node.costResource || 'stardust';
    if (!this.canAfford(resource, cost)) {
      return { success: false, reason: `Saldo insuficiente de ${resource === 'darkMatter' ? 'Matéria Escura' : 'Stardust'}` };
    }

    // Purchase
    this.spendResource(resource, cost);
    this.skillTree[nodeId] = currentLvl + 1;
    sounds.playPurchase();
    this.notify();
    this.save();
    return { success: true };
  }

  // Buy a new die
  buyDie(tierIndex) {
    const tier = DICE_TIERS[tierIndex];
    if (!tier) return false;

    const maxDice = this.getMaxActiveDice();
    if (this.activeDice.length >= maxDice) return false;

    const cost = tier.baseCost;
    if (!this.spendResource('coins', cost)) return false;

    this.activeDice.push({
      id: 'die_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      tierIndex
    });
    if (!this.inventory.includes(tierIndex)) {
      this.inventory.push(tierIndex);
    }

    sounds.playPurchase();
    this.notify();
    this.save();
    return true;
  }

  // Remove an active die
  removeDie(index) {
    if (this.activeDice.length <= 1) return false; // Must keep at least 1 die
    if (index >= 0 && index < this.activeDice.length) {
      this.activeDice.splice(index, 1);
      this.notify();
      this.save();
      return true;
    }
    return false;
  }

  // ATOMIC REBIRTH TRANSACTION
  performRebirth() {
    const reqs = Formulas.getRebirthRequirements(this);
    if (!reqs.canRebirth) {
      return { success: false, reason: 'Requisitos não cumpridos' };
    }

    const rewards = Formulas.getRebirthRewards(this);

    // Calculate Legacy Retention for Common Upgrades
    const retentionLevel = this.skillTree['tree_legacy_retention'] || 0;
    const retentionRate = retentionLevel * 0.3; // 30%, 60%, 90%

    const newCommonUpgrades = {};
    for (const key of Object.keys(COMMON_UPGRADE_CONFIG)) {
      const current = this.commonUpgrades[key] || 0;
      newCommonUpgrades[key] = Math.floor(current * retentionRate);
    }

    // Check Golden Start
    const hasGoldenStart = !!this.skillTree['tree_golden_start'];
    const startingCoins = hasGoldenStart ? 10000 : 0;
    const startingDice = hasGoldenStart
      ? [
          { id: 'die_' + Date.now() + '_1', tierIndex: 1 }, // Bronze
          { id: 'die_' + Date.now() + '_2', tierIndex: 1 }  // Bronze
        ]
      : [
          { id: 'die_' + Date.now() + '_1', tierIndex: 0 }  // Wood
        ];

    // Atomic execution
    this.rebirths += 1;
    this.coins = startingCoins;
    this.activeDice = startingDice;
    this.commonUpgrades = newCommonUpgrades;
    this.comboMultiplier = 1;

    // Grant Rebirth Rewards
    this.stardust += rewards.stardustReward;
    this.stats.totalStardustEarned += rewards.stardustReward;
    this.gems += rewards.gemsReward;
    this.stats.totalGemsEarned += rewards.gemsReward;

    sounds.playRebirth();
    this.notify();
    this.save();

    return {
      success: true,
      rebirths: this.rebirths,
      rewards
    };
  }

  // Redeem code
  redeemCode(codeRaw) {
    const code = (codeRaw || '').trim().toLowerCase();
    if (this.redeemedCodes.includes(code)) {
      return { success: false, message: 'Código já resgatado!' };
    }

    if (code === 'release') {
      this.addCoins(6000);
      this.redeemedCodes.push(code);
      this.save();
      return { success: true, message: 'Código resgatado: +6.000 Moedas!' };
    }
    if (code === 'rolladice') {
      this.addCoins(4000);
      this.addStardust(5);
      this.redeemedCodes.push(code);
      this.save();
      return { success: true, message: 'Código resgatado: +4.000 Moedas e +5 Stardust ✨!' };
    }
    if (code === 'stardust') {
      this.addStardust(15);
      this.redeemedCodes.push(code);
      this.save();
      return { success: true, message: 'Código resgatado: +15 Stardust ✨!' };
    }
    if (code === 'gems') {
      this.addGems(10);
      this.redeemedCodes.push(code);
      this.save();
      return { success: true, message: 'Código resgatado: +10 Gemas 💎!' };
    }

    return { success: false, message: 'Código inválido ou expirado.' };
  }

  // Persistence
  save() {
    try {
      const data = {
        coins: this.coins,
        stardust: this.stardust,
        gems: this.gems,
        darkMatter: this.darkMatter,
        rebirths: this.rebirths,
        activeDice: this.activeDice,
        inventory: this.inventory,
        commonUpgrades: this.commonUpgrades,
        skillTree: this.skillTree,
        stats: this.stats,
        redeemedCodes: this.redeemedCodes,
        achievements: this.achievements,
        settings: this.settings
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save game to localStorage", e);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data) {
        this.coins = Number(data.coins) || 0;
        this.stardust = Number(data.stardust) || 0;
        this.gems = Number(data.gems) || 0;
        this.darkMatter = Number(data.darkMatter) || 0;
        this.rebirths = Number(data.rebirths) || 0;
        if (Array.isArray(data.activeDice) && data.activeDice.length > 0) {
          this.activeDice = data.activeDice;
        }
        if (Array.isArray(data.inventory)) {
          this.inventory = data.inventory;
        }
        if (data.commonUpgrades) {
          this.commonUpgrades = { ...this.commonUpgrades, ...data.commonUpgrades };
        }
        if (data.skillTree) {
          this.skillTree = { ...this.skillTree, ...data.skillTree };
        }
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }
        if (Array.isArray(data.redeemedCodes)) {
          this.redeemedCodes = data.redeemedCodes;
        }
        if (data.achievements) {
          this.achievements = data.achievements;
        }
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
          sounds.setMuted(this.settings.soundMuted);
          sounds.setVolume(this.settings.soundVolume);
        }
      }
    } catch (e) {
      console.error("Failed to load game save", e);
    }
  }

  setupAutoSave() {
    setInterval(() => {
      this.stats.playTimeSeconds += 5;
      this.save();
    }, 5000);
  }

  resetAll() {
    localStorage.removeItem(SAVE_KEY);
    this.initDefaultState();
    this.notify();
    sounds.playClick();
  }
}

export const gameState = new GameState();
