// Interactive Pan & Zoom Skill Tree Navigation and Inspector
import { SKILL_TREE_NODES } from './treeData.js';
import { sounds } from '../audio/soundEngine.js';

export class SkillTreeUI {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;

    this.panX = 0;
    this.panY = 0;
    this.zoom = 1.0;
    this.minZoom = 0.4;
    this.maxZoom = 2.2;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.selectedNodeId = null;

    this.initDOM();
    this.setupEvents();
    this.centerView();
    this.render();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="tree-viewport" id="tree-viewport">
        <!-- SVG Connections Layer -->
        <svg class="tree-svg-layer" id="tree-svg-layer"></svg>
        
        <!-- Nodes Layer -->
        <div class="tree-nodes-layer" id="tree-nodes-layer"></div>
      </div>

      <!-- Tree Controls HUD -->
      <div class="tree-controls-hud">
        <button class="tree-hud-btn" id="tree-zoom-in" title="Aumentar Zoom">➕</button>
        <button class="tree-hud-btn" id="tree-zoom-out" title="Diminuir Zoom">➖</button>
        <button class="tree-hud-btn" id="tree-zoom-center" title="Centralizar Visualização">🎯 Centralizar</button>
      </div>

      <!-- Node Details Inspector Modal / Drawer -->
      <div class="tree-inspector-modal" id="tree-inspector" style="display: none;">
        <div class="tree-inspector-content" id="tree-inspector-content"></div>
      </div>
    `;

    this.viewport = this.container.querySelector('#tree-viewport');
    this.svgLayer = this.container.querySelector('#tree-svg-layer');
    this.nodesLayer = this.container.querySelector('#tree-nodes-layer');
    this.inspector = this.container.querySelector('#tree-inspector');
    this.inspectorContent = this.container.querySelector('#tree-inspector-content');
  }

  setupEvents() {
    // Zoom buttons
    this.container.querySelector('#tree-zoom-in').addEventListener('click', () => this.adjustZoom(0.2));
    this.container.querySelector('#tree-zoom-out').addEventListener('click', () => this.adjustZoom(-0.2));
    this.container.querySelector('#tree-zoom-center').addEventListener('click', () => this.centerView());

    // Mouse drag pan
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.tree-node') || e.target.closest('.tree-hud-btn') || e.target.closest('.tree-inspector-modal')) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewport.style.cursor = 'grab';
      }
    });

    // Touch pan & pinch zoom
    let initialPinchDist = null;
    let initialPinchZoom = 1.0;

    this.viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('.tree-node') || e.target.closest('.tree-hud-btn')) return;
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.panX;
        this.startY = e.touches[0].clientY - this.panY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialPinchZoom = this.zoom;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        this.panX = e.touches[0].clientX - this.startX;
        this.panY = e.touches[0].clientY - this.startY;
        this.applyTransform();
      } else if (e.touches.length === 2 && initialPinchDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / initialPinchDist;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, initialPinchZoom * factor));
        this.applyTransform();
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      initialPinchDist = null;
    });

    // Wheel zoom
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
      this.adjustZoom(zoomDelta, e.clientX, e.clientY);
    }, { passive: false });

    // Close inspector on outside click
    this.inspector.addEventListener('click', (e) => {
      if (e.target === this.inspector) {
        this.closeInspector();
      }
    });
  }

  adjustZoom(delta, mouseX = null, mouseY = null) {
    const oldZoom = this.zoom;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, oldZoom + delta));
    if (newZoom === oldZoom) return;

    if (mouseX !== null && mouseY !== null) {
      const rect = this.viewport.getBoundingClientRect();
      const vx = mouseX - rect.left;
      const vy = mouseY - rect.top;

      // Adjust pan to zoom towards mouse position
      this.panX = vx - (vx - this.panX) * (newZoom / oldZoom);
      this.panY = vy - (vy - this.panY) * (newZoom / oldZoom);
    }

    this.zoom = newZoom;
    this.applyTransform();
  }

  centerView() {
    const rect = this.viewport.getBoundingClientRect();
    this.panX = rect.width / 2;
    this.panY = rect.height / 2;
    this.zoom = 1.0;
    this.applyTransform();
  }

  applyTransform() {
    const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.nodesLayer.style.transform = transform;
    this.svgLayer.style.transform = transform;
  }

  getNodeStatus(nodeId) {
    const node = SKILL_TREE_NODES[nodeId];
    if (!node) return 'locked';

    const currentLvl = this.gameState.skillTree[nodeId] || 0;
    if (currentLvl >= node.maxLevel) return 'max';
    if (currentLvl > 0) return 'purchased';

    // Check prerequisites
    const reqsMet = node.reqs.every(reqId => (this.gameState.skillTree[reqId] || 0) > 0);
    return reqsMet ? 'available' : 'locked';
  }

  render() {
    this.renderSvgConnections();
    this.renderNodes();
    if (this.selectedNodeId) {
      this.openInspector(this.selectedNodeId);
    }
  }

  renderSvgConnections() {
    // Generate SVG path wires between connected nodes
    let svgHtml = '';

    for (const [nodeId, node] of Object.entries(SKILL_TREE_NODES)) {
      for (const reqId of node.reqs) {
        const parent = SKILL_TREE_NODES[reqId];
        if (!parent) continue;

        const parentLvl = this.gameState.skillTree[reqId] || 0;
        const childLvl = this.gameState.skillTree[nodeId] || 0;

        let wireClass = 'wire-locked';
        if (childLvl > 0) {
          wireClass = 'wire-completed';
        } else if (parentLvl > 0) {
          wireClass = 'wire-available';
        }

        // Draw curved bezier line between (parent.x, parent.y) and (node.x, node.y)
        const x1 = parent.x;
        const y1 = parent.y;
        const x2 = node.x;
        const y2 = node.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx1 = x1 + dx * 0.5;
        const cy1 = y1;
        const cx2 = x1 + dx * 0.5;
        const cy2 = y2;

        const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
        svgHtml += `<path d="${d}" class="tree-wire ${wireClass}" />`;
      }
    }

    this.svgLayer.innerHTML = svgHtml;
  }

  renderNodes() {
    let nodesHtml = '';

    for (const [nodeId, node] of Object.entries(SKILL_TREE_NODES)) {
      const status = this.getNodeStatus(nodeId);
      const currentLvl = this.gameState.skillTree[nodeId] || 0;
      const resource = node.costResource === 'darkMatter' ? '🌌' : '✨';
      const nextCost = currentLvl < node.maxLevel ? node.costs[currentLvl] : 0;

      const isDarkMatter = node.costResource === 'darkMatter';

      nodesHtml += `
        <div class="tree-node status-${status} branch-${node.branch} ${isDarkMatter ? 'cosmic-node' : ''}" 
             data-id="${nodeId}" 
             style="left: ${node.x}px; top: ${node.y}px;"
             title="${node.name}">
          <div class="node-icon">${node.icon}</div>
          <div class="node-title">${node.name}</div>
          <div class="node-level">${status === 'max' ? 'MAX' : (node.maxLevel > 1 ? `Lv. ${currentLvl}/${node.maxLevel}` : (currentLvl > 0 ? 'COMPRADO' : `${nextCost} ${resource}`))}</div>
          ${status === 'locked' ? '<div class="node-lock-badge">🔒</div>' : ''}
          ${status === 'max' ? '<div class="node-check-badge">✓</div>' : ''}
        </div>
      `;
    }

    this.nodesLayer.innerHTML = nodesHtml;

    // Add click listeners to nodes
    this.nodesLayer.querySelectorAll('.tree-node').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id;
        sounds.playClick();
        this.openInspector(id);
      });
    });
  }

  openInspector(nodeId) {
    this.selectedNodeId = nodeId;
    const node = SKILL_TREE_NODES[nodeId];
    if (!node) return;

    const currentLvl = this.gameState.skillTree[nodeId] || 0;
    const status = this.getNodeStatus(nodeId);
    const isMax = currentLvl >= node.maxLevel;
    const resource = node.costResource === 'darkMatter' ? 'darkMatter' : 'stardust';
    const resourceIcon = resource === 'darkMatter' ? '🌌' : '✨';
    const resourceName = resource === 'darkMatter' ? 'Matéria Escura' : 'Stardust';
    const cost = isMax ? 0 : node.costs[currentLvl];
    const canAfford = this.gameState.canAfford(resource, cost);
    const reqsMet = node.reqs.every(reqId => (this.gameState.skillTree[reqId] || 0) > 0);

    // Build prerequisites list
    let reqsHtml = '';
    if (node.reqs.length > 0) {
      reqsHtml = `
        <div class="inspector-section">
          <div class="section-title">Requisitos Prévios</div>
          <div class="reqs-list">
            ${node.reqs.map(reqId => {
              const reqNode = SKILL_TREE_NODES[reqId];
              const met = (this.gameState.skillTree[reqId] || 0) > 0;
              return `
                <div class="req-item ${met ? 'met' : 'unmet'}">
                  <span class="req-status">${met ? '✓' : '🔒'}</span>
                  <span class="req-name">${reqNode ? reqNode.name : reqId}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Effect comparison
    let effectComparisonHtml = `
      <div class="inspector-section">
        <div class="section-title">Efeito da Habilidade</div>
        <div class="effect-box current-effect">
          <span class="effect-label">Atual:</span>
          <span class="effect-val">${node.effectText(currentLvl)}</span>
        </div>
        ${!isMax ? `
          <div class="effect-box next-effect">
            <span class="effect-label">Próximo Nível:</span>
            <span class="effect-val">${node.effectText(currentLvl + 1)}</span>
          </div>
        ` : ''}
      </div>
    `;

    // Buy Button state
    let buttonHtml = '';
    if (isMax) {
      buttonHtml = `<button class="tree-buy-btn btn-maxed" disabled>Nível Máximo Atingido ✓</button>`;
    } else if (!reqsMet) {
      buttonHtml = `<button class="tree-buy-btn btn-locked" disabled>Bloqueado — Requisitos Pendentes 🔒</button>`;
    } else if (!canAfford) {
      buttonHtml = `<button class="tree-buy-btn btn-unaffordable" disabled>Saldo Insuficiente (${cost} ${resourceIcon})</button>`;
    } else {
      buttonHtml = `
        <button class="tree-buy-btn btn-ready" id="tree-btn-buy">
          ${currentLvl > 0 ? 'Melhorar para Nível ' + (currentLvl + 1) : 'Desbloquear Habilidade'} 
          <span class="cost-tag">${cost} ${resourceIcon}</span>
        </button>
      `;
    }

    this.inspectorContent.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-icon-badge">${node.icon}</div>
        <div class="inspector-title-area">
          <div class="inspector-title">${node.name}</div>
          <div class="inspector-badge-row">
            <span class="inspector-badge badge-${node.branch}">${node.branch.toUpperCase()}</span>
            <span class="inspector-badge badge-level">Nível ${currentLvl} / ${node.maxLevel}</span>
          </div>
        </div>
        <button class="inspector-close" id="tree-inspector-close">&times;</button>
      </div>

      <div class="inspector-desc">${node.desc}</div>

      ${effectComparisonHtml}
      ${reqsHtml}

      <div class="inspector-actions">
        ${buttonHtml}
      </div>
    `;

    this.inspector.style.display = 'flex';

    // Hook events
    this.inspectorContent.querySelector('#tree-inspector-close').addEventListener('click', () => {
      this.closeInspector();
    });

    const buyBtn = this.inspectorContent.querySelector('#tree-btn-buy');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        const res = this.gameState.buySkillTreeNode(nodeId);
        if (res.success) {
          this.render();
        } else {
          alert(res.reason || 'Não foi possível comprar.');
        }
      });
    }
  }

  closeInspector() {
    this.selectedNodeId = null;
    this.inspector.style.display = 'none';
  }
}
