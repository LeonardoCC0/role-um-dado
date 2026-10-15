// Dice Shop and Active Dice Management (Supports up to 50 of each die type on table)
import { DICE_TIERS, Formulas } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

export class ShopUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;
    this.render();
  }

  render() {
    const activeCount = this.gameState.activeDice.length;
    const maxPerType = this.gameState.getMaxDicePerType(0);

    // Group active dice by tier for a super clean, responsive overview
    const activeByTier = {};
    this.gameState.activeDice.forEach(d => {
      activeByTier[d.tierIndex] = (activeByTier[d.tierIndex] || 0) + 1;
    });

    let activeDiceHtml = '';
    DICE_TIERS.forEach((tier, tierIdx) => {
      const count = activeByTier[tierIdx] || 0;
      if (count > 0) {
        activeDiceHtml += `
          <div class="active-die-group-card" style="border-left: 4px solid ${tier.color};">
            <div class="group-die-info">
              <span class="die-icon">${tier.icon}</span>
              <div class="die-info-texts">
                <span class="die-name">${tier.name}</span>
                <span class="die-stats-sub">${tier.multiplier}x Moedas | ✨ +${tier.stardustBonus || 1} Estrelas</span>
              </div>
            </div>
            <div class="group-die-count-badge">x${count} na mesa</div>
            <div class="group-die-actions">
              ${activeCount > 1 ? `
                <button class="die-remove-one-btn" data-tier="${tierIdx}" title="Guardar 1 dado">-1</button>
                <button class="die-remove-all-btn" data-tier="${tierIdx}" title="Guardar todos deste tipo">Guardar Todos</button>
              ` : '<span class="min-die-badge">Último dado</span>'}
            </div>
          </div>
        `;
      }
    });

    // Catalog of dice
    let catalogHtml = '';
    DICE_TIERS.forEach((tier, index) => {
      const currentCount = this.gameState.getDiceCountByTier(index);
      const tierMax = this.gameState.getMaxDicePerType(index);
      const isCapacityFull = currentCount >= tierMax;

      const remainingSlots = Math.max(0, tierMax - currentCount);
      const canAfford1 = this.gameState.canAfford('coins', tier.baseCost);
      const count10 = Math.min(10, remainingSlots);
      const canAfford10 = count10 > 0 && this.gameState.canAfford('coins', tier.baseCost * count10);

      const hasBonus = tier.stardustBonus ? `+${tier.stardustBonus} ✨ Estrelas por rolagem` : null;
      const darkMatterBadge = tier.darkMatterBonus ? `+${tier.darkMatterBonus} 🌌 Matéria Escura` : null;

      catalogHtml += `
        <div class="dice-catalog-card" style="border-top: 3px solid ${tier.color};">
          <div class="card-top">
            <span class="catalog-icon">${tier.icon}</span>
            <div class="catalog-details">
              <div class="catalog-title">${tier.name}</div>
              <div class="catalog-mult">Multiplicador: <b>${tier.multiplier}x</b></div>
              <div class="catalog-tray-count">Na mesa: <b>${currentCount} / ${tierMax}</b></div>
              ${hasBonus ? `<div class="catalog-bonus-badge">${hasBonus}</div>` : ''}
              ${darkMatterBadge ? `<div class="catalog-bonus-badge" style="color: #c084fc; background: rgba(192, 132, 252, 0.15);">${darkMatterBadge}</div>` : ''}
            </div>
          </div>
          <div class="card-bottom">
            <div class="catalog-cost">$${Formulas.formatNumber(tier.baseCost)}</div>
            ${isCapacityFull ? `
              <button class="catalog-buy-btn btn-full" disabled>
                Mesa Cheia (${tierMax}/${tierMax})
              </button>
            ` : `
              <div class="catalog-btn-group">
                <button class="catalog-buy-btn ${canAfford1 ? 'btn-afford' : 'btn-cant-afford'}" 
                        data-tier="${index}" 
                        data-count="1" 
                        ${!canAfford1 ? 'disabled' : ''}
                        title="Comprar 1 dado">
                  +1
                </button>
                <button class="catalog-buy-btn ${canAfford10 && count10 >= 10 ? 'btn-afford' : 'btn-cant-afford'}" 
                        data-tier="${index}" 
                        data-count="10" 
                        ${!canAfford10 || count10 < 10 ? 'disabled' : ''}
                        title="Comprar 10 dados">
                  +10
                </button>
                <button class="catalog-buy-btn ${canAfford1 ? 'btn-afford' : 'btn-cant-afford'}" 
                        data-tier="${index}" 
                        data-count="max" 
                        ${!canAfford1 ? 'disabled' : ''}
                        title="Comprar máximo possível">
                  Máx
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="shop-view-wrapper">
        <div class="shop-header">
          <h2>Loja de Dados & Tabuleiro</h2>
          <div class="tray-capacity-badge">
            🎲 Total no Tabuleiro: <b>${activeCount}</b> dados ativos (Máx. <b>${maxPerType}</b> por tipo)
          </div>
        </div>

        <div class="active-dice-section">
          <h3>Dados Ativos na Mesa</h3>
          <div class="active-dice-grid">
            ${activeDiceHtml}
          </div>
        </div>

        <div class="catalog-section">
          <h3>Catálogo de Dados (Até ${maxPerType} de cada tipo na mesa)</h3>
          <div class="dice-catalog-grid">
            ${catalogHtml}
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    // Buy buttons (+1, +10, max)
    this.container.querySelectorAll('.catalog-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tierIndex = parseInt(btn.dataset.tier, 10);
        const count = btn.dataset.count;
        if (!isNaN(tierIndex)) {
          this.gameState.buyDie(tierIndex, count === 'max' ? 'max' : parseInt(count, 10));
          this.render();
        }
      });
    });

    // Remove 1 die of tier
    this.container.querySelectorAll('.die-remove-one-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tierIndex = parseInt(btn.dataset.tier, 10);
        if (!isNaN(tierIndex)) {
          this.gameState.removeDieByTier(tierIndex, 1);
          this.render();
        }
      });
    });

    // Remove all dice of tier
    this.container.querySelectorAll('.die-remove-all-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tierIndex = parseInt(btn.dataset.tier, 10);
        if (!isNaN(tierIndex)) {
          this.gameState.removeDieByTier(tierIndex, 'all');
          this.render();
        }
      });
    });
  }
}
