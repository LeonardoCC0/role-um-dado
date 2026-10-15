// Main Game Controller using 2D Tabletop with Mouse Swipe / Hover Mechanics
import { gameState } from './state/gameState.js';
import { Formulas } from './state/formulas.js';
import { sounds } from './audio/soundEngine.js';

import { Board2D } from './engine/board2D.js';

import { ShopUI } from './systems/shopUI.js';
import { UpgradesUI } from './systems/upgradesUI.js';
import { SkillTreeUI } from './systems/skillTreeUI.js';
import { RebirthUI } from './systems/rebirthUI.js';
import { StatsAchievementsUI } from './systems/statsAchievementsUI.js';
import { CodesSettingsUI } from './systems/codesSettingsUI.js';

class RollADiceGame {
  constructor() {
    this.currentTab = 'game';
    this.currentUIInstance = null;
    this.lastTime = performance.now();

    this.autoRollTimer = 0;
    this.kineticPulseTimer = 0;

    this.initDOM();
    this.initEngines();
    this.initTabs();
    this.initHUD();
    this.initControls();
    this.startLoop();
  }

  initDOM() {
    this.sceneContainer = document.getElementById('scene-container');
    this.tabOverlay = document.getElementById('tab-overlay');
    this.tableControls = document.getElementById('table-controls');
    this.btnRollAll = document.getElementById('btn-roll-all');
    this.btnAutoRoll = document.getElementById('btn-auto-roll');
    this.autoRollStatus = document.getElementById('auto-roll-status');

    // HUD Elements
    this.hudCoins = document.getElementById('hud-coins');
    this.hudStardust = document.getElementById('hud-stardust');
    this.hudGems = document.getElementById('hud-gems');
    this.hudRebirth = document.getElementById('hud-rebirth');
    this.hudDarkMatter = document.getElementById('hud-darkmatter');
  }

  initEngines() {
    this.board2D = new Board2D(this.sceneContainer, gameState);

    // Subscribe to state changes (dice added/removed, upgrades, rebirths)
    gameState.subscribe(() => {
      this.updateHUD();
      this.board2D.syncWithState();
      if (this.currentUIInstance && typeof this.currentUIInstance.render === 'function') {
        this.currentUIInstance.render();
      }
    });
  }

  initHUD() {
    this.updateHUD();
  }

  updateHUD() {
    const rewards = Formulas.getRebirthRewards(gameState);

    this.hudCoins.querySelector('.val').textContent = `$${Formulas.formatNumber(gameState.coins)}`;
    this.hudStardust.querySelector('.val').textContent = `${gameState.stardust.toLocaleString('pt-BR')}`;
    this.hudGems.querySelector('.val').textContent = `${gameState.gems.toLocaleString('pt-BR')}`;
    this.hudRebirth.querySelector('.val').textContent = `Rebirth ${gameState.rebirths} (${rewards.currentMultiplier.toFixed(1)}x)`;

    // Show Dark Matter if unlocked or > 0
    if (gameState.darkMatter > 0 || gameState.skillTree['tree_cosmic_catalyst']) {
      this.hudDarkMatter.style.display = 'flex';
      this.hudDarkMatter.querySelector('.val').textContent = `${gameState.darkMatter.toLocaleString('pt-BR')}`;
    } else {
      this.hudDarkMatter.style.display = 'none';
    }
  }

  initTabs() {
    const navButtons = document.querySelectorAll('.tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        sounds.playClick();
        this.switchTab(tab);
      });
    });
  }

  switchTab(tab) {
    if (this.currentTab === tab) return;
    this.currentTab = tab;

    // Update nav buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'game') {
      this.tabOverlay.style.display = 'none';
      this.tableControls.style.display = 'flex';
      this.tabOverlay.className = 'tab-view-overlay';
      this.currentUIInstance = null;
      this.board2D.updateArenaBounds();
      return;
    }

    // Switch to overlay tab while 2D canvas simulation keeps running in background
    this.tableControls.style.display = 'none';
    this.tabOverlay.style.display = 'block';

    if (tab === 'tree') {
      this.tabOverlay.className = 'tab-view-overlay tree-overlay-full';
      this.currentUIInstance = new SkillTreeUI(this.tabOverlay, gameState);
    } else {
      this.tabOverlay.className = 'tab-view-overlay';
      if (tab === 'shop') {
        this.currentUIInstance = new ShopUI(this.tabOverlay, gameState);
      } else if (tab === 'upgrades') {
        this.currentUIInstance = new UpgradesUI(this.tabOverlay, gameState);
      } else if (tab === 'rebirth') {
        this.currentUIInstance = new RebirthUI(this.tabOverlay, gameState);
      } else if (tab === 'stats') {
        this.currentUIInstance = new StatsAchievementsUI(this.tabOverlay, gameState);
      } else if (tab === 'settings') {
        this.currentUIInstance = new CodesSettingsUI(this.tabOverlay, gameState);
      }
    }
  }

  initControls() {
    // Button to roll/spin all dice
    this.btnRollAll.addEventListener('click', () => {
      this.board2D.rollAll(1.2);
    });

    // Space key: gentle table flick (doesn't send dice flying to the sky!)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
        e.preventDefault();
        this.board2D.rollAll(1.0);
      }
    });

    // Auto-roll toggle
    this.btnAutoRoll.addEventListener('click', () => {
      sounds.playClick();
      gameState.settings.autoRoll = !gameState.settings.autoRoll;
      this.updateAutoRollBtn();
      gameState.save();
    });
    this.updateAutoRollBtn();
  }

  updateAutoRollBtn() {
    const isAuto = !!gameState.settings.autoRoll;
    this.btnAutoRoll.classList.toggle('active', isAuto);
    this.autoRollStatus.textContent = `Auto-Roll: ${isAuto ? 'LIGADO' : 'DESLIGADO'}`;
  }

  startLoop() {
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      // Auto-roll timer
      if (gameState.settings.autoRoll) {
        this.autoRollTimer += dt;
        if (this.autoRollTimer >= (gameState.settings.autoRollInterval || 4)) {
          this.autoRollTimer = 0;
          this.board2D.rollAll(1.0);
        }
      }

      // Kinetic pulse skill (tree_master_autoroll)
      if (gameState.skillTree['tree_master_autoroll']) {
        this.kineticPulseTimer += dt;
        if (this.kineticPulseTimer >= 10) {
          this.kineticPulseTimer = 0;
          this.board2D.rollAll(1.6);
        }
      }

      // Update and render 2D Board
      this.board2D.update(dt);
      this.board2D.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Start game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new RollADiceGame();
});
