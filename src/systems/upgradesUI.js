// Common Upgrades purchased with Coins (with 1x, 5x, 10x, MAX & Shift key support)
import { COMMON_UPGRADE_CONFIG, Formulas } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

export class UpgradesUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;
    this.buyMultiplier = 1; // 1, 5, 10, or 'max'
    this.shiftPressed = false;

    this.setupShiftListener();
    this.render();
  }

  setupShiftListener() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift' && !this.shiftPressed) {
        this.shiftPressed = true;
        this.render();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift' && this.shiftPressed) {
        this.shiftPressed = false;
        this.render();
      }
    });
  }

  getActiveBuyMultiplier() {
    return this.shiftPressed ? 'max' : this.buyMultiplier;
  }

  render() {
    const activeMultiplier = this.getActiveBuyMultiplier();

    let cardsHtml = '';
    for (const [key, config] of Object.entries(COMMON_UPGRADE_CONFIG)) {
      const currentLvl = this.gameState.commonUpgrades[key] || 0;
      const isMaxed = currentLvl >= config.maxLevel;

      let countToBuy = activeMultiplier;
      let cost = 0;
      let actualCount = 0;

      if (!isMaxed) {
        if (activeMultiplier === 'max') {
          const aff = Formulas.getMaxAffordableCommon(key, currentLvl, this.gameState.coins);
          actualCount = Math.max(1, aff.count);
          cost = aff.count > 0 ? aff.cost : Formulas.getCommonUpgradeCost(key, currentLvl, 1);
        } else {
          actualCount = Math.min(activeMultiplier, config.maxLevel - currentLvl);
          cost = Formulas.getCommonUpgradeCost(key, currentLvl, actualCount);
        }
      }

      const canAfford = this.gameState.canAfford('coins', cost);

      cardsHtml += `
        <div class="upgrade-card ${isMaxed ? 'card-maxed' : ''}">
          <div class="upgrade-card-header">
            <span class="upgrade-icon">${config.icon}</span>
            <div class="upgrade-titles">
              <div class="upgrade-name">${config.name}</div>
              <div class="upgrade-level">Nível: <b>${currentLvl}</b> / ${config.maxLevel}</div>
            </div>
          </div>
          <div class="upgrade-desc">${config.desc}</div>
          <div class="upgrade-card-footer">
            <div class="upgrade-cost">
              ${isMaxed ? '<span class="max-badge">MÁXIMO</span>' : `Custo (+${actualCount}): <b>$${Formulas.formatNumber(cost)}</b>`}
            </div>
            <button class="upgrade-buy-btn ${isMaxed ? 'btn-max' : (canAfford ? 'btn-can-buy' : 'btn-cant-buy')}"
                    data-key="${key}"
                    data-count="${activeMultiplier === 'max' ? 'max' : actualCount}"
                    ${isMaxed || !canAfford ? 'disabled' : ''}>
              ${isMaxed ? 'Maximizada' : `Comprar +${actualCount}`}
            </button>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="upgrades-view-wrapper">
        <div class="upgrades-top-bar">
          <div>
            <h2>Melhorias Comuns (Moedas)</h2>
            <p>Compre melhorias com suas moedas para acelerar a rolagem dos dados.</p>
          </div>
          <div class="multiplier-selector">
            <span class="mult-label">Comprar:</span>
            <button class="mult-btn ${activeMultiplier === 1 ? 'active' : ''}" data-mult="1">1x</button>
            <button class="mult-btn ${activeMultiplier === 5 ? 'active' : ''}" data-mult="5">5x</button>
            <button class="mult-btn ${activeMultiplier === 10 ? 'active' : ''}" data-mult="10">10x</button>
            <button class="mult-btn ${activeMultiplier === 'max' ? 'active' : ''}" data-mult="max">MÁX ${this.shiftPressed ? '(SHIFT)' : ''}</button>
          </div>
        </div>

        <div class="upgrades-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    // Multiplier buttons
    this.container.querySelectorAll('.mult-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        const m = btn.dataset.mult;
        this.buyMultiplier = m === 'max' ? 'max' : parseInt(m, 10);
        this.render();
      });
    });

    // Buy buttons
    this.container.querySelectorAll('.upgrade-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const count = btn.dataset.count === 'max' ? 'max' : parseInt(btn.dataset.count, 10);
        if (key) {
          this.gameState.buyCommonUpgrade(key, count);
          this.render();
        }
      });
    });
  }
}
