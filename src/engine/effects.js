// Visual Effects, 3D Shockwaves, Floating Numbers & Clickable Shooting Stars
import * as THREE from 'three';
import { Formulas } from '../state/formulas.js';
import { sounds } from '../audio/soundEngine.js';

export class EffectsManager {
  constructor(sceneEngine, gameState) {
    this.sceneEngine = sceneEngine;
    this.gameState = gameState;
    this.container = document.getElementById('floating-effects-container');
    this.shockwaves = [];
    this.activeStars = [];
    this.starTimer = 0;

    this.setupRaycasting();
  }

  setupRaycasting() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const canvas = this.sceneEngine.renderer.domElement;
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.sceneEngine.camera);
      const starMeshes = this.activeStars.map(s => s.mesh);
      const intersects = this.raycaster.intersectObjects(starMeshes, true);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const starObj = this.activeStars.find(s => s.mesh === hitMesh || s.mesh.children.includes(hitMesh));
        if (starObj) {
          this.collectStar(starObj);
        }
      }
    });
  }

  // Convert 3D world position to 2D screen coordinates
  toScreenPosition(worldPos) {
    const vector = new THREE.Vector3().copy(worldPos);
    vector.project(this.sceneEngine.camera);

    const halfW = this.sceneEngine.container.clientWidth / 2;
    const halfH = this.sceneEngine.container.clientHeight / 2;

    return {
      x: (vector.x * halfW) + halfW,
      y: -(vector.y * halfH) + halfH
    };
  }

  spawnFloatingIncome(pos3D, amount, isCrit = false, face = 1) {
    if (!this.container) return;

    const screenPos = this.toScreenPosition(pos3D);
    const el = document.createElement('div');
    el.className = `floating-text ${isCrit ? 'crit' : ''}`;
    el.innerHTML = `${isCrit ? '⚡ CRÍTICO! ' : ''}+$${Formulas.formatNumber(amount)} <span class="face-tag">[${face}]</span>`;

    el.style.left = `${screenPos.x + (Math.random() * 40 - 20)}px`;
    el.style.top = `${screenPos.y - 10}px`;

    this.container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1200);
  }

  spawnFloatingStardust(pos3D, amount) {
    if (!this.container) return;

    const screenPos = this.toScreenPosition(pos3D);
    const el = document.createElement('div');
    el.className = 'floating-text stardust-text';
    el.innerHTML = `✨ +${amount} STARDUST!`;

    el.style.left = `${screenPos.x}px`;
    el.style.top = `${screenPos.y - 35}px`;

    this.container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1500);
  }

  spawnFloatingDarkMatter(pos3D, amount) {
    if (!this.container) return;

    const screenPos = this.toScreenPosition(pos3D);
    const el = document.createElement('div');
    el.className = 'floating-text darkmatter-text';
    el.innerHTML = `🌌 +${amount} MATÉRIA ESCURA!`;

    el.style.left = `${screenPos.x}px`;
    el.style.top = `${screenPos.y - 50}px`;

    this.container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1800);
  }

  spawnShockwave(pos3D, color = 0x60a5fa) {
    const geo = new THREE.RingGeometry(0.3, 0.6, 32);
    const mat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos3D.x, 0.05, pos3D.z);
    this.sceneEngine.scene.add(mesh);

    this.shockwaves.push({
      mesh,
      scale: 1,
      opacity: 0.85
    });
  }

  spawnShootingStar() {
    const group = new THREE.Group();

    // Octahedron glowing star
    const geo = new THREE.OctahedronGeometry(0.65, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Light
    const light = new THREE.PointLight(0x38bdf8, 1.8, 6);
    group.add(light);

    // Random position in tray
    const r = 1 + Math.random() * 4.5;
    const a = Math.random() * Math.PI * 2;
    group.position.set(Math.cos(a) * r, 0.7, Math.sin(a) * r);

    this.sceneEngine.scene.add(group);
    this.activeStars.push({
      mesh: group,
      birth: Date.now(),
      lifetime: 14000 // 14 seconds to click
    });

    sounds.playStardust();
  }

  collectStar(starObj) {
    const idx = this.activeStars.indexOf(starObj);
    if (idx !== -1) {
      this.activeStars.splice(idx, 1);
      this.sceneEngine.scene.remove(starObj.mesh);

      const amount = 2 + Math.floor(Math.random() * 4);
      this.gameState.addStardust(amount);
      this.spawnFloatingStardust(starObj.mesh.position, amount);
      sounds.playStardust();
    }
  }

  update(dt) {
    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.scale += dt * 6;
      sw.opacity -= dt * 1.5;
      sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
      sw.mesh.material.opacity = Math.max(0, sw.opacity);

      if (sw.opacity <= 0) {
        this.sceneEngine.scene.remove(sw.mesh);
        this.shockwaves.splice(i, 1);
      }
    }

    // Check shooting stars skill
    if (this.gameState.skillTree['tree_shooting_stars']) {
      this.starTimer += dt;
      if (this.starTimer >= 22 && this.activeStars.length < 2) {
        this.starTimer = 0;
        this.spawnShootingStar();
      }
    }

    // Rotate and animate active stars
    const now = Date.now();
    for (let i = this.activeStars.length - 1; i >= 0; i--) {
      const star = this.activeStars[i];
      star.mesh.rotation.y += dt * 2.5;
      star.mesh.rotation.x += dt * 1.5;
      star.mesh.position.y = 0.7 + Math.sin(now * 0.005) * 0.2;

      if (now - star.birth > star.lifetime) {
        this.sceneEngine.scene.remove(star.mesh);
        this.activeStars.splice(i, 1);
      }
    }
  }
}
