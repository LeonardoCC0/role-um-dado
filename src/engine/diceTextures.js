// Procedural 3D Dice Face Texture Generator
import * as THREE from 'three';
import { DICE_TIERS } from '../state/formulas.js';

// Cache generated textures so we don't redraw canvases repeatedly
const textureCache = new Map();

// Pip positions normalized in [0, 1] range
const PIP_POSITIONS = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]]
};

export function createDiceFaceTexture(tierIndex, pipNumber) {
  const cacheKey = `${tierIndex}_${pipNumber}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const tier = DICE_TIERS[tierIndex] || DICE_TIERS[0];
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = tier.color;
  ctx.fillRect(0, 0, size, size);

  // Subtle radial highlight
  const grad = ctx.createRadialGradient(size * 0.4, size * 0.4, 10, size * 0.5, size * 0.5, size * 0.8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Border frame
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, size - 12, size - 12);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, size - 32, size - 32);

  // Draw Pips
  const pips = PIP_POSITIONS[pipNumber] || [];
  const pipRadius = size * 0.085;

  for (const [px, py] of pips) {
    const cx = px * size;
    const cy = py * size;

    // Pip Drop Shadow
    ctx.beginPath();
    ctx.arc(cx + 2, cy + 3, pipRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Pip Main Body
    ctx.beginPath();
    ctx.arc(cx, cy, pipRadius, 0, Math.PI * 2);
    ctx.fillStyle = tier.pipColor;
    ctx.fill();

    // Pip Specular Highlight
    ctx.beginPath();
    ctx.arc(cx - pipRadius * 0.3, cy - pipRadius * 0.3, pipRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  // Tier special effects (e.g. sparkles for stardust/diamond/cosmic)
  if (tier.id === 'stardust' || tier.id === 'cosmic' || tier.id === 'diamond') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 6; i++) {
      const sx = 20 + Math.random() * (size - 40);
      const sy = 20 + Math.random() * (size - 40);
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(cacheKey, texture);
  return texture;
}

// Map the 6 box geometry faces to opposite sum = 7
// 0: +X -> 2
// 1: -X -> 5
// 2: +Y -> 1
// 3: -Y -> 6
// 4: +Z -> 3
// 5: -Z -> 4
export const FACE_PIP_MAP = [2, 5, 1, 6, 3, 4];

export function createDiceMaterials(tierIndex) {
  const materials = [];
  for (let i = 0; i < 6; i++) {
    const pipNumber = FACE_PIP_MAP[i];
    const texture = createDiceFaceTexture(tierIndex, pipNumber);
    const tier = DICE_TIERS[tierIndex] || DICE_TIERS[0];

    const isMetallic = ['bronze', 'iron', 'silver', 'gold', 'obsidian', 'cosmic'].includes(tier.id);
    const isShiny = ['diamond', 'emerald', 'ruby', 'stardust'].includes(tier.id);

    materials.push(new THREE.MeshStandardMaterial({
      map: texture,
      roughness: isMetallic ? 0.3 : (isShiny ? 0.15 : 0.6),
      metalness: isMetallic ? 0.7 : 0.1,
      bumpScale: 0.05
    }));
  }
  return materials;
}
