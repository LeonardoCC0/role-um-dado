// Statistics and Achievements Interface
import { Formulas } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

export const ACHIEVEMENTS_LIST = [
  { id: 'ach_roll_1', name: 'Primeiro Lançamento', desc: 'Role os dados pela primeira vez.', rewardGems: 2, condition: (s) => s.stats.totalRolls >= 1 },
  { id: 'ach_roll_50', name: 'Mãos Calejadas', desc: 'Realize 50 rolagens de dados.', rewardGems: 3, condition: (s) => s.stats.totalRolls >= 50 },
  { id: 'ach_roll_250', name: 'Mestre dos Dados', desc: 'Realize 250 rolagens de dados.', rewardGems: 5, condition: (s) => s.stats.totalRolls >= 250 },
  { id: 'ach_coins_1k', name: 'Primeiro Milhar', desc: 'Acumule $1.000 moedas no total.', rewardGems: 2, condition: (s) => s.stats.totalCoinsEarned >= 1000 },
  { id: 'ach_coins_50k', name: 'Cofre Farto', desc: 'Acumule $50.000 moedas no total.', rewardGems: 5, condition: (s) => s.stats.totalCoinsEarned >= 50000 },
  { id: 'ach_coins_1m', name: 'Milionário dos Dados', desc: 'Acumule $1.000.000 moedas no total.', rewardGems: 10, condition: (s) => s.stats.totalCoinsEarned >= 1000000 },
  { id: 'ach_stardust_1', name: 'Poeira Cósmica', desc: 'Colete seu primeiro Stardust ✨.', rewardGems: 3, condition: (s) => s.stats.totalStardustEarned >= 1 },
  { id: 'ach_stardust_25', name: 'Colecionador Estelar', desc: 'Colete 25 Stardust no total.', rewardGems: 6, condition: (s) => s.stats.totalStardustEarned >= 25 },
  { id: 'ach_hand_1', name: 'Automação Começa', desc: 'Ative sua primeira Mão Mecânica.', rewardGems: 3, condition: (s) => (s.commonUpgrades?.helperHands || 0) >= 1 || !!s.skillTree['tree_helper_hand_1'] },
  { id: 'ach_dice_5', name: 'Mesa Movimentada', desc: 'Tenha pelo menos 4 dados ativos.', rewardGems: 5, condition: (s) => s.activeDice.length >= 4 },
  { id: 'ach_rebirth_1', name: 'O Grande Salto', desc: 'Realize o seu 1º Rebirth.', rewardGems: 10, condition: (s) => s.rebirths >= 1 },
  { id: 'ach_rebirth_3', name: 'Transcendência', desc: 'Realize 3 Rebirths no total.', rewardGems: 20, condition: (s) => s.rebirths >= 3 },
  { id: 'ach_crit_10', name: 'Impacto Fulminante', desc: 'Consiga 10 rolagens críticas.', rewardGems: 5, condition: (s) => (s.stats.criticalRollsCount || 0) >= 10 },
  { id: 'ach_dark_matter', name: 'Alquimia Proibida', desc: 'Obtenha Matéria Escura 🌌.', rewardGems: 25, condition: (s) => (s.stats.totalDarkMatterEarned || 0) >= 1 }
];

export class StatsAchievementsUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;
    this.render();
  }

  formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  render() {
    const s = this.gameState.stats;

    // Stats Grid
    const statsHtml = `
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">🎲</span>
          <div class="stat-val">${s.totalRolls.toLocaleString('pt-BR')}</div>
          <div class="stat-lbl">Rolagens Totais</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <div class="stat-val">$${Formulas.formatNumber(s.totalCoinsEarned)}</div>
          <div class="stat-lbl">Moedas Ganhas</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✨</span>
          <div class="stat-val">${s.totalStardustEarned.toLocaleString('pt-BR')}</div>
          <div class="stat-lbl">Stardust Coletado</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💎</span>
          <div class="stat-val">${s.totalGemsEarned.toLocaleString('pt-BR')}</div>
          <div class="stat-lbl">Gemas Coletadas</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🌌</span>
          <div class="stat-val">${s.totalDarkMatterEarned.toLocaleString('pt-BR')}</div>
          <div class="stat-lbl">Matéria Escura</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <div class="stat-val">$${Formulas.formatNumber(s.highestRollIncome)}</div>
          <div class="stat-lbl">Maior Rolagem Única</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⚡</span>
          <div class="stat-val">${(s.criticalRollsCount || 0).toLocaleString('pt-BR')}</div>
          <div class="stat-lbl">Rolagens Críticas</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🔄</span>
          <div class="stat-val">${this.gameState.rebirths}</div>
          <div class="stat-lbl">Renascimentos (Rebirths)</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏱️</span>
          <div class="stat-val">${this.formatTime(s.playTimeSeconds)}</div>
          <div class="stat-lbl">Tempo de Jogo</div>
        </div>
      </div>
    `;

    // Achievements Grid
    let achHtml = '';
    ACHIEVEMENTS_LIST.forEach(ach => {
      const isUnlocked = !!this.gameState.achievements[ach.id];
      const canClaim = !isUnlocked && ach.condition(this.gameState);

      achHtml += `
        <div class="achievement-card ${isUnlocked ? 'ach-unlocked' : (canClaim ? 'ach-claimable' : 'ach-locked')}">
          <div class="ach-header">
            <span class="ach-badge">${isUnlocked ? '✓' : (canClaim ? '🎁' : '🔒')}</span>
            <div class="ach-texts">
              <div class="ach-title">${ach.name}</div>
              <div class="ach-desc">${ach.desc}</div>
            </div>
          </div>
          <div class="ach-footer">
            <span class="ach-reward">Recompensa: <b>+${ach.rewardGems} 💎 Gemas</b></span>
            ${canClaim ? `
              <button class="ach-claim-btn" data-id="${ach.id}" data-reward="${ach.rewardGems}">Resgatar Gemas</button>
            ` : (isUnlocked ? '<span class="ach-status-done">Concluída ✓</span>' : '<span class="ach-status-locked">Bloqueada</span>')}
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="stats-view-wrapper">
        <div class="stats-section-title">
          <h2>Estatísticas da Partida</h2>
        </div>
        ${statsHtml}

        <div class="stats-section-title" style="margin-top: 2rem;">
          <h2>Conquistas & Marcos</h2>
        </div>
        <div class="achievements-grid">
          ${achHtml}
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    this.container.querySelectorAll('.ach-claim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const reward = parseInt(btn.dataset.reward, 10);
        if (id && reward) {
          this.gameState.achievements[id] = true;
          this.gameState.addGems(reward);
          sounds.playPurchase();
          this.render();
        }
      });
    });
  }
}
