// Dice Shop and Active Dice Management
import { DICE_TIERS, Formulas } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

export class ShopUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;
    this.render();
  }

  render() {
    const maxDice = this.gameState.getMaxActiveDice();
    const activeCount = this.gameState.activeDice.length;

    // Active dice list
    let activeDiceHtml = '';
    this.gameState.activeDice.forEach((d, idx) => {
      const tier = DICE_TIERS[d.tierIndex] || DICE_TIERS[0];
      activeDiceHtml += `
        <div class="active-die-pill" style="border-left: 4px solid ${tier.color};">
          <span class="die-icon">${tier.icon}</span>
          <span class="die-name">${tier.name}</span>
          <span class="die-mult">${tier.multiplier}x</span>
          ${activeCount > 1 ? `<button class="die-remove-btn" data-index="${idx}" title="Guardar dado">×</button>` : ''}
        </div>
      `;
    });

    // Catalog of dice
    let catalogHtml = '';
    DICE_TIERS.forEach((tier, index) => {
      const canAfford = this.gameState.canAfford('coins', tier.baseCost);
      const isCapacityFull = activeCount >= maxDice;
      const hasBonus = tier.stardustBonus ? `+${tier.stardustBonus} ✨ Stardust por rolagem` : (tier.darkMatterBonus ? `+${tier.darkMatterBonus} 🌌 Matéria Escura` : null);

      catalogHtml += `
        <div class="dice-catalog-card" style="border-top: 3px solid ${tier.color};">
          <div class="card-top">
            <span class="catalog-icon">${tier.icon}</span>
            <div class="catalog-details">
              <div class="catalog-title">${tier.name}</div>
              <div class="catalog-mult">Multiplicador: <b>${tier.multiplier}x</b></div>
              ${hasBonus ? `<div class="catalog-bonus-badge">${hasBonus}</div>` : ''}
            </div>
          </div>
          <div class="card-bottom">
            <div class="catalog-cost">$${Formulas.formatNumber(tier.baseCost)}</div>
            <button class="catalog-buy-btn ${isCapacityFull ? 'btn-full' : (canAfford ? 'btn-afford' : 'btn-cant-afford')}" 
                    data-tier="${index}" 
                    ${isCapacityFull || !canAfford ? 'disabled' : ''}>
              ${isCapacityFull ? 'Mesa Cheia' : (canAfford ? 'Comprar Dado' : 'Moedas Insuficientes')}
            </button>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="shop-view-wrapper">
        <div class="shop-header">
          <h2>Loja de Dados & Tabuleiro</h2>
          <div class="tray-capacity-badge">
            🎲 Capacidade do Tabuleiro: <b>${activeCount} / ${maxDice}</b> dados ativos
          </div>
        </div>

        <div class="active-dice-section">
          <h3>Dados Ativos no Tabuleiro</h3>
          <div class="active-dice-row">
            ${activeDiceHtml}
          </div>
        </div>

        <div class="catalog-section">
          <h3>Catálogo de Dados</h3>
          <div class="dice-catalog-grid">
            ${catalogHtml}
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    // Buy buttons
    this.container.querySelectorAll('.catalog-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tierIndex = parseInt(btn.dataset.tier, 10);
        if (!isNaN(tierIndex)) {
          this.gameState.buyDie(tierIndex);
          this.render();
        }
      });
    });

    // Remove buttons
    this.container.querySelectorAll('.die-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (!isNaN(idx)) {
          sounds.playClick();
          this.gameState.removeDie(idx);
          this.render();
        }
      });
    });
  }
}
