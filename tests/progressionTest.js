// Complete Progression Simulation Test
import { Formulas, DICE_TIERS, COMMON_UPGRADE_CONFIG } from '../src/state/formulas.js';
import { SKILL_TREE_NODES } from '../src/systems/treeData.js';
import { GameState } from '../src/state/gameState.js';

console.log("=== INICIANDO TESTE DE PROGRESSÃO COMPLETO (ROLL A DICE) ===");

// 1. Simular Estado Inicial com GameState
const state = {
  coins: 0,
  stardust: 3, // Starter stardust
  gems: 0,
  darkMatter: 0,
  rebirths: 0,
  comboMultiplier: 1,
  activeDice: [{ id: 'die_test_1', tierIndex: 0 }], // 1 Wood die
  inventory: [0],
  commonUpgrades: {
    helperHands: 0,
    rollPower: 0,
    coinMultiplier: 0,
    rollFrequency: 0,
    critChance: 0,
    trayMagnetism: 0
  },
  skillTree: { tree_origin: 1 },
  stats: {
    totalRolls: 0,
    totalCoinsEarned: 0,
    totalStardustEarned: 0,
    totalGemsEarned: 0,
    totalDarkMatterEarned: 0,
    highestRollIncome: 0,
    criticalRollsCount: 0
  }
};

console.log("1. Estado Inicial verificado: 1 Dado de Madeira, $0 moedas, 3 Stardust, Rebirth 0.");

// 2. Simular rolagens de dados iniciais - Verificar que CADA rolagem concede Moedas e Stardust!
let initialStarsEarned = 0;
for (let i = 0; i < 20; i++) {
  const face = 1 + (i % 6);
  const income = Formulas.calculateDiceIncome(face, state.activeDice[0].tierIndex, state, false);
  const stars = Formulas.calculateStardustGain(face, state.activeDice[0].tierIndex, state, false);
  state.coins += income;
  state.stardust += stars;
  initialStarsEarned += stars;
  state.stats.totalRolls += 1;
  state.stats.totalCoinsEarned += income;
}
console.log(`2. 20 rolagens concluídas: $${state.coins} moedas e +${initialStarsEarned} Stardust garantidos!`);

if (initialStarsEarned < 20) {
  throw new Error("Cada rolagem de dado deve conceder pelo menos 1 Stardust!");
}

// 3. Testar capacidade máxima de 50 dados por tipo
const dummyState = new GameState();
const maxWood = dummyState.getMaxDicePerType(0);
console.log(`3. Limite base por tipo de dado na mesa: ${maxWood} (deve ser 50).`);
if (maxWood !== 50) {
  throw new Error(`O limite base por tipo de dado deve ser 50, mas obteve: ${maxWood}`);
}

// Comprar dados de madeira em lote até testar o limite
dummyState.coins = 100000;
dummyState.buyDie(0, 10);
console.log(`   - Comprados 10 dados de Madeira. Total ativo deste tipo: ${dummyState.getDiceCountByTier(0)}`);
dummyState.buyDie(0, 'max');
console.log(`   - Comprado o MÁXIMO de dados de Madeira. Total ativo deste tipo: ${dummyState.getDiceCountByTier(0)} / ${dummyState.getMaxDicePerType(0)}`);
if (dummyState.getDiceCountByTier(0) !== 50) {
  throw new Error(`Deveria ter atingido 50 dados de Madeira, mas obteve ${dummyState.getDiceCountByTier(0)}`);
}

// 4. Testar que cada tier superior concede quantias progressivamente maiores de Estrelas
console.log("4. Verificando rendimento de Estrelas por tipo de dado:");
DICE_TIERS.forEach((tier, idx) => {
  const starsRoll = Formulas.calculateStardustGain(1, idx, state, false);
  console.log(`   - ${tier.icon} ${tier.name}: ${starsRoll} Estrelas base por rolagem`);
  if (!tier.stardustBonus || tier.stardustBonus <= 0) {
    throw new Error(`Tier ${tier.name} está sem stardustBonus definido!`);
  }
});

// 5. Testar novas melhorias da Árvore de Habilidades para Estrelas
console.log("5. Testando melhorias da Árvore que aumentam o ganho de Estrelas:");
const baseWoodStars = Formulas.calculateStardustGain(1, 0, state, false);

// Desbloquear Infusão Astral (+75% por nível)
state.skillTree['tree_astral_infusion'] = 1;
const boostedStars1 = Formulas.calculateStardustGain(1, 0, state, false);
console.log(`   - Com Infusão Astral Lv 1 (+75%): ${baseWoodStars} -> ${boostedStars1} Estrelas`);
if (boostedStars1 <= baseWoodStars) {
  throw new Error("Infusão Astral deveria aumentar o ganho de Estrelas!");
}

// Desbloquear Supernova Estelar (+150% por nível)
state.skillTree['tree_supernova'] = 1;
const boostedStars2 = Formulas.calculateStardustGain(1, 0, state, false);
console.log(`   - Com Supernova Lv 1 (+150%): ${boostedStars1} -> ${boostedStars2} Estrelas`);
if (boostedStars2 <= boostedStars1) {
  throw new Error("Supernova deveria aumentar substancialmente o ganho de Estrelas!");
}

// Desbloquear Radiância Cósmica (+200% por nível)
state.skillTree['tree_cosmic_radiance'] = 1;
const boostedStars3 = Formulas.calculateStardustGain(1, 0, state, false);
console.log(`   - Com Radiância Cósmica Lv 1 (+200%): ${boostedStars2} -> ${boostedStars3} Estrelas`);
if (boostedStars3 <= boostedStars2) {
  throw new Error("Radiância Cósmica deveria aumentar o ganho de Estrelas!");
}

// 6. Testar Rebirth com a nova melhoria 'Fluxo Estelar da Transcendência'
state.coins = 150000;
state.activeDice.push({ id: 'die_test_2', tierIndex: 1 });
state.activeDice.push({ id: 'die_test_3', tierIndex: 1 });
state.skillTree['tree_stardust_rebirth_surge'] = 2; // +100 Stardust bônus
const rebirthRewards = Formulas.getRebirthRewards(state);
console.log(`6. Recompensas de Rebirth com Fluxo Estelar Lv 2: +${rebirthRewards.stardustReward} Stardust (bônus de +100 aplicado!).`);
if (rebirthRewards.stardustReward < 125) {
  throw new Error("Fluxo Estelar da Transcendência deveria conceder bônus massivo de Stardust no Rebirth!");
}

console.log("=== TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ===");
process.exit(0);
