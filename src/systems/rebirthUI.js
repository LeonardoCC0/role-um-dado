// Complete Rebirth Interface with Confirmation Modal and Atomic Logic
import confetti from 'canvas-confetti';
import { Formulas } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

export class RebirthUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;

    this.render();
  }

  render() {
    const reqs = Formulas.getRebirthRequirements(this.gameState);
    const rewards = Formulas.getRebirthRewards(this.gameState);

    const tree = this.gameState.skillTree || {};
    const retentionLvl = tree['tree_legacy_retention'] || 0;
    const retentionPercent = retentionLvl * 30;

    const hasGoldenStart = !!tree['tree_golden_start'];
    const hasRebirthSurge = !!tree['tree_rebirth_surge'];

    this.container.innerHTML = `
      <div class="rebirth-view-wrapper">
        <div class="rebirth-header-card">
          <div class="rebirth-badge-icon">🔄</div>
          <div class="rebirth-header-text">
            <h2>Portal de Renascimento (Rebirth)</h2>
            <p>Reinicie sua jornada terrena em troca de poder cósmico eterno e multiplicadores permanentes.</p>
          </div>
          <div class="rebirth-current-stats">
            <div class="stat-box">
              <span class="label">Rebirths Concluídos</span>
              <span class="value">${this.gameState.rebirths}</span>
            </div>
            <div class="stat-box highlight">
              <span class="label">Multiplicador Permanente</span>
              <span class="value">${rewards.currentMultiplier.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        <!-- Requirements Section -->
        <div class="rebirth-section">
          <h3>Requisitos para o Rebirth #${rewards.nextRebirth}</h3>
          <div class="req-bars-container">
            <!-- Coins Requirement -->
            <div class="req-bar-card ${reqs.coinsMet ? 'completed' : ''}">
              <div class="req-bar-header">
                <span class="req-title">💰 Moedas em Caixa</span>
                <span class="req-values">$${Formulas.formatNumber(reqs.currentCoins)} / $${Formulas.formatNumber(reqs.coinsNeeded)}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill coins-fill" style="width: ${(reqs.coinsProgress * 100).toFixed(1)}%;"></div>
              </div>
              <div class="req-status-text">${reqs.coinsMet ? '✓ Concluído' : `Faltam $${Formulas.formatNumber(Math.max(0, reqs.coinsNeeded - reqs.currentCoins))}`}</div>
            </div>

            <!-- Dice Requirement -->
            <div class="req-bar-card ${reqs.diceMet ? 'completed' : ''}">
              <div class="req-bar-header">
                <span class="req-title">🎲 Dados Ativos no Tabuleiro</span>
                <span class="req-values">${reqs.currentDice} / ${reqs.diceNeeded}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill dice-fill" style="width: ${(reqs.diceProgress * 100).toFixed(1)}%;"></div>
              </div>
              <div class="req-status-text">${reqs.diceMet ? '✓ Concluído' : `Compre mais ${Math.max(0, reqs.diceNeeded - reqs.currentDice)} dado(s)`}</div>
            </div>
          </div>
        </div>

        <!-- Rebirth Rewards Preview -->
        <div class="rebirth-section">
          <h3>Recompensas do Próximo Renascimento</h3>
          <div class="rebirth-rewards-grid">
            <div class="reward-pill">
              <span class="reward-icon">📈</span>
              <div class="reward-info">
                <span class="reward-name">Multiplicador Global</span>
                <span class="reward-val">+${hasRebirthSurge ? '200%' : '100%'} (${rewards.nextMultiplier.toFixed(1)}x total)</span>
              </div>
            </div>
            <div class="reward-pill stardust-pill">
              <span class="reward-icon">✨</span>
              <div class="reward-info">
                <span class="reward-name">Stardust Cósmico</span>
                <span class="reward-val">+${rewards.stardustReward} Stardust</span>
              </div>
            </div>
            <div class="reward-pill gem-pill">
              <span class="reward-icon">💎</span>
              <div class="reward-info">
                <span class="reward-name">Gemas Preciosas</span>
                <span class="reward-val">+${rewards.gemsReward} Gemas</span>
              </div>
            </div>
            <div class="reward-pill perk-pill">
              <span class="reward-icon">⚡</span>
              <div class="reward-info">
                <span class="reward-name">Velocidade de Progressão</span>
                <span class="reward-val">Recomeço ${rewards.nextMultiplier.toFixed(1)}x mais rápido!</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Side-by-Side Comparison -->
        <div class="rebirth-comparison-grid">
          <div class="comparison-card card-lost">
            <h4>❌ O que será reiniciado:</h4>
            <ul>
              <li>Saldo de Moedas atuais (zerado)</li>
              <li>Upgrades comuns comprados com moedas ${retentionPercent > 0 ? `<b style="color:#60a5fa">(${retentionPercent}% preservado pelo Legado!)</b>` : ''}</li>
              <li>Dados comuns ativos na mesa</li>
            </ul>
          </div>
          <div class="comparison-card card-kept">
            <h4> O que você mantém para sempre:</h4>
            <ul>
              <li>Todo o Stardust acumulado (✨)</li>
              <li>Árvore de Habilidades Completa e todos os nós</li>
              <li>Gemas (💎) e Matéria Escura (🌌)</li>
              <li>Total de Rebirths e Multiplicador Permanente</li>
              <li>Todas as Estatísticas e Conquistas</li>
              ${hasGoldenStart ? '<li style="color:#fde047"><b>Início Dourado: Começa com $10.000 e 2 Dados de Bronze!</b></li>' : ''}
            </ul>
          </div>
        </div>

        <!-- Action Button -->
        <div class="rebirth-action-area">
          <button class="rebirth-main-btn ${reqs.canRebirth ? 'btn-active' : 'btn-disabled'}" 
                  id="btn-rebirth-trigger" 
                  ${!reqs.canRebirth ? 'disabled' : ''}>
            ${reqs.canRebirth ? `Transcender para Rebirth #${rewards.nextRebirth} ✨` : 'Requisitos Incompletos 🔒'}
          </button>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div class="rebirth-modal-backdrop" id="rebirth-modal" style="display: none;">
        <div class="rebirth-modal-card">
          <div class="modal-glow-header">
            <span class="modal-icon">⚠️</span>
            <h3>Confirmar Renascimento #${rewards.nextRebirth}</h3>
          </div>
          <p class="modal-body-text">
            Você está prestes a realizar um <b>Rebirth</b>. Suas moedas e upgrades comuns serão reiniciados, 
            mas você receberá <b>+${hasRebirthSurge ? '200%' : '100%'}</b> de multiplicador permanente, 
            <b>+${rewards.stardustReward} Stardust</b> e <b>+${rewards.gemsReward} Gemas</b>!
          </p>
          <div class="modal-highlights">
            <div>Multiplicador: <b>${rewards.currentMultiplier.toFixed(1)}x ➔ ${rewards.nextMultiplier.toFixed(1)}x</b></div>
            <div>Stardust Ganho: <b style="color: #60a5fa;">+${rewards.stardustReward} ✨</b></div>
            <div>Gemas Ganhas: <b style="color: #f43f5e;">+${rewards.gemsReward} 💎</b></div>
          </div>
          <div class="modal-actions">
            <button class="modal-cancel-btn" id="modal-rebirth-cancel">Cancelar</button>
            <button class="modal-confirm-btn" id="modal-rebirth-confirm">Sim, Renascer Agora! 🔄</button>
          </div>
        </div>
      </div>
    `;

    this.setupModalEvents();
  }

  setupModalEvents() {
    const triggerBtn = this.container.querySelector('#btn-rebirth-trigger');
    const modal = this.container.querySelector('#rebirth-modal');
    const cancelBtn = this.container.querySelector('#modal-rebirth-cancel');
    const confirmBtn = this.container.querySelector('#modal-rebirth-confirm');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        sounds.playClick();
        if (modal) modal.style.display = 'flex';
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        sounds.playClick();
        if (modal) modal.style.display = 'none';
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const result = this.gameState.performRebirth();
        if (modal) modal.style.display = 'none';

        if (result.success) {
          // Confetti celebration
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
          this.render();
        } else {
          alert(result.reason || 'Não foi possível renascer.');
        }
      });
    }
  }
}
