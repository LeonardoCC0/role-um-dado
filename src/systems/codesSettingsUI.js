// Settings and Promo Codes Interface
import { sounds } from '../audio/soundEngine.js';

export class CodesSettingsUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="settings-view-wrapper">
        <!-- Codes Section -->
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="card-icon">🎟️</span>
            <div>
              <h3>Resgate de Códigos (Promo Codes)</h3>
              <p>Insira códigos promocionais oficiais para receber moedas e stardust grátis.</p>
            </div>
          </div>
          <div class="code-input-row">
            <input type="text" id="promo-code-input" placeholder="Ex: release, rolladice, stardust" autocomplete="off" />
            <button id="promo-code-btn">Resgatar Código</button>
          </div>
          <div class="code-message" id="code-message"></div>
          <div class="active-codes-hint">
            💡 Códigos da referência disponíveis: <code>release</code> (6k moedas), <code>rolladice</code> (4k moedas + 5 stardust), <code>stardust</code> (+15 stardust), <code>gems</code> (+10 gemas).
          </div>
        </div>

        <!-- Audio & Preferences -->
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="card-icon">🔊</span>
            <div>
              <h3>Áudio e Efeitos Sonoros</h3>
              <p>Ajuste o volume dos dados, cliques e fanfarras.</p>
            </div>
          </div>
          <div class="setting-row">
            <span>Volume Geral:</span>
            <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="${this.gameState.settings.soundVolume}" />
            <span id="volume-display">${Math.round(this.gameState.settings.soundVolume * 100)}%</span>
          </div>
          <div class="setting-row">
            <span>Silenciar Todos os Sons:</span>
            <label class="toggle-switch">
              <input type="checkbox" id="mute-toggle" ${this.gameState.settings.soundMuted ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Data Management -->
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="card-icon">💾</span>
            <div>
              <h3>Gerenciamento de Dados & Progresso</h3>
              <p>O jogo salva automaticamente a cada 5 segundos no seu navegador.</p>
            </div>
          </div>
          <div class="save-actions-grid">
            <button class="save-btn" id="btn-export-save">📋 Exportar Salve</button>
            <button class="save-btn" id="btn-import-save">📥 Importar Salve</button>
            <button class="save-btn btn-danger" id="btn-reset-save">🗑️ Reiniciar Todo o Progresso</button>
          </div>
          <div class="code-message" id="save-message"></div>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    // Code redemption
    const codeInput = this.container.querySelector('#promo-code-input');
    const codeBtn = this.container.querySelector('#promo-code-btn');
    const codeMsg = this.container.querySelector('#code-message');

    const handleRedeem = () => {
      const code = (codeInput.value || '').trim();
      if (!code) return;
      const res = this.gameState.redeemCode(code);
      codeMsg.textContent = res.message;
      codeMsg.className = `code-message ${res.success ? 'msg-success' : 'msg-error'}`;
      if (res.success) {
        sounds.playPurchase();
        codeInput.value = '';
      } else {
        sounds.playClick();
      }
    };

    codeBtn.addEventListener('click', handleRedeem);
    codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleRedeem();
    });

    // Sound settings
    const volSlider = this.container.querySelector('#volume-slider');
    const volDisplay = this.container.querySelector('#volume-display');
    const muteToggle = this.container.querySelector('#mute-toggle');

    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.gameState.settings.soundVolume = val;
      sounds.setVolume(val);
      volDisplay.textContent = `${Math.round(val * 100)}%`;
      this.gameState.save();
    });

    muteToggle.addEventListener('change', (e) => {
      const isMuted = e.target.checked;
      this.gameState.settings.soundMuted = isMuted;
      sounds.setMuted(isMuted);
      this.gameState.save();
    });

    // Save actions
    const exportBtn = this.container.querySelector('#btn-export-save');
    const importBtn = this.container.querySelector('#btn-import-save');
    const resetBtn = this.container.querySelector('#btn-reset-save');
    const saveMsg = this.container.querySelector('#save-message');

    exportBtn.addEventListener('click', () => {
      const saveStr = localStorage.getItem('roll_a_dice_save_v2') || '';
      navigator.clipboard.writeText(saveStr).then(() => {
        saveMsg.textContent = 'Salve copiado para a área de transferência!';
        saveMsg.className = 'code-message msg-success';
        sounds.playPurchase();
      });
    });

    importBtn.addEventListener('click', () => {
      const raw = prompt('Cole aqui o texto do seu salve:');
      if (raw) {
        try {
          JSON.parse(raw);
          localStorage.setItem('roll_a_dice_save_v2', raw);
          window.location.reload();
        } catch (e) {
          alert('Dados de salve inválidos.');
        }
      }
    });

    resetBtn.addEventListener('click', () => {
      if (confirm('Tem certeza absoluta que deseja apagar todo o seu progresso? Esta ação não pode ser desfeita.')) {
        this.gameState.resetAll();
        window.location.reload();
      }
    });
  }
}
