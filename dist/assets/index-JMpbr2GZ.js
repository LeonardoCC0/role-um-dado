(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`wood`,name:`Dado de Madeira`,multiplier:1,baseCost:0,color:`#b58863`,pipColor:`#4a2e18`,icon:`🪵`},{id:`bronze`,name:`Dado de Bronze`,multiplier:2.5,baseCost:250,color:`#cd7f32`,pipColor:`#3a200a`,icon:`🥉`},{id:`iron`,name:`Dado de Ferro`,multiplier:6,baseCost:1500,color:`#a19d94`,pipColor:`#2b2a28`,icon:`⚙️`},{id:`silver`,name:`Dado de Prata`,multiplier:15,baseCost:8e3,color:`#e0e6ed`,pipColor:`#1e293b`,icon:`🥈`},{id:`gold`,name:`Dado de Ouro`,multiplier:40,baseCost:45e3,color:`#fbbf24`,pipColor:`#78350f`,icon:`🥇`},{id:`diamond`,name:`Dado de Diamante`,multiplier:120,baseCost:25e4,color:`#38bdf8`,pipColor:`#0369a1`,icon:`💎`},{id:`emerald`,name:`Dado de Esmeralda`,multiplier:400,baseCost:15e5,color:`#22c55e`,pipColor:`#14532d`,icon:`🟢`},{id:`ruby`,name:`Dado de Rubi`,multiplier:1500,baseCost:1e7,color:`#ef4444`,pipColor:`#7f1d1d`,icon:`🔴`},{id:`obsidian`,name:`Dado de Obsidiana`,multiplier:5e3,baseCost:75e6,color:`#312e81`,pipColor:`#c084fc`,icon:`🟣`},{id:`stardust`,name:`Dado Estelar`,multiplier:2e4,baseCost:5e8,color:`#818cf8`,pipColor:`#ffffff`,icon:`✨`,stardustBonus:1},{id:`cosmic`,name:`Dado Cósmico`,multiplier:1e5,baseCost:5e9,color:`#1e1b4b`,pipColor:`#f43f5e`,icon:`🌌`,darkMatterBonus:1}],t={helperHands:{name:`Mão Ajudante`,desc:`Adiciona mãos que empurram e rolam dados automaticamente.`,baseCost:100,costMult:2.2,maxLevel:10,unit:`Mãos`,icon:`🖐️`},rollPower:{name:`Impulso de Rolagem`,desc:`Aumenta a força e a velocidade com que os dados são jogados.`,baseCost:50,costMult:1.35,maxLevel:50,unit:`Nível`,icon:`⚡`},coinMultiplier:{name:`Multiplicador de Moedas`,desc:`Multiplica todos os ganhos de moedas das rolagens (+15% por nível).`,baseCost:75,costMult:1.4,maxLevel:100,unit:`x`,icon:`💰`},rollFrequency:{name:`Velocidade de Automação`,desc:`Reduz o intervalo entre rolagens automáticas das mãos.`,baseCost:200,costMult:1.5,maxLevel:25,unit:`s`,icon:`⏱️`},critChance:{name:`Chance Crítica`,desc:`Chance de uma rolagem ser crítica e multiplicar o valor por 5x (+1% por nível).`,baseCost:300,costMult:1.6,maxLevel:20,unit:`%`,icon:`🎯`},trayMagnetism:{name:`Gravidade Central`,desc:`Atrai os dados suavemente para o centro da mesa para colidirem mais.`,baseCost:150,costMult:1.45,maxLevel:15,unit:`G`,icon:`🧲`}},n=class{static calculateDiceIncome(t,n,r,i=!1){let a=e[n]||e[0],o=t*10;o*=a.multiplier;let s=1+(r.commonUpgrades?.coinMultiplier||0)*.15;o*=s;let c=r.skillTree||{};c.tree_golden_faces&&(o*=1+c.tree_golden_faces*.5),t===6&&c.tree_lucky_six&&(o*=2+c.tree_lucky_six);let l=r.activeDice?.length||1;if(c.tree_dice_synergy&&l>1&&(o*=1+(l-1)*.15*c.tree_dice_synergy),c.tree_trickle_down&&n>0&&(o*=1+n*.25*c.tree_trickle_down),c.tree_stellar_resonance){let e=Math.min(10,Math.floor(r.stardust/10)*.02*c.tree_stellar_resonance);o*=1+e}if(c.tree_exponential_fortune){let e=r.inventory?.length||l;o*=1+e*.1*c.tree_exponential_fortune}let u=1+(r.rebirths||0)*(c.tree_rebirth_surge?2:1);if(o*=u,i){let e=c.tree_crit_master?10:5;o*=e}let d=r.comboMultiplier||1;return o*=d,Math.round(o)}static checkStardustDrop(t,n,r){let i=e[n]||e[0],a=r.skillTree||{};if(i.stardustBonus)return{dropped:!0,amount:i.stardustBonus};if(!a.tree_stardust_genesis||t!==6)return{dropped:!1,amount:0};let o=.05*a.tree_stardust_genesis;return a.tree_stardust_harvester&&(o+=.07*a.tree_stardust_harvester),a.tree_eternal_wisdom&&r.rebirths>0&&(o*=1.5),Math.random()<o?{dropped:!0,amount:1+(a.tree_stardust_harvester||0)}:{dropped:!1,amount:0}}static checkDarkMatterDrop(t,n,r,i){let a=e[n]||e[0],o=r.skillTree||{};return a.darkMatterBonus?{dropped:!0,amount:a.darkMatterBonus}:o.tree_cosmic_catalyst&&t===6&&i&&Math.random()<.15?{dropped:!0,amount:1}:{dropped:!1,amount:0}}static checkCritical(e){let t=(e.commonUpgrades?.critChance||0)*.01,n=e.skillTree||{};return n.tree_critical_rolls&&(t+=.05*n.tree_critical_rolls),Math.random()<t}static getRebirthRequirements(e){let t=e.rebirths||0,n=(e.skillTree||{}).tree_rebirth_catalyst?.75:1,r=Math.round(1e5*3.5**t*n),i=Math.min(10,2+Math.floor(t*.5)),a=e.coins||0,o=e.activeDice?.length||0,s=a>=r,c=o>=i;return{coinsNeeded:r,diceNeeded:i,currentCoins:a,currentDice:o,coinsMet:s,diceMet:c,canRebirth:s&&c,coinsProgress:Math.min(1,a/r),diceProgress:Math.min(1,o/i)}}static getRebirthRewards(e){let t=(e.rebirths||0)+1,n=(e.skillTree||{}).tree_rebirth_surge?2:1,r=1+t*n;return{nextRebirth:t,currentMultiplier:1+(e.rebirths||0)*n,nextMultiplier:r,multiplierGain:n,stardustReward:15+t*10,gemsReward:5+t*2}}static getCommonUpgradeCost(e,n,r=1){let i=t[e];if(!i)return 0;let a=0;for(let e=0;e<r;e++){let t=n+e;if(t>=i.maxLevel)break;a+=Math.round(i.baseCost*i.costMult**+t)}return a}static getMaxAffordableCommon(e,n,r){let i=t[e];if(!i)return{count:0,cost:0};let a=0,o=0,s=n;for(;s<i.maxLevel;){let e=Math.round(i.baseCost*i.costMult**+s);if(a+e>r)break;a+=e,o++,s++}return{count:o,cost:a}}static formatNumber(e){if(e==null||isNaN(e))return`0`;if(e<1e3)return Math.floor(e).toLocaleString(`pt-BR`);let t=[``,`K`,`M`,`B`,`T`,`Qa`,`Qi`,`Sx`,`Sp`,`Oc`,`No`,`Dc`],n=Math.floor(Math.log10(Math.max(1,e))/3);return n>=t.length?e.toExponential(2):`${(e/10**(n*3)).toFixed(n===0?0:2)} ${t[n]}`}},r={tree_origin:{id:`tree_origin`,name:`Origem dos Dados`,icon:`🎲`,branch:`core`,x:0,y:0,maxLevel:1,costResource:`stardust`,costs:[0],reqs:[],desc:`O ponto focal de onde emana a energia de todos os dados. Desbloqueia os caminhos da Árvore de Habilidades.`,effectText:e=>e>0?`Conexão estelar estabelecida!`:`Clique para sintonizar a árvore.`,isCore:!0},tree_helper_hand_1:{id:`tree_helper_hand_1`,name:`Mão Mecânica I`,icon:`🖐️`,branch:`automation`,x:-60,y:-120,maxLevel:1,costResource:`stardust`,costs:[2],reqs:[`tree_origin`],desc:`Adiciona uma mão mecânica persistente no tabuleiro que empurra e rola os dados a cada 4 segundos.`,effectText:e=>e>0?`+1 Mão Mecânica permanente ativa`:`Desbloqueia a 1ª Mão Mecânica`},tree_greased_joints:{id:`tree_greased_joints`,name:`Engrenagens Lubrificadas`,icon:`⚙️`,branch:`automation`,x:-140,y:-220,maxLevel:3,costResource:`stardust`,costs:[4,10,20],reqs:[`tree_helper_hand_1`],desc:`Melhora os mecanismos das mãos mecânicas, aumentando sua frequência de empurrão em +25% por nível.`,effectText:e=>e>0?`+${e*25}% velocidade nas mãos`:`+25% velocidade nas mãos`},tree_helper_hand_2:{id:`tree_helper_hand_2`,name:`Mão Mecânica II`,icon:`🦾`,branch:`automation`,x:20,y:-220,maxLevel:1,costResource:`stardust`,costs:[8],reqs:[`tree_helper_hand_1`],desc:`Adiciona a 2ª Mão Mecânica permanente à mesa de jogo.`,effectText:e=>e>0?`+2 Mãos Mecânicas ativas`:`Desbloqueia a 2ª Mão Mecânica`},tree_magnetic_palm:{id:`tree_magnetic_palm`,name:`Palma Magnética`,icon:`🧲`,branch:`automation`,x:-140,y:-330,maxLevel:1,costResource:`stardust`,costs:[15],reqs:[`tree_greased_joints`],desc:`As mãos aplicam um impulso magnético suave que direciona os dados de volta para o centro após o toque.`,effectText:e=>e>0?`Alinhamento magnético ativado`:`Direciona dados para o centro`},tree_helper_hand_3:{id:`tree_helper_hand_3`,name:`Mão Mecânica III`,icon:`🤖`,branch:`automation`,x:20,y:-330,maxLevel:1,costResource:`stardust`,costs:[25],reqs:[`tree_helper_hand_2`],desc:`Adiciona a 3ª Mão Mecânica permanente à mesa de jogo.`,effectText:e=>e>0?`+3 Mãos Mecânicas ativas`:`Desbloqueia a 3ª Mão Mecânica`},tree_quantum_hands:{id:`tree_quantum_hands`,name:`Mãos Quânticas`,icon:`✨`,branch:`automation`,x:-60,y:-430,maxLevel:1,costResource:`stardust`,costs:[60],reqs:[`tree_magnetic_palm`,`tree_helper_hand_3`],desc:`As mãos ganham propulsão quântica: 25% de chance de acionar um arremesso com o dobro de força.`,effectText:e=>e>0?`Propulsão quântica ativa`:`25% chance de arremesso duplo`},tree_master_autoroll:{id:`tree_master_autoroll`,name:`Sobrecarga Cinética`,icon:`⚡`,branch:`automation`,x:-60,y:-530,maxLevel:1,costResource:`stardust`,costs:[150],reqs:[`tree_quantum_hands`],desc:`Libera um pulso no tabuleiro a cada 10s que rola todos os dados simultaneamente com valor 2x.`,effectText:e=>e>0?`Pulso cinético automático ativo`:`Pulso cinético 2x a cada 10s`},tree_golden_faces:{id:`tree_golden_faces`,name:`Faces Douradas`,icon:`💰`,branch:`income`,x:130,y:-40,maxLevel:5,costResource:`stardust`,costs:[3,7,15,30,60],reqs:[`tree_origin`],desc:`Aumenta o rendimento base obtido por cada face dos dados em +50% por nível.`,effectText:e=>e>0?`+${e*50}% valor base das faces`:`+50% valor base das faces`},tree_lucky_six:{id:`tree_lucky_six`,name:`Seis da Sorte`,icon:`🍀`,branch:`income`,x:250,y:-90,maxLevel:3,costResource:`stardust`,costs:[6,14,28],reqs:[`tree_golden_faces`],desc:`Rolagens que resultam na face 6 concedem multiplicador extra massivo de moedas.`,effectText:e=>e>0?`Face 6 concede ${2+e}x moedas`:`Face 6 concede 3x moedas`},tree_dice_synergy:{id:`tree_dice_synergy`,name:`Sinergia de Dados`,icon:`🤝`,branch:`income`,x:250,y:30,maxLevel:3,costResource:`stardust`,costs:[10,22,45],reqs:[`tree_golden_faces`],desc:`Cada dado ativo adicional na mesa aumenta a renda de todos os outros dados em +15% por nível.`,effectText:e=>e>0?`+${e*15}% por dado ativo extra`:`+15% por dado ativo extra`},tree_trickle_down:{id:`tree_trickle_down`,name:`Cascata de Riqueza`,icon:`🌊`,branch:`income`,x:370,y:-30,maxLevel:3,costResource:`stardust`,costs:[20,45,90],reqs:[`tree_lucky_six`,`tree_dice_synergy`],desc:`Dados de tiers superiores transferem +25% de bônus cumulativo ao valor de todos os dados.`,effectText:e=>e>0?`+${e*25}% por nível de tier superior`:`+25% por nível de tier superior`},tree_critical_rolls:{id:`tree_critical_rolls`,name:`Rolagem Crítica`,icon:`🎯`,branch:`income`,x:480,y:-80,maxLevel:3,costResource:`stardust`,costs:[35,75,140],reqs:[`tree_trickle_down`],desc:`Concede +5% de chance adicional para qualquer rolagem ser Crítica (5x moedas).`,effectText:e=>e>0?`+${e*5}% chance crítica`:`+5% chance crítica`},tree_crit_master:{id:`tree_crit_master`,name:`Mestre dos Críticos`,icon:`💥`,branch:`income`,x:580,y:-30,maxLevel:1,costResource:`stardust`,costs:[80],reqs:[`tree_critical_rolls`],desc:`Rolagens Críticas agora multiplicam o ganho de moedas por 10x em vez de 5x.`,effectText:e=>e>0?`Críticos multiplicam por 10x`:`Multiplicador Crítico 10x`},tree_exponential_fortune:{id:`tree_exponential_fortune`,name:`Fortuna Exponencial`,icon:`💎`,branch:`income`,x:680,y:0,maxLevel:1,costResource:`stardust`,costs:[200],reqs:[`tree_crit_master`],desc:`Multiplica todos os ganhos de moedas por +10% para cada dado já adquirido na sua coleção.`,effectText:e=>e>0?`Rendimento multiplicado por dados obtidos`:`+10% renda por dado na coleção`},tree_stardust_genesis:{id:`tree_stardust_genesis`,name:`Gênese Estelar`,icon:`✨`,branch:`stardust`,x:120,y:130,maxLevel:3,costResource:`stardust`,costs:[5,12,25],reqs:[`tree_origin`],desc:`Desbloqueia a capacidade dos dados normais de gerarem Stardust ✨ ao caírem na face 6.`,effectText:e=>e>0?`${e*5}% chance de Stardust na face 6`:`5% chance de Stardust na face 6`},tree_shooting_stars:{id:`tree_shooting_stars`,name:`Estrelas Cadentes`,icon:`🌠`,branch:`stardust`,x:230,y:170,maxLevel:1,costResource:`stardust`,costs:[15],reqs:[`tree_stardust_genesis`],desc:`Estrelas cadentes caem na mesa periodicamente. Clique nelas para coletar Stardust imediato.`,effectText:e=>e>0?`Estrelas cadentes ativas na mesa`:`Gera estrelas cadentes clicáveis`},tree_stardust_harvester:{id:`tree_stardust_harvester`,name:`Colheitadeira Estelar`,icon:`🔭`,branch:`stardust`,x:230,y:270,maxLevel:2,costResource:`stardust`,costs:[30,65],reqs:[`tree_stardust_genesis`],desc:`Aumenta a taxa de drop de Stardust em +7% e concede +1 Stardust a cada drop.`,effectText:e=>e>0?`+${e*7}% chance e +${e} Stardust`:`+7% chance e +1 Stardust`},tree_stellar_resonance:{id:`tree_stellar_resonance`,name:`Ressonância Estelar`,icon:`🔮`,branch:`stardust`,x:350,y:220,maxLevel:5,costResource:`stardust`,costs:[45,90,160,280,450],reqs:[`tree_shooting_stars`,`tree_stardust_harvester`],desc:`A energia do Stardust guardado acelera a economia: +2% de renda para cada 10 Stardust mantidos.`,effectText:e=>e>0?`+${e*2}% renda a cada 10 Stardust`:`+2% renda a cada 10 Stardust`},tree_cosmic_catalyst:{id:`tree_cosmic_catalyst`,name:`Catalisador de Matéria Escura`,icon:`🌌`,branch:`stardust`,x:470,y:300,maxLevel:1,costResource:`stardust`,costs:[100],reqs:[`tree_stellar_resonance`],desc:`Desbloqueia a síntese de Matéria Escura 🌌 ao conseguir rolagens críticas na face 6.`,effectText:e=>e>0?`Extração de Matéria Escura ativa`:`Desbloqueia Matéria Escura`},tree_dark_matter_infusion:{id:`tree_dark_matter_infusion`,name:`Infusão Escura`,icon:`⚛️`,branch:`stardust`,x:580,y:300,maxLevel:3,costResource:`darkMatter`,costs:[5,12,25],reqs:[`tree_cosmic_catalyst`],desc:`Utiliza Matéria Escura concentrada para conceder +500% de multiplicador global por nível.`,effectText:e=>e>0?`+${e*500}% multiplicador global`:`+500% multiplicador global`},tree_singularity:{id:`tree_singularity`,name:`Singularidade dos Dados`,icon:`🌀`,branch:`stardust`,x:700,y:300,maxLevel:1,costResource:`darkMatter`,costs:[20],reqs:[`tree_dark_matter_infusion`],desc:`Cria uma singularidade no centro do tabuleiro, triplicando todos os recursos obtidos para sempre.`,effectText:e=>e>0?`3x em todos os recursos!`:`3x todos os ganhos (Moedas, Stardust)`},tree_expanded_tray:{id:`tree_expanded_tray`,name:`Mesa Ampliada`,icon:`📐`,branch:`physics`,x:-130,y:40,maxLevel:1,costResource:`stardust`,costs:[3],reqs:[`tree_origin`],desc:`Expande a área utilizável da mesa 3D em +25%, permitindo mais rolagem e menos travamentos.`,effectText:e=>e>0?`Mesa expandida em +25%`:`+25% de área na mesa 3D`},tree_bouncier_walls:{id:`tree_bouncier_walls`,name:`Bordas Elásticas`,icon:`🏓`,branch:`physics`,x:-240,y:80,maxLevel:2,costResource:`stardust`,costs:[8,18],reqs:[`tree_expanded_tray`],desc:`Aumenta a restituição das paredes da mesa, fazendo os dados ricochetearem com mais energia.`,effectText:e=>e>0?`+${e*35}% elasticidade nas bordas`:`+35% elasticidade nas bordas`},tree_extra_slot_1:{id:`tree_extra_slot_1`,name:`Slot Adicional I`,icon:`📦`,branch:`physics`,x:-240,y:-40,maxLevel:1,costResource:`stardust`,costs:[15],reqs:[`tree_expanded_tray`],desc:`Aumenta o limite máximo de dados ativos simultaneamente na mesa em +2.`,effectText:e=>`+2 dados ativos máximos`},tree_heavy_weight:{id:`tree_heavy_weight`,name:`Massa Cinética`,icon:`🧱`,branch:`physics`,x:-360,y:20,maxLevel:1,costResource:`stardust`,costs:[30],reqs:[`tree_bouncier_walls`,`tree_extra_slot_1`],desc:`Aumenta o impacto entre dados. Quando dois dados colidem, ambos acumulam bônus de rolagem.`,effectText:e=>e>0?`Colisão cinemática ativa`:`Bônus cinético em colisões`},tree_extra_slot_2:{id:`tree_extra_slot_2`,name:`Slot Adicional II`,icon:`🗃️`,branch:`physics`,x:-470,y:-20,maxLevel:1,costResource:`stardust`,costs:[75],reqs:[`tree_heavy_weight`],desc:`Aumenta o limite máximo de dados ativos simultaneamente na mesa em +3.`,effectText:e=>`+3 dados ativos máximos`},tree_celestial_prism:{id:`tree_celestial_prism`,name:`Prisma Celestial`,icon:`🌈`,branch:`physics`,x:-590,y:10,maxLevel:1,costResource:`stardust`,costs:[180],reqs:[`tree_extra_slot_2`],desc:`Os dados ganham uma aura de arco-íris: dados que pararem próximos multiplicam o valor um do outro.`,effectText:e=>e>0?`Aura prismática ativada`:`Aura de proximidade 2x`},tree_rebirth_catalyst:{id:`tree_rebirth_catalyst`,name:`Catalisador de Rebirth`,icon:`🔄`,branch:`rebirth`,x:-80,y:150,maxLevel:1,costResource:`stardust`,costs:[5],reqs:[`tree_origin`],desc:`Reduz o requisito de moedas para alcançar o Rebirth em 25%.`,effectText:e=>e>0?`-25% requisito de moedas no Rebirth`:`-25% custo em moedas`},tree_legacy_retention:{id:`tree_legacy_retention`,name:`Retenção de Legado`,icon:`🛡️`,branch:`rebirth`,x:-180,y:240,maxLevel:3,costResource:`stardust`,costs:[20,50,100],reqs:[`tree_rebirth_catalyst`],desc:`Preserva 30% dos níveis dos seus Upgrades Comuns de moedas após cada Rebirth por nível.`,effectText:e=>e>0?`Mantém ${e*30}% dos Upgrades Comuns`:`Mantém 30% dos Upgrades Comuns`},tree_rebirth_surge:{id:`tree_rebirth_surge`,name:`Surto de Rebirth`,icon:`🌟`,branch:`rebirth`,x:-80,y:310,maxLevel:1,costResource:`stardust`,costs:[40],reqs:[`tree_rebirth_catalyst`],desc:`Dobra o multiplicador concedido por cada Rebirth de +100% (+1x) para +200% (+2x).`,effectText:e=>e>0?`+200% por Rebirth (+2x)`:`Dobra benefício do Rebirth (+2x)`},tree_golden_start:{id:`tree_golden_start`,name:`Início Dourado`,icon:`👑`,branch:`rebirth`,x:-220,y:360,maxLevel:1,costResource:`stardust`,costs:[90],reqs:[`tree_legacy_retention`,`tree_rebirth_surge`],desc:`Comece imediatamente cada novo ciclo de Rebirth com $10.000 moedas e 2 Dados de Bronze ativos.`,effectText:e=>e>0?`Início acelerado com $10.000 e 2 Bronze`:`Comece com $10k e 2 Bronze`},tree_eternal_wisdom:{id:`tree_eternal_wisdom`,name:`Sabedoria Eterna`,icon:`📜`,branch:`rebirth`,x:-160,y:470,maxLevel:1,costResource:`stardust`,costs:[200],reqs:[`tree_golden_start`],desc:`Aumenta permanentemente a chance de Stardust em +50% e o ganho de Gemas em +25% após qualquer Rebirth.`,effectText:e=>e>0?`+50% Stardust e +25% Gemas permanentes`:`+50% Stardust e +25% Gemas`}},i=new class{constructor(){this.ctx=null,this.muted=!1,this.volume=.5,this.initialized=!1}init(){if(!this.initialized)try{let e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e,this.initialized=!0)}catch(e){console.warn(`Web Audio API not supported`,e)}}ensureContext(){this.initialized||this.init(),this.ctx&&this.ctx.state===`suspended`&&this.ctx.resume()}setMuted(e){this.muted=e}setVolume(e){this.volume=Math.max(0,Math.min(1,e))}playDiceRattle(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=3+Math.floor(Math.random()*3);for(let t=0;t<e;t++){let e=t*(.04+Math.random()*.03);setTimeout(()=>{if(!this.ctx)return;let e=this.ctx.createOscillator(),t=this.ctx.createGain(),n=this.ctx.createBiquadFilter();e.type=`triangle`,e.frequency.setValueAtTime(140+Math.random()*120,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(50,this.ctx.currentTime+.05),n.type=`lowpass`,n.frequency.setValueAtTime(600,this.ctx.currentTime);let r=this.ctx.currentTime;t.gain.setValueAtTime(this.volume*.25,r),t.gain.exponentialRampToValueAtTime(.001,r+.06),e.connect(n),n.connect(t),t.connect(this.ctx.destination),e.start(r),e.stop(r+.07)},e*1e3)}}playDiceLand(e=1,t=!1){if(this.muted||(this.ensureContext(),!this.ctx))return;let n=this.ctx.currentTime,r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=`sine`;let a=t?880:e===6?660:220+e*40;if(r.frequency.setValueAtTime(a,n),r.frequency.exponentialRampToValueAtTime(a*.5,n+.12),i.gain.setValueAtTime(this.volume*(t?.4:.2),n),i.gain.exponentialRampToValueAtTime(.001,n+.15),r.connect(i),i.connect(this.ctx.destination),r.start(n),r.stop(n+.16),e===6||t){let e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type=`triangle`,e.frequency.setValueAtTime(a*2,n+.03),e.frequency.exponentialRampToValueAtTime(a*3,n+.2),t.gain.setValueAtTime(this.volume*.2,n+.03),t.gain.exponentialRampToValueAtTime(.001,n+.25),e.connect(t),t.connect(this.ctx.destination),e.start(n+.03),e.stop(n+.26)}}playCoin(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createOscillator(),r=this.ctx.createGain();t.type=`sine`,t.frequency.setValueAtTime(987.77,e),t.frequency.setValueAtTime(1318.51,e+.08),n.type=`triangle`,n.frequency.setValueAtTime(493.885,e),n.frequency.setValueAtTime(659.255,e+.08),r.gain.setValueAtTime(this.volume*.25,e),r.gain.exponentialRampToValueAtTime(.001,e+.35),t.connect(r),n.connect(r),r.connect(this.ctx.destination),t.start(e),n.start(e),t.stop(e+.36),n.stop(e+.36)}playPurchase(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sine`,t.frequency.setValueAtTime(440,e),t.frequency.exponentialRampToValueAtTime(880,e+.1),n.gain.setValueAtTime(this.volume*.3,e),n.gain.exponentialRampToValueAtTime(.001,e+.2),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.21)}playStardust(){this.muted||(this.ensureContext(),this.ctx&&[523.25,659.25,783.99,1046.5,1318.51].forEach((e,t)=>{let n=this.ctx.currentTime+t*.05,r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=`sine`,r.frequency.setValueAtTime(e,n),i.gain.setValueAtTime(this.volume*.2,n),i.gain.exponentialRampToValueAtTime(.001,n+.25),r.connect(i),i.connect(this.ctx.destination),r.start(n),r.stop(n+.26)}))}playRebirth(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`triangle`,t.frequency.setValueAtTime(60,e),t.frequency.exponentialRampToValueAtTime(120,e+.5),t.frequency.exponentialRampToValueAtTime(40,e+1.2),n.gain.setValueAtTime(this.volume*.5,e),n.gain.exponentialRampToValueAtTime(.001,e+1.2),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+1.25),[261.63,329.63,392,523.25,659.25,783.99].forEach((t,n)=>{let r=e+.15+n*.08,i=this.ctx.createOscillator(),a=this.ctx.createGain();i.type=`sine`,i.frequency.setValueAtTime(t,r),a.gain.setValueAtTime(this.volume*.2,r),a.gain.exponentialRampToValueAtTime(.001,r+1.5),i.connect(a),a.connect(this.ctx.destination),i.start(r),i.stop(r+1.55)})}playClick(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sine`,t.frequency.setValueAtTime(600,e),t.frequency.exponentialRampToValueAtTime(300,e+.03),n.gain.setValueAtTime(this.volume*.15,e),n.gain.exponentialRampToValueAtTime(.001,e+.04),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.05)}},a=`roll_a_dice_save_v2`,o=new class{constructor(){this.listeners=new Set,this.initDefaultState(),this.load(),this.setupAutoSave()}initDefaultState(){this.coins=0,this.stardust=3,this.gems=0,this.darkMatter=0,this.rebirths=0,this.comboMultiplier=1,this.comboTimer=0,this.activeDice=[{id:`die_`+Date.now(),tierIndex:0}],this.inventory=[0],this.commonUpgrades={helperHands:0,rollPower:0,coinMultiplier:0,rollFrequency:0,critChance:0,trayMagnetism:0},this.skillTree={tree_origin:1},this.stats={totalRolls:0,totalCoinsEarned:0,totalStardustEarned:0,totalGemsEarned:0,totalDarkMatterEarned:0,highestRollIncome:0,criticalRollsCount:0,playTimeSeconds:0},this.redeemedCodes=[],this.achievements={},this.settings={soundMuted:!1,soundVolume:.5,autoRoll:!1,autoRollInterval:4,graphicsQuality:`high`}}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(let e of this.listeners)try{e(this)}catch(e){console.error(`State listener error:`,e)}}addCoins(e){e<=0||(this.coins+=e,this.stats.totalCoinsEarned+=e,e>this.stats.highestRollIncome&&(this.stats.highestRollIncome=e),this.notify())}addStardust(e){e<=0||(this.stardust+=e,this.stats.totalStardustEarned+=e,i.playStardust(),this.notify())}addGems(e){e<=0||(this.gems+=e,this.stats.totalGemsEarned+=e,this.notify())}addDarkMatter(e){e<=0||(this.darkMatter+=e,this.stats.totalDarkMatterEarned+=e,this.notify())}canAfford(e,t){return e===`coins`?this.coins>=t:e===`stardust`?this.stardust>=t:e===`gems`?this.gems>=t:e===`darkMatter`&&this.darkMatter>=t}spendResource(e,t){return this.canAfford(e,t)?(e===`coins`&&(this.coins-=t),e===`stardust`&&(this.stardust-=t),e===`gems`&&(this.gems-=t),e===`darkMatter`&&(this.darkMatter-=t),this.notify(),!0):!1}getMaxActiveDice(){let e=5;return this.skillTree.tree_extra_slot_1&&(e+=2),this.skillTree.tree_extra_slot_2&&(e+=3),e}buyCommonUpgrade(e,r=1){let a=t[e];if(!a)return!1;let o=this.commonUpgrades[e]||0;if(o>=a.maxLevel)return!1;let s=r;if(r===`max`&&(s=n.getMaxAffordableCommon(e,o,this.coins).count),s<=0)return!1;let c=n.getCommonUpgradeCost(e,o,s);return this.spendResource(`coins`,c)?(this.commonUpgrades[e]=o+s,i.playPurchase(),this.notify(),this.save(),!0):!1}buySkillTreeNode(e){let t=r[e];if(!t)return{success:!1,reason:`Nó inexistente`};let n=this.skillTree[e]||0;if(n>=t.maxLevel)return{success:!1,reason:`Nível máximo atingido`};for(let e of t.reqs)if(!this.skillTree[e]||this.skillTree[e]<=0)return{success:!1,reason:`Requisitos prévios não atendidos`};let a=t.costs[n],o=t.costResource||`stardust`;return this.canAfford(o,a)?(this.spendResource(o,a),this.skillTree[e]=n+1,i.playPurchase(),this.notify(),this.save(),{success:!0}):{success:!1,reason:`Saldo insuficiente de ${o===`darkMatter`?`Matéria Escura`:`Stardust`}`}}buyDie(t){let n=e[t];if(!n)return!1;let r=this.getMaxActiveDice();if(this.activeDice.length>=r)return!1;let a=n.baseCost;return this.spendResource(`coins`,a)?(this.activeDice.push({id:`die_`+Date.now()+`_`+Math.floor(Math.random()*1e3),tierIndex:t}),this.inventory.includes(t)||this.inventory.push(t),i.playPurchase(),this.notify(),this.save(),!0):!1}removeDie(e){return this.activeDice.length<=1?!1:e>=0&&e<this.activeDice.length&&(this.activeDice.splice(e,1),this.notify(),this.save(),!0)}performRebirth(){if(!n.getRebirthRequirements(this).canRebirth)return{success:!1,reason:`Requisitos não cumpridos`};let e=n.getRebirthRewards(this),r=(this.skillTree.tree_legacy_retention||0)*.3,a={};for(let e of Object.keys(t)){let t=this.commonUpgrades[e]||0;a[e]=Math.floor(t*r)}let o=!!this.skillTree.tree_golden_start,s=o?1e4:0,c=o?[{id:`die_`+Date.now()+`_1`,tierIndex:1},{id:`die_`+Date.now()+`_2`,tierIndex:1}]:[{id:`die_`+Date.now()+`_1`,tierIndex:0}];return this.rebirths+=1,this.coins=s,this.activeDice=c,this.commonUpgrades=a,this.comboMultiplier=1,this.stardust+=e.stardustReward,this.stats.totalStardustEarned+=e.stardustReward,this.gems+=e.gemsReward,this.stats.totalGemsEarned+=e.gemsReward,i.playRebirth(),this.notify(),this.save(),{success:!0,rebirths:this.rebirths,rewards:e}}redeemCode(e){let t=(e||``).trim().toLowerCase();return this.redeemedCodes.includes(t)?{success:!1,message:`Código já resgatado!`}:t===`release`?(this.addCoins(6e3),this.redeemedCodes.push(t),this.save(),{success:!0,message:`Código resgatado: +6.000 Moedas!`}):t===`rolladice`?(this.addCoins(4e3),this.addStardust(5),this.redeemedCodes.push(t),this.save(),{success:!0,message:`Código resgatado: +4.000 Moedas e +5 Stardust ✨!`}):t===`stardust`?(this.addStardust(15),this.redeemedCodes.push(t),this.save(),{success:!0,message:`Código resgatado: +15 Stardust ✨!`}):t===`gems`?(this.addGems(10),this.redeemedCodes.push(t),this.save(),{success:!0,message:`Código resgatado: +10 Gemas 💎!`}):{success:!1,message:`Código inválido ou expirado.`}}save(){try{let e={coins:this.coins,stardust:this.stardust,gems:this.gems,darkMatter:this.darkMatter,rebirths:this.rebirths,activeDice:this.activeDice,inventory:this.inventory,commonUpgrades:this.commonUpgrades,skillTree:this.skillTree,stats:this.stats,redeemedCodes:this.redeemedCodes,achievements:this.achievements,settings:this.settings};localStorage.setItem(a,JSON.stringify(e))}catch(e){console.warn(`Failed to save game to localStorage`,e)}}load(){try{let e=localStorage.getItem(a);if(!e)return;let t=JSON.parse(e);t&&(this.coins=Number(t.coins)||0,this.stardust=Number(t.stardust)||0,this.gems=Number(t.gems)||0,this.darkMatter=Number(t.darkMatter)||0,this.rebirths=Number(t.rebirths)||0,Array.isArray(t.activeDice)&&t.activeDice.length>0&&(this.activeDice=t.activeDice),Array.isArray(t.inventory)&&(this.inventory=t.inventory),t.commonUpgrades&&(this.commonUpgrades={...this.commonUpgrades,...t.commonUpgrades}),t.skillTree&&(this.skillTree={...this.skillTree,...t.skillTree}),t.stats&&(this.stats={...this.stats,...t.stats}),Array.isArray(t.redeemedCodes)&&(this.redeemedCodes=t.redeemedCodes),t.achievements&&(this.achievements=t.achievements),t.settings&&(this.settings={...this.settings,...t.settings},i.setMuted(this.settings.soundMuted),i.setVolume(this.settings.soundVolume)))}catch(e){console.error(`Failed to load game save`,e)}}setupAutoSave(){setInterval(()=>{this.stats.playTimeSeconds+=5,this.save()},5e3)}resetAll(){localStorage.removeItem(a),this.initDefaultState(),this.notify(),i.playClick()}},s={1:[[0,0]],2:[[-.45,-.45],[.45,.45]],3:[[-.45,-.45],[0,0],[.45,.45]],4:[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]],5:[[-.45,-.45],[.45,-.45],[0,0],[-.45,.45],[.45,.45]],6:[[-.45,-.5],[.45,-.5],[-.45,0],[.45,0],[-.45,.5],[.45,.5]]},c=class{constructor(e,t){this.container=e,this.gameState=t,this.canvas=document.createElement(`canvas`),this.canvas.className=`board-2d-canvas`,this.ctx=this.canvas.getContext(`2d`),this.container.appendChild(this.canvas),this.dice=[],this.particles=[],this.floatingTexts=[],this.helperHands=[],this.shootingStars=[],this.starSpawnTimer=0,this.mouseX=0,this.mouseY=0,this.mousePrevX=0,this.mousePrevY=0,this.mouseVx=0,this.mouseVy=0,this.isMouseOnBoard=!1,this.lastRattleTime=0,this.arena={x:0,y:0,width:800,height:550,radius:20},this.dieSize=64,this.setupResize(),this.setupMouseEvents(),this.syncWithState()}setupResize(){let e=()=>{let e=this.container.getBoundingClientRect(),t=Math.min(window.devicePixelRatio||1,2);this.width=e.width,this.height=e.height,this.canvas.width=this.width*t,this.canvas.height=this.height*t,this.canvas.style.width=`${this.width}px`,this.canvas.style.height=`${this.height}px`,this.ctx.scale(t,t),this.updateArenaBounds()};window.addEventListener(`resize`,e),e()}updateArenaBounds(){let e=this.gameState.skillTree.tree_expanded_tray?1.15:1,t=Math.min(this.width*.92,920*e),n=Math.min(this.height*.84,620*e);this.arena.width=t,this.arena.height=n,this.arena.x=(this.width-t)/2,this.arena.y=(this.height-n)/2;for(let e of this.dice)e.x=Math.max(this.arena.x+this.dieSize/2,Math.min(this.arena.x+this.arena.width-this.dieSize/2,e.x)),e.y=Math.max(this.arena.y+this.dieSize/2,Math.min(this.arena.y+this.arena.height-this.dieSize/2,e.y))}setupMouseEvents(){let e=(e,t)=>{let n=this.canvas.getBoundingClientRect(),r=e-n.left,i=t-n.top;this.mouseVx=(r-this.mousePrevX)*45,this.mouseVy=(i-this.mousePrevY)*45,this.mousePrevX=this.mouseX,this.mousePrevY=this.mouseY,this.mouseX=r,this.mouseY=i,this.isMouseOnBoard=!0,this.checkMouseDiceCollision(),this.checkMouseStarCollision()};this.canvas.addEventListener(`mousemove`,t=>{e(t.clientX,t.clientY)}),this.canvas.addEventListener(`mouseenter`,e=>{let t=this.canvas.getBoundingClientRect();this.mouseX=e.clientX-t.left,this.mouseY=e.clientY-t.top,this.mousePrevX=this.mouseX,this.mousePrevY=this.mouseY,this.isMouseOnBoard=!0}),this.canvas.addEventListener(`mouseleave`,()=>{this.isMouseOnBoard=!1,this.mouseVx=0,this.mouseVy=0}),this.canvas.addEventListener(`touchstart`,e=>{if(e.touches.length>0){let t=e.touches[0],n=this.canvas.getBoundingClientRect();this.mouseX=t.clientX-n.left,this.mouseY=t.clientY-n.top,this.mousePrevX=this.mouseX,this.mousePrevY=this.mouseY,this.isMouseOnBoard=!0}},{passive:!0}),this.canvas.addEventListener(`touchmove`,t=>{if(t.touches.length>0){let n=t.touches[0];e(n.clientX,n.clientY)}},{passive:!0}),this.canvas.addEventListener(`touchend`,()=>{this.isMouseOnBoard=!1})}checkMouseDiceCollision(){let e=1+(this.gameState.commonUpgrades?.rollPower||0)*.12,t=this.dieSize*.75;for(let n of this.dice){let r=n.x-this.mouseX,a=n.y-this.mouseY;if(Math.hypot(r,a)<t){let t=this.mouseVx*.35*e,o=this.mouseVy*.35*e;if(Math.hypot(t,o)<180){let n=Math.atan2(a,r)||Math.random()*Math.PI*2,i=(240+Math.random()*120)*e;t+=Math.cos(n)*i,o+=Math.sin(n)*i}n.vx=Math.max(-800,Math.min(800,n.vx+t)),n.vy=Math.max(-800,Math.min(800,n.vy+o)),n.vRot+=((Math.random()-.5)*16+(t-o)*.02)*e,n.isRolling=!0,n.hasScored=!1,n.settleTimer=0;let s=performance.now();s-this.lastRattleTime>90&&(i.playDiceRattle(),this.lastRattleTime=s),this.spawnSparks(n.x,n.y,4,`#fbbf24`)}}}checkMouseStarCollision(){for(let e=this.shootingStars.length-1;e>=0;e--){let t=this.shootingStars[e];Math.hypot(t.x-this.mouseX,t.y-this.mouseY)<t.radius*1.5&&this.collectStar(e)}}collectStar(e){let t=this.shootingStars.splice(e,1)[0];if(!t)return;let n=2+Math.floor(Math.random()*4);this.gameState.addStardust(n),this.spawnFloatingText(t.x,t.y,`✨ +${n} STARDUST!`,`#60a5fa`,1.2),this.spawnSparks(t.x,t.y,16,`#60a5fa`),i.playStardust()}syncWithState(){let e=this.gameState.activeDice||[],t=new Set(e.map(e=>e.id));this.dice=this.dice.filter(e=>t.has(e.id)),e.forEach((t,n)=>{let r=this.dice.find(e=>e.id===t.id);if(r)r.tierIndex=t.tierIndex;else{let r=n/Math.max(1,e.length)*Math.PI*2,i=this.arena.x+this.arena.width/2+Math.cos(r)*(this.arena.width*.25),a=this.arena.y+this.arena.height/2+Math.sin(r)*(this.arena.height*.25);this.dice.push({id:t.id,tierIndex:t.tierIndex,x:i,y:a,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40,rotation:Math.random()*Math.PI*2,vRot:(Math.random()-.5)*4,face:1+Math.floor(Math.random()*6),displayFace:1+Math.floor(Math.random()*6),isRolling:!1,hasScored:!0,settleTimer:0,scale:1})}}),this.syncHelperHands()}syncHelperHands(){let e=this.gameState.commonUpgrades?.helperHands||0,t=this.gameState.skillTree||{};for(t.tree_helper_hand_1&&(e+=1),t.tree_helper_hand_2&&(e+=1),t.tree_helper_hand_3&&(e+=1);this.helperHands.length>e;)this.helperHands.pop();for(;this.helperHands.length<e;){let e=this.helperHands.length;this.helperHands.push({id:`hand_`+e,x:this.arena.x+Math.random()*this.arena.width,y:this.arena.y+Math.random()*this.arena.height,vx:0,vy:0,targetDie:null,swipeTimer:Math.random()*2,angle:0})}}rollAll(e=1){i.playDiceRattle();let t=(1+(this.gameState.commonUpgrades?.rollPower||0)*.12)*e;for(let e of this.dice){let n=Math.random()*Math.PI*2,r=(280+Math.random()*200)*t;e.vx=Math.cos(n)*r,e.vy=Math.sin(n)*r,e.vRot=(Math.random()-.5)*18*t,e.isRolling=!0,e.hasScored=!1,e.settleTimer=0}}spawnSparks(e,t,n=8,r=`#fbbf24`){for(let i=0;i<n;i++){let n=Math.random()*Math.PI*2,i=40+Math.random()*120;this.particles.push({x:e,y:t,vx:Math.cos(n)*i,vy:Math.sin(n)*i,color:r,radius:2+Math.random()*3,life:1,decay:1.8+Math.random()*1.5})}}spawnFloatingText(e,t,n,r=`#4ade80`,i=1){this.floatingTexts.push({x:e+(Math.random()*30-15),y:t-10,text:n,color:r,size:i,vy:-55,life:1,decay:.85})}update(e){this.updateArenaBounds();let t=this.gameState.commonUpgrades?.rollFrequency||0,n=this.gameState.skillTree?.tree_greased_joints||0,r=Math.max(.8,3.5-t*.1-n*.4);for(let n of this.helperHands)if(n.swipeTimer+=e,(!n.targetDie||n.swipeTimer>=r)&&(n.swipeTimer=0,this.dice.length>0&&(n.targetDie=this.dice[Math.floor(Math.random()*this.dice.length)])),n.targetDie){let r=n.targetDie.x-n.x,a=n.targetDie.y-n.y,o=Math.hypot(r,a);n.angle=Math.atan2(a,r);let s=260+t*15;if(o>15)n.vx=r/o*s,n.vy=a/o*s,n.x+=n.vx*e,n.y+=n.vy*e;else{let e=this.gameState.skillTree.tree_quantum_hands&&Math.random()<.25?2.2:1,t=n.angle+(Math.random()-.5)*.8,r=(350+Math.random()*150)*e;n.targetDie.vx+=Math.cos(t)*r,n.targetDie.vy+=Math.sin(t)*r,n.targetDie.vRot+=(Math.random()-.5)*16,n.targetDie.isRolling=!0,n.targetDie.hasScored=!1,n.targetDie.settleTimer=0,i.playDiceRattle(),this.spawnSparks(n.targetDie.x,n.targetDie.y,5,`#60a5fa`),n.targetDie=null,n.swipeTimer=0}}this.gameState.skillTree.tree_shooting_stars&&(this.starSpawnTimer+=e,this.starSpawnTimer>=20&&this.shootingStars.length<2&&(this.starSpawnTimer=0,this.shootingStars.push({x:this.arena.x+40+Math.random()*(this.arena.width-80),y:this.arena.y+40+Math.random()*(this.arena.height-80),radius:18,rotation:0,life:14}),i.playStardust()));for(let t=this.shootingStars.length-1;t>=0;t--){let n=this.shootingStars[t];n.life-=e,n.rotation+=e*3,n.life<=0&&this.shootingStars.splice(t,1)}let a=this.gameState.commonUpgrades?.trayMagnetism||0,o=.65+(this.gameState.skillTree?.tree_bouncier_walls||0)*.12,s=.982,c=this.dieSize/2,l=this.arena.x+this.arena.width/2,u=this.arena.y+this.arena.height/2;for(let t=0;t<this.dice.length;t++){let n=this.dice[t];if(a>0){let t=l-n.x,r=u-n.y,i=Math.hypot(t,r);if(i>40){let o=18*a;n.vx+=t/i*o*e,n.vy+=r/i*o*e}}n.x+=n.vx*e,n.y+=n.vy*e,n.rotation+=n.vRot*e,n.vx*=s,n.vy*=s,n.vRot*=.975;let r=Math.hypot(n.vx,n.vy);(r>80||Math.abs(n.vRot)>2)&&Math.random()<.25&&(n.displayFace=1+Math.floor(Math.random()*6));let d=this.arena.x+c,f=this.arena.x+this.arena.width-c,p=this.arena.y+c,m=this.arena.y+this.arena.height-c;n.x<d?(n.x=d,n.vx=-n.vx*o,n.vRot+=(Math.random()-.5)*4,i.playDiceRattle()):n.x>f&&(n.x=f,n.vx=-n.vx*o,n.vRot+=(Math.random()-.5)*4,i.playDiceRattle()),n.y<p?(n.y=p,n.vy=-n.vy*o,n.vRot+=(Math.random()-.5)*4,i.playDiceRattle()):n.y>m&&(n.y=m,n.vy=-n.vy*o,n.vRot+=(Math.random()-.5)*4,i.playDiceRattle());for(let e=t+1;e<this.dice.length;e++){let t=this.dice[e],r=t.x-n.x,a=t.y-n.y,o=Math.hypot(r,a),s=this.dieSize*.95;if(o<s&&o>.01){let e=s-o,c=r/o,l=a/o;n.x-=c*e*.5,n.y-=l*e*.5,t.x+=c*e*.5,t.y+=l*e*.5;let u=n.vx-t.vx,d=n.vy-t.vy,f=2*(c*u+l*d)/2;n.vx-=f*c*.85,n.vy-=f*l*.85,t.vx+=f*c*.85,t.vy+=f*l*.85,n.vRot+=(Math.random()-.5)*3,t.vRot+=(Math.random()-.5)*3,i.playDiceRattle()}}n.isRolling&&!n.hasScored&&(r<18&&Math.abs(n.vRot)<.8?(n.settleTimer+=e,n.settleTimer>=.22&&this.settleDie(n)):n.settleTimer=0)}for(let t=this.particles.length-1;t>=0;t--){let n=this.particles[t];n.x+=n.vx*e,n.y+=n.vy*e,n.life-=n.decay*e,n.life<=0&&this.particles.splice(t,1)}for(let t=this.floatingTexts.length-1;t>=0;t--){let n=this.floatingTexts[t];n.y+=n.vy*e,n.life-=n.decay*e,n.life<=0&&this.floatingTexts.splice(t,1)}}settleDie(e){e.isRolling=!1,e.hasScored=!0,e.settleTimer=0;let t=1+Math.floor(Math.random()*6);e.face=t,e.displayFace=t,e.rotation=Math.round(e.rotation/(Math.PI/2))*(Math.PI/2),e.vRot=0,e.vx=0,e.vy=0;let r=n.checkCritical(this.gameState);r&&(this.gameState.stats.criticalRollsCount+=1);let a=n.calculateDiceIncome(t,e.tierIndex,this.gameState,r);this.gameState.addCoins(a),this.gameState.stats.totalRolls+=1;let o=n.checkStardustDrop(t,e.tierIndex,this.gameState);o.dropped&&(this.gameState.addStardust(o.amount),this.spawnFloatingText(e.x,e.y-25,`✨ +${o.amount} STARDUST!`,`#60a5fa`,1.15),this.spawnSparks(e.x,e.y,12,`#60a5fa`));let s=n.checkDarkMatterDrop(t,e.tierIndex,this.gameState,r);s.dropped&&(this.gameState.addDarkMatter(s.amount),this.spawnFloatingText(e.x,e.y-45,`🌌 +${s.amount} MATÉRIA ESCURA!`,`#c084fc`,1.25),this.spawnSparks(e.x,e.y,16,`#c084fc`)),i.playDiceLand(t,r),i.playCoin();let c=r?`⚡ CRIT! `:``,l=r?`#fbbf24`:`#4ade80`;this.spawnFloatingText(e.x,e.y,`${c}+$${n.formatNumber(a)} [${t}]`,l,r?1.3:1),this.spawnSparks(e.x,e.y,r?14:6,l)}render(){this.ctx.clearRect(0,0,this.width,this.height);let{x:e,y:t,width:n,height:r,radius:i}=this.arena;this.ctx.save(),this.ctx.shadowColor=`rgba(0, 0, 0, 0.6)`,this.ctx.shadowBlur=25,this.ctx.shadowOffsetY=8,this.ctx.fillStyle=`#0f172a`,this.ctx.beginPath(),this.ctx.roundRect(e-8,t-8,n+16,r+16,i+4),this.ctx.fill(),this.ctx.restore(),this.ctx.save();let a=this.ctx.createRadialGradient(e+n/2,t+r/2,50,e+n/2,t+r/2,n*.7);a.addColorStop(0,`#1e293b`),a.addColorStop(1,`#0f172a`),this.ctx.fillStyle=a,this.ctx.beginPath(),this.ctx.roundRect(e,t,n,r,i),this.ctx.fill(),this.ctx.strokeStyle=`rgba(255, 255, 255, 0.035)`,this.ctx.lineWidth=1;for(let i=e+45;i<e+n;i+=45)this.ctx.beginPath(),this.ctx.moveTo(i,t),this.ctx.lineTo(i,t+r),this.ctx.stroke();for(let i=t+45;i<t+r;i+=45)this.ctx.beginPath(),this.ctx.moveTo(e,i),this.ctx.lineTo(e+n,i),this.ctx.stroke();this.ctx.strokeStyle=`rgba(56, 189, 248, 0.25)`,this.ctx.lineWidth=2,this.ctx.stroke(),this.ctx.restore(),this.ctx.save(),this.ctx.textAlign=`center`,this.ctx.font=`700 13px Inter, sans-serif`,this.ctx.fillStyle=`rgba(255, 255, 255, 0.12)`,this.ctx.fillText(`👉 PASSE O MOUSE POR CIMA DOS DADOS PARA ROLAR!`,e+n/2,t+r-16),this.ctx.restore();for(let e of this.shootingStars){this.ctx.save(),this.ctx.translate(e.x,e.y),this.ctx.rotate(e.rotation),this.ctx.shadowColor=`#38bdf8`,this.ctx.shadowBlur=20,this.ctx.fillStyle=`#7dd3fc`,this.ctx.beginPath();for(let t=0;t<8;t++){let n=t%2==0?e.radius:e.radius*.45,r=t/8*Math.PI*2,i=Math.cos(r)*n,a=Math.sin(r)*n;t===0?this.ctx.moveTo(i,a):this.ctx.lineTo(i,a)}this.ctx.closePath(),this.ctx.fill(),this.ctx.fillStyle=`#ffffff`,this.ctx.beginPath(),this.ctx.arc(0,0,4,0,Math.PI*2),this.ctx.fill(),this.ctx.restore()}for(let e of this.dice)this.drawDie(e);for(let e of this.helperHands)this.drawHand(e);for(let e of this.particles)this.ctx.save(),this.ctx.globalAlpha=Math.max(0,e.life),this.ctx.fillStyle=e.color,this.ctx.beginPath(),this.ctx.arc(e.x,e.y,e.radius,0,Math.PI*2),this.ctx.fill(),this.ctx.restore();for(let e of this.floatingTexts)this.ctx.save(),this.ctx.globalAlpha=Math.max(0,e.life),this.ctx.textAlign=`center`,this.ctx.font=`900 ${Math.round(15*e.size)}px Inter, sans-serif`,this.ctx.fillStyle=`#000000`,this.ctx.fillText(e.text,e.x+1,e.y+1),this.ctx.fillText(e.text,e.x-1,e.y-1),this.ctx.fillStyle=e.color,this.ctx.fillText(e.text,e.x,e.y),this.ctx.restore()}drawDie(t){let n=e[t.tierIndex]||e[0],r=this.dieSize,i=r/2;this.ctx.save(),this.ctx.translate(t.x,t.y),this.ctx.rotate(t.rotation),this.ctx.shadowColor=`rgba(0, 0, 0, 0.45)`,this.ctx.shadowBlur=10,this.ctx.shadowOffsetX=3,this.ctx.shadowOffsetY=4,this.ctx.fillStyle=n.color,this.ctx.beginPath(),this.ctx.roundRect(-i,-i,r,r,12),this.ctx.fill(),this.ctx.shadowColor=`transparent`;let a=this.ctx.createRadialGradient(-i*.3,-i*.3,4,0,0,i*1.2);a.addColorStop(0,`rgba(255, 255, 255, 0.4)`),a.addColorStop(.8,`rgba(0, 0, 0, 0.1)`),a.addColorStop(1,`rgba(0, 0, 0, 0.35)`),this.ctx.fillStyle=a,this.ctx.fill(),this.ctx.strokeStyle=`rgba(255, 255, 255, 0.3)`,this.ctx.lineWidth=2,this.ctx.stroke();let o=s[t.displayFace||1]||s[1],c=r*.095;for(let[e,t]of o){let r=i*.75*e,a=i*.75*t;this.ctx.fillStyle=`rgba(0, 0, 0, 0.35)`,this.ctx.beginPath(),this.ctx.arc(r+1,a+1.5,c,0,Math.PI*2),this.ctx.fill(),this.ctx.fillStyle=n.pipColor,this.ctx.beginPath(),this.ctx.arc(r,a,c,0,Math.PI*2),this.ctx.fill(),this.ctx.fillStyle=`rgba(255, 255, 255, 0.65)`,this.ctx.beginPath(),this.ctx.arc(r-c*.3,a-c*.3,c*.35,0,Math.PI*2),this.ctx.fill()}(n.id===`stardust`||n.id===`diamond`||n.id===`cosmic`)&&(this.ctx.fillStyle=`#ffffff`,this.ctx.beginPath(),this.ctx.arc(-i*.6,-i*.6,2,0,Math.PI*2),this.ctx.arc(i*.6,i*.6,2,0,Math.PI*2),this.ctx.fill()),this.ctx.restore()}drawHand(e){this.ctx.save(),this.ctx.translate(e.x,e.y),this.ctx.rotate(e.angle+Math.PI/2),this.ctx.shadowColor=`#3b82f6`,this.ctx.shadowBlur=12,this.ctx.font=`28px serif`,this.ctx.textAlign=`center`,this.ctx.textBaseline=`middle`,this.ctx.fillText(`🖐️`,0,0),this.ctx.restore()}},l=class{constructor(e,t){this.container=e,this.gameState=t,this.render()}render(){let t=this.gameState.getMaxActiveDice(),r=this.gameState.activeDice.length,i=``;this.gameState.activeDice.forEach((t,n)=>{let a=e[t.tierIndex]||e[0];i+=`
        <div class="active-die-pill" style="border-left: 4px solid ${a.color};">
          <span class="die-icon">${a.icon}</span>
          <span class="die-name">${a.name}</span>
          <span class="die-mult">${a.multiplier}x</span>
          ${r>1?`<button class="die-remove-btn" data-index="${n}" title="Guardar dado">×</button>`:``}
        </div>
      `});let a=``;e.forEach((e,i)=>{let o=this.gameState.canAfford(`coins`,e.baseCost),s=r>=t,c=e.stardustBonus?`+${e.stardustBonus} ✨ Stardust por rolagem`:e.darkMatterBonus?`+${e.darkMatterBonus} 🌌 Matéria Escura`:null;a+=`
        <div class="dice-catalog-card" style="border-top: 3px solid ${e.color};">
          <div class="card-top">
            <span class="catalog-icon">${e.icon}</span>
            <div class="catalog-details">
              <div class="catalog-title">${e.name}</div>
              <div class="catalog-mult">Multiplicador: <b>${e.multiplier}x</b></div>
              ${c?`<div class="catalog-bonus-badge">${c}</div>`:``}
            </div>
          </div>
          <div class="card-bottom">
            <div class="catalog-cost">$${n.formatNumber(e.baseCost)}</div>
            <button class="catalog-buy-btn ${s?`btn-full`:o?`btn-afford`:`btn-cant-afford`}" 
                    data-tier="${i}" 
                    ${s||!o?`disabled`:``}>
              ${s?`Mesa Cheia`:o?`Comprar Dado`:`Moedas Insuficientes`}
            </button>
          </div>
        </div>
      `}),this.container.innerHTML=`
      <div class="shop-view-wrapper">
        <div class="shop-header">
          <h2>Loja de Dados & Tabuleiro</h2>
          <div class="tray-capacity-badge">
            🎲 Capacidade do Tabuleiro: <b>${r} / ${t}</b> dados ativos
          </div>
        </div>

        <div class="active-dice-section">
          <h3>Dados Ativos no Tabuleiro</h3>
          <div class="active-dice-row">
            ${i}
          </div>
        </div>

        <div class="catalog-section">
          <h3>Catálogo de Dados</h3>
          <div class="dice-catalog-grid">
            ${a}
          </div>
        </div>
      </div>
    `,this.setupEvents()}setupEvents(){this.container.querySelectorAll(`.catalog-buy-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.tier,10);isNaN(t)||(this.gameState.buyDie(t),this.render())})}),this.container.querySelectorAll(`.die-remove-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.index,10);isNaN(t)||(i.playClick(),this.gameState.removeDie(t),this.render())})})}},u=class{constructor(e,t){this.container=e,this.gameState=t,this.buyMultiplier=1,this.shiftPressed=!1,this.setupShiftListener(),this.render()}setupShiftListener(){window.addEventListener(`keydown`,e=>{e.key===`Shift`&&!this.shiftPressed&&(this.shiftPressed=!0,this.render())}),window.addEventListener(`keyup`,e=>{e.key===`Shift`&&this.shiftPressed&&(this.shiftPressed=!1,this.render())})}getActiveBuyMultiplier(){return this.shiftPressed?`max`:this.buyMultiplier}render(){let e=this.getActiveBuyMultiplier(),r=``;for(let[i,a]of Object.entries(t)){let t=this.gameState.commonUpgrades[i]||0,o=t>=a.maxLevel,s=0,c=0;if(!o){if(e===`max`){let e=n.getMaxAffordableCommon(i,t,this.gameState.coins);c=Math.max(1,e.count),s=e.count>0?e.cost:n.getCommonUpgradeCost(i,t,1)}else c=Math.min(e,a.maxLevel-t),s=n.getCommonUpgradeCost(i,t,c)}let l=this.gameState.canAfford(`coins`,s);r+=`
        <div class="upgrade-card ${o?`card-maxed`:``}">
          <div class="upgrade-card-header">
            <span class="upgrade-icon">${a.icon}</span>
            <div class="upgrade-titles">
              <div class="upgrade-name">${a.name}</div>
              <div class="upgrade-level">Nível: <b>${t}</b> / ${a.maxLevel}</div>
            </div>
          </div>
          <div class="upgrade-desc">${a.desc}</div>
          <div class="upgrade-card-footer">
            <div class="upgrade-cost">
              ${o?`<span class="max-badge">MÁXIMO</span>`:`Custo (+${c}): <b>$${n.formatNumber(s)}</b>`}
            </div>
            <button class="upgrade-buy-btn ${o?`btn-max`:l?`btn-can-buy`:`btn-cant-buy`}"
                    data-key="${i}"
                    data-count="${e===`max`?`max`:c}"
                    ${o||!l?`disabled`:``}>
              ${o?`Maximizada`:`Comprar +${c}`}
            </button>
          </div>
        </div>
      `}this.container.innerHTML=`
      <div class="upgrades-view-wrapper">
        <div class="upgrades-top-bar">
          <div>
            <h2>Melhorias Comuns (Moedas)</h2>
            <p>Compre melhorias com suas moedas para acelerar a rolagem dos dados.</p>
          </div>
          <div class="multiplier-selector">
            <span class="mult-label">Comprar:</span>
            <button class="mult-btn ${e===1?`active`:``}" data-mult="1">1x</button>
            <button class="mult-btn ${e===5?`active`:``}" data-mult="5">5x</button>
            <button class="mult-btn ${e===10?`active`:``}" data-mult="10">10x</button>
            <button class="mult-btn ${e===`max`?`active`:``}" data-mult="max">MÁX ${this.shiftPressed?`(SHIFT)`:``}</button>
          </div>
        </div>

        <div class="upgrades-grid">
          ${r}
        </div>
      </div>
    `,this.setupEvents()}setupEvents(){this.container.querySelectorAll(`.mult-btn`).forEach(e=>{e.addEventListener(`click`,()=>{i.playClick();let t=e.dataset.mult;this.buyMultiplier=t===`max`?`max`:parseInt(t,10),this.render()})}),this.container.querySelectorAll(`.upgrade-buy-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.key,n=e.dataset.count===`max`?`max`:parseInt(e.dataset.count,10);t&&(this.gameState.buyCommonUpgrade(t,n),this.render())})})}},d=class{constructor(e,t){this.container=e,this.gameState=t,this.panX=0,this.panY=0,this.zoom=1,this.minZoom=.4,this.maxZoom=2.2,this.isDragging=!1,this.startX=0,this.startY=0,this.selectedNodeId=null,this.initDOM(),this.setupEvents(),this.centerView(),this.render()}initDOM(){this.container.innerHTML=`
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
    `,this.viewport=this.container.querySelector(`#tree-viewport`),this.svgLayer=this.container.querySelector(`#tree-svg-layer`),this.nodesLayer=this.container.querySelector(`#tree-nodes-layer`),this.inspector=this.container.querySelector(`#tree-inspector`),this.inspectorContent=this.container.querySelector(`#tree-inspector-content`)}setupEvents(){this.container.querySelector(`#tree-zoom-in`).addEventListener(`click`,()=>this.adjustZoom(.2)),this.container.querySelector(`#tree-zoom-out`).addEventListener(`click`,()=>this.adjustZoom(-.2)),this.container.querySelector(`#tree-zoom-center`).addEventListener(`click`,()=>this.centerView()),this.viewport.addEventListener(`mousedown`,e=>{e.target.closest(`.tree-node`)||e.target.closest(`.tree-hud-btn`)||e.target.closest(`.tree-inspector-modal`)||(this.isDragging=!0,this.startX=e.clientX-this.panX,this.startY=e.clientY-this.panY,this.viewport.style.cursor=`grabbing`)}),window.addEventListener(`mousemove`,e=>{this.isDragging&&(this.panX=e.clientX-this.startX,this.panY=e.clientY-this.startY,this.applyTransform())}),window.addEventListener(`mouseup`,()=>{this.isDragging&&(this.isDragging=!1,this.viewport.style.cursor=`grab`)});let e=null,t=1;this.viewport.addEventListener(`touchstart`,n=>{if(!(n.target.closest(`.tree-node`)||n.target.closest(`.tree-hud-btn`))){if(n.touches.length===1)this.isDragging=!0,this.startX=n.touches[0].clientX-this.panX,this.startY=n.touches[0].clientY-this.panY;else if(n.touches.length===2){this.isDragging=!1;let r=n.touches[0].clientX-n.touches[1].clientX,i=n.touches[0].clientY-n.touches[1].clientY;e=Math.hypot(r,i),t=this.zoom}}},{passive:!0}),window.addEventListener(`touchmove`,n=>{if(this.isDragging&&n.touches.length===1)this.panX=n.touches[0].clientX-this.startX,this.panY=n.touches[0].clientY-this.startY,this.applyTransform();else if(n.touches.length===2&&e){let r=n.touches[0].clientX-n.touches[1].clientX,i=n.touches[0].clientY-n.touches[1].clientY,a=Math.hypot(r,i)/e;this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,t*a)),this.applyTransform()}},{passive:!0}),window.addEventListener(`touchend`,()=>{this.isDragging=!1,e=null}),this.viewport.addEventListener(`wheel`,e=>{e.preventDefault();let t=e.deltaY<0?.15:-.15;this.adjustZoom(t,e.clientX,e.clientY)},{passive:!1}),this.inspector.addEventListener(`click`,e=>{e.target===this.inspector&&this.closeInspector()})}adjustZoom(e,t=null,n=null){let r=this.zoom,i=Math.max(this.minZoom,Math.min(this.maxZoom,r+e));if(i!==r){if(t!==null&&n!==null){let e=this.viewport.getBoundingClientRect(),a=t-e.left,o=n-e.top;this.panX=a-(a-this.panX)*(i/r),this.panY=o-(o-this.panY)*(i/r)}this.zoom=i,this.applyTransform()}}centerView(){let e=this.viewport.getBoundingClientRect();this.panX=e.width/2,this.panY=e.height/2,this.zoom=1,this.applyTransform()}applyTransform(){let e=`translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;this.nodesLayer.style.transform=e,this.svgLayer.style.transform=e}getNodeStatus(e){let t=r[e];if(!t)return`locked`;let n=this.gameState.skillTree[e]||0;return n>=t.maxLevel?`max`:n>0?`purchased`:t.reqs.every(e=>(this.gameState.skillTree[e]||0)>0)?`available`:`locked`}render(){this.renderSvgConnections(),this.renderNodes(),this.selectedNodeId&&this.openInspector(this.selectedNodeId)}renderSvgConnections(){let e=``;for(let[t,n]of Object.entries(r))for(let i of n.reqs){let a=r[i];if(!a)continue;let o=this.gameState.skillTree[i]||0,s=this.gameState.skillTree[t]||0,c=`wire-locked`;s>0?c=`wire-completed`:o>0&&(c=`wire-available`);let l=a.x,u=a.y,d=n.x,f=n.y,p=d-l;f-u;let m=`M ${l} ${u} C ${l+p*.5} ${u}, ${l+p*.5} ${f}, ${d} ${f}`;e+=`<path d="${m}" class="tree-wire ${c}" />`}this.svgLayer.innerHTML=e}renderNodes(){let e=``;for(let[t,n]of Object.entries(r)){let r=this.getNodeStatus(t),i=this.gameState.skillTree[t]||0,a=n.costResource===`darkMatter`?`🌌`:`✨`,o=i<n.maxLevel?n.costs[i]:0,s=n.costResource===`darkMatter`;e+=`
        <div class="tree-node status-${r} branch-${n.branch} ${s?`cosmic-node`:``}" 
             data-id="${t}" 
             style="left: ${n.x}px; top: ${n.y}px;"
             title="${n.name}">
          <div class="node-icon">${n.icon}</div>
          <div class="node-title">${n.name}</div>
          <div class="node-level">${r===`max`?`MAX`:n.maxLevel>1?`Lv. ${i}/${n.maxLevel}`:i>0?`COMPRADO`:`${o} ${a}`}</div>
          ${r===`locked`?`<div class="node-lock-badge">🔒</div>`:``}
          ${r===`max`?`<div class="node-check-badge">✓</div>`:``}
        </div>
      `}this.nodesLayer.innerHTML=e,this.nodesLayer.querySelectorAll(`.tree-node`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.id;i.playClick(),this.openInspector(n)})})}openInspector(e){this.selectedNodeId=e;let t=r[e];if(!t)return;let n=this.gameState.skillTree[e]||0;this.getNodeStatus(e);let i=n>=t.maxLevel,a=t.costResource===`darkMatter`?`darkMatter`:`stardust`,o=a===`darkMatter`?`🌌`:`✨`,s=i?0:t.costs[n],c=this.gameState.canAfford(a,s),l=t.reqs.every(e=>(this.gameState.skillTree[e]||0)>0),u=``;t.reqs.length>0&&(u=`
        <div class="inspector-section">
          <div class="section-title">Requisitos Prévios</div>
          <div class="reqs-list">
            ${t.reqs.map(e=>{let t=r[e],n=(this.gameState.skillTree[e]||0)>0;return`
                <div class="req-item ${n?`met`:`unmet`}">
                  <span class="req-status">${n?`✓`:`🔒`}</span>
                  <span class="req-name">${t?t.name:e}</span>
                </div>
              `}).join(``)}
          </div>
        </div>
      `);let d=`
      <div class="inspector-section">
        <div class="section-title">Efeito da Habilidade</div>
        <div class="effect-box current-effect">
          <span class="effect-label">Atual:</span>
          <span class="effect-val">${t.effectText(n)}</span>
        </div>
        ${i?``:`
          <div class="effect-box next-effect">
            <span class="effect-label">Próximo Nível:</span>
            <span class="effect-val">${t.effectText(n+1)}</span>
          </div>
        `}
      </div>
    `,f=``;f=i?`<button class="tree-buy-btn btn-maxed" disabled>Nível Máximo Atingido ✓</button>`:l?c?`
        <button class="tree-buy-btn btn-ready" id="tree-btn-buy">
          ${n>0?`Melhorar para Nível `+(n+1):`Desbloquear Habilidade`} 
          <span class="cost-tag">${s} ${o}</span>
        </button>
      `:`<button class="tree-buy-btn btn-unaffordable" disabled>Saldo Insuficiente (${s} ${o})</button>`:`<button class="tree-buy-btn btn-locked" disabled>Bloqueado — Requisitos Pendentes 🔒</button>`,this.inspectorContent.innerHTML=`
      <div class="inspector-header">
        <div class="inspector-icon-badge">${t.icon}</div>
        <div class="inspector-title-area">
          <div class="inspector-title">${t.name}</div>
          <div class="inspector-badge-row">
            <span class="inspector-badge badge-${t.branch}">${t.branch.toUpperCase()}</span>
            <span class="inspector-badge badge-level">Nível ${n} / ${t.maxLevel}</span>
          </div>
        </div>
        <button class="inspector-close" id="tree-inspector-close">&times;</button>
      </div>

      <div class="inspector-desc">${t.desc}</div>

      ${d}
      ${u}

      <div class="inspector-actions">
        ${f}
      </div>
    `,this.inspector.style.display=`flex`,this.inspectorContent.querySelector(`#tree-inspector-close`).addEventListener(`click`,()=>{this.closeInspector()});let p=this.inspectorContent.querySelector(`#tree-btn-buy`);p&&p.addEventListener(`click`,()=>{let t=this.gameState.buySkillTreeNode(e);t.success?this.render():alert(t.reason||`Não foi possível comprar.`)})}closeInspector(){this.selectedNodeId=null,this.inspector.style.display=`none`}},f={};(function e(t,n,r,i){var a=!!(t.Worker&&t.Blob&&t.Promise&&t.OffscreenCanvas&&t.OffscreenCanvasRenderingContext2D&&t.HTMLCanvasElement&&t.HTMLCanvasElement.prototype.transferControlToOffscreen&&t.URL&&t.URL.createObjectURL),o=typeof Path2D==`function`&&typeof DOMMatrix==`function`,s=(function(){if(!t.OffscreenCanvas)return!1;try{var e=new OffscreenCanvas(1,1),n=e.getContext(`2d`);n.fillRect(0,0,1,1);var r=e.transferToImageBitmap();n.createPattern(r,`no-repeat`)}catch{return!1}return!0})();function c(){}function l(e){var r=n.exports.Promise,i=r===void 0?t.Promise:r;return typeof i==`function`?new i(e):(e(c,c),null)}var u=(function(e,t){return{transform:function(n){if(e)return n;if(t.has(n))return t.get(n);var r=new OffscreenCanvas(n.width,n.height);return r.getContext(`2d`).drawImage(n,0,0),t.set(n,r),r},clear:function(){t.clear()}}})(s,new Map),d=function(){var e,t,n={},r=0;return typeof requestAnimationFrame==`function`&&typeof cancelAnimationFrame==`function`?(e=function(e){var t=Math.random();return n[t]=requestAnimationFrame(function i(a){r===a||r+16-1<a?(r=a,delete n[t],e()):n[t]=requestAnimationFrame(i)}),t},t=function(e){n[e]&&cancelAnimationFrame(n[e])}):(e=function(e){return setTimeout(e,16)},t=function(e){return clearTimeout(e)}),{frame:e,cancel:t}}(),f=(function(){var t,n,i={};function o(e){function t(t,n){e.postMessage({options:t||{},callback:n})}e.init=function(t){var n=t.transferControlToOffscreen();e.postMessage({canvas:n},[n])},e.fire=function(r,a,o){if(n)return t(r,null),n;var s=Math.random().toString(36).slice(2);return n=l(function(a){function c(t){t.data.callback===s&&(delete i[s],e.removeEventListener(`message`,c),n=null,u.clear(),o(),a())}e.addEventListener(`message`,c),t(r,s),i[s]=c.bind(null,{data:{callback:s}})}),n},e.reset=function(){for(var t in e.postMessage({reset:!0}),i)i[t](),delete i[t]}}return function(){if(t)return t;if(!r&&a){var n=[`var CONFETTI, SIZE = {}, module = {};`,`(`+e.toString()+`)(this, module, true, SIZE);`,`onmessage = function(msg) {`,`  if (msg.data.options) {`,`    CONFETTI(msg.data.options).then(function () {`,`      if (msg.data.callback) {`,`        postMessage({ callback: msg.data.callback });`,`      }`,`    });`,`  } else if (msg.data.reset) {`,`    CONFETTI && CONFETTI.reset();`,`  } else if (msg.data.resize) {`,`    SIZE.width = msg.data.resize.width;`,`    SIZE.height = msg.data.resize.height;`,`  } else if (msg.data.canvas) {`,`    SIZE.width = msg.data.canvas.width;`,`    SIZE.height = msg.data.canvas.height;`,`    CONFETTI = module.exports.create(msg.data.canvas);`,`  }`,`}`].join(`
`);try{t=new Worker(URL.createObjectURL(new Blob([n])))}catch(e){return typeof console<`u`&&typeof console.warn==`function`&&console.warn(`🎊 Could not load worker`,e),null}o(t)}return t}})(),p={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:[`square`,`circle`],zIndex:100,colors:[`#26ccff`,`#a25afd`,`#ff5e7e`,`#88ff5a`,`#fcff42`,`#ffa62d`,`#ff36ff`],disableForReducedMotion:!1,scalar:1};function m(e,t){return t?t(e):e}function h(e){return e!=null}function g(e,t,n){return m(e&&h(e[t])?e[t]:p[t],n)}function _(e){return e<0?0:Math.floor(e)}function v(e,t){return Math.floor(Math.random()*(t-e))+e}function y(e){return parseInt(e,16)}function b(e){return e.map(x)}function x(e){var t=String(e).replace(/[^0-9a-f]/gi,``);return t.length<6&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),{r:y(t.substring(0,2)),g:y(t.substring(2,4)),b:y(t.substring(4,6))}}function S(e){var t=g(e,`origin`,Object);return t.x=g(t,`x`,Number),t.y=g(t,`y`,Number),t}function C(e){e.width=document.documentElement.clientWidth,e.height=document.documentElement.clientHeight}function w(e){var t=e.getBoundingClientRect();e.width=t.width,e.height=t.height}function T(e){var t=document.createElement(`canvas`);return t.style.position=`fixed`,t.style.top=`0px`,t.style.left=`0px`,t.style.pointerEvents=`none`,t.style.zIndex=e,t}function E(e,t,n,r,i,a,o,s,c){e.save(),e.translate(t,n),e.rotate(a),e.scale(r,i),e.arc(0,0,1,o,s,c),e.restore()}function D(e){var t=e.angle*(Math.PI/180),n=e.spread*(Math.PI/180);return{x:e.x,y:e.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:e.startVelocity*.5+Math.random()*e.startVelocity,angle2D:-t+(.5*n-Math.random()*n),tiltAngle:(Math.random()*.5+.25)*Math.PI,color:e.color,shape:e.shape,tick:0,totalTicks:e.ticks,decay:e.decay,drift:e.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:e.gravity*3,ovalScalar:.6,scalar:e.scalar,flat:e.flat}}function O(e,t){t.x+=Math.cos(t.angle2D)*t.velocity+t.drift,t.y+=Math.sin(t.angle2D)*t.velocity+t.gravity,t.velocity*=t.decay,t.flat?(t.wobble=0,t.wobbleX=t.x+10*t.scalar,t.wobbleY=t.y+10*t.scalar,t.tiltSin=0,t.tiltCos=0,t.random=1):(t.wobble+=t.wobbleSpeed,t.wobbleX=t.x+10*t.scalar*Math.cos(t.wobble),t.wobbleY=t.y+10*t.scalar*Math.sin(t.wobble),t.tiltAngle+=.1,t.tiltSin=Math.sin(t.tiltAngle),t.tiltCos=Math.cos(t.tiltAngle),t.random=Math.random()+2);var n=t.tick++/t.totalTicks,r=t.x+t.random*t.tiltCos,i=t.y+t.random*t.tiltSin,a=t.wobbleX+t.random*t.tiltCos,s=t.wobbleY+t.random*t.tiltSin;if(e.fillStyle=`rgba(`+t.color.r+`, `+t.color.g+`, `+t.color.b+`, `+(1-n)+`)`,e.beginPath(),o&&t.shape.type===`path`&&typeof t.shape.path==`string`&&Array.isArray(t.shape.matrix))e.fill(N(t.shape.path,t.shape.matrix,t.x,t.y,Math.abs(a-r)*.1,Math.abs(s-i)*.1,Math.PI/10*t.wobble));else if(t.shape.type===`bitmap`){var c=Math.PI/10*t.wobble,l=Math.abs(a-r)*.1,d=Math.abs(s-i)*.1,f=t.shape.bitmap.width*t.scalar,p=t.shape.bitmap.height*t.scalar,m=new DOMMatrix([Math.cos(c)*l,Math.sin(c)*l,-Math.sin(c)*d,Math.cos(c)*d,t.x,t.y]);m.multiplySelf(new DOMMatrix(t.shape.matrix));var h=e.createPattern(u.transform(t.shape.bitmap),`no-repeat`);h.setTransform(m),e.globalAlpha=1-n,e.fillStyle=h,e.fillRect(t.x-f/2,t.y-p/2,f,p),e.globalAlpha=1}else if(t.shape===`circle`)e.ellipse?e.ellipse(t.x,t.y,Math.abs(a-r)*t.ovalScalar,Math.abs(s-i)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI):E(e,t.x,t.y,Math.abs(a-r)*t.ovalScalar,Math.abs(s-i)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI);else if(t.shape===`star`)for(var g=Math.PI/2*3,_=4*t.scalar,v=8*t.scalar,y=t.x,b=t.y,x=5,S=Math.PI/x;x--;)y=t.x+Math.cos(g)*v,b=t.y+Math.sin(g)*v,e.lineTo(y,b),g+=S,y=t.x+Math.cos(g)*_,b=t.y+Math.sin(g)*_,e.lineTo(y,b),g+=S;else e.moveTo(Math.floor(t.x),Math.floor(t.y)),e.lineTo(Math.floor(t.wobbleX),Math.floor(i)),e.lineTo(Math.floor(a),Math.floor(s)),e.lineTo(Math.floor(r),Math.floor(t.wobbleY));return e.closePath(),e.fill(),t.tick<t.totalTicks}function k(e,t,n,a,o){var s=t.slice(),c=e.getContext(`2d`),f,p,m=l(function(t){function l(){f=p=null,c.clearRect(0,0,a.width,a.height),u.clear(),o(),t()}function m(){r&&(a.width!==i.width||a.height!==i.height)&&(a.width=e.width=i.width,a.height=e.height=i.height),!a.width&&!a.height&&(n(e),a.width=e.width,a.height=e.height),c.clearRect(0,0,a.width,a.height),s=s.filter(function(e){return O(c,e)}),s.length?f=d.frame(m):l()}f=d.frame(m),p=l});return{addFettis:function(e){return s=s.concat(e),m},canvas:e,promise:m,reset:function(){f&&d.cancel(f),p&&p()}}}function A(e,n){var r=!e,i=!!g(n||{},`resize`),o=!1,s=g(n,`disableForReducedMotion`,Boolean),c=a&&g(n||{},`useWorker`)?f():null,u=r?C:w,d=e&&c?!!e.__confetti_initialized:!1,p=typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion)`).matches,m;function h(t,n,r){for(var i=g(t,`particleCount`,_),a=g(t,`angle`,Number),o=g(t,`spread`,Number),s=g(t,`startVelocity`,Number),c=g(t,`decay`,Number),l=g(t,`gravity`,Number),d=g(t,`drift`,Number),f=g(t,`colors`,b),p=g(t,`ticks`,Number),h=g(t,`shapes`),y=g(t,`scalar`),x=!!g(t,`flat`),C=S(t),w=i,T=[],E=e.width*C.x,O=e.height*C.y;w--;)T.push(D({x:E,y:O,angle:a,spread:o,startVelocity:s,color:f[w%f.length],shape:h[v(0,h.length)],ticks:p,decay:c,gravity:l,drift:d,scalar:y,flat:x}));return m?m.addFettis(T):(m=k(e,T,u,n,r),m.promise)}function y(n){var a=s||g(n,`disableForReducedMotion`,Boolean),f=g(n,`zIndex`,Number);if(a&&p)return l(function(e){e()});r&&m?e=m.canvas:r&&!e&&(e=T(f),document.body.appendChild(e)),i&&!d&&u(e);var _={width:e.width,height:e.height};c&&!d&&c.init(e),d=!0,c&&(e.__confetti_initialized=!0);function v(){if(c){var t={getBoundingClientRect:function(){if(!r)return e.getBoundingClientRect()}};u(t),c.postMessage({resize:{width:t.width,height:t.height}})}else _.width=_.height=null}function y(){m=null,i&&(o=!1,t.removeEventListener(`resize`,v)),r&&e&&(document.body.contains(e)&&document.body.removeChild(e),e=null,d=!1)}return i&&!o&&(o=!0,t.addEventListener(`resize`,v,!1)),c?c.fire(n,_,y):h(n,_,y)}return y.reset=function(){c&&c.reset(),m&&m.reset()},y}var j;function M(){return j||=A(null,{useWorker:!0,resize:!0}),j}function N(e,t,n,r,i,a,o){var s=new Path2D(e),c=new Path2D;c.addPath(s,new DOMMatrix(t));var l=new Path2D;return l.addPath(c,new DOMMatrix([Math.cos(o)*i,Math.sin(o)*i,-Math.sin(o)*a,Math.cos(o)*a,n,r])),l}function P(e){if(!o)throw Error(`path confetti are not supported in this browser`);var t,n;typeof e==`string`?t=e:(t=e.path,n=e.matrix);var r=new Path2D(t),i=document.createElement(`canvas`).getContext(`2d`);if(!n){for(var a=1e3,s=a,c=a,l=0,u=0,d,f,p=0;p<a;p+=2)for(var m=0;m<a;m+=2)i.isPointInPath(r,p,m,`nonzero`)&&(s=Math.min(s,p),c=Math.min(c,m),l=Math.max(l,p),u=Math.max(u,m));d=l-s,f=u-c;var h=10,g=Math.min(h/d,h/f);n=[g,0,0,g,-Math.round(d/2+s)*g,-Math.round(f/2+c)*g]}return{type:`path`,path:t,matrix:n}}function F(e){var t,n=1,r=`#000000`,i=`"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif`;typeof e==`string`?t=e:(t=e.text,n=`scalar`in e?e.scalar:n,i=`fontFamily`in e?e.fontFamily:i,r=`color`in e?e.color:r);var a=10*n,o=``+a+`px `+i,s=new OffscreenCanvas(a,a),c=s.getContext(`2d`);c.font=o;var l=c.measureText(t),u=Math.ceil(l.actualBoundingBoxRight+l.actualBoundingBoxLeft),d=Math.ceil(l.actualBoundingBoxAscent+l.actualBoundingBoxDescent),f=2,p=l.actualBoundingBoxLeft+f,m=l.actualBoundingBoxAscent+f;u+=f+f,d+=f+f,s=new OffscreenCanvas(u,d),c=s.getContext(`2d`),c.font=o,c.fillStyle=r,c.fillText(t,p,m);var h=1/n;return{type:`bitmap`,bitmap:s.transferToImageBitmap(),matrix:[h,0,0,h,-u*h/2,-d*h/2]}}n.exports=function(){return M().apply(this,arguments)},n.exports.reset=function(){M().reset()},n.exports.create=A,n.exports.shapeFromPath=P,n.exports.shapeFromText=F})((function(){return typeof window<`u`?window:typeof self<`u`?self:this||{}})(),f,!1);var p=f.exports;f.exports.create;var m=class{constructor(e,t){this.container=e,this.gameState=t,this.render()}render(){let e=n.getRebirthRequirements(this.gameState),t=n.getRebirthRewards(this.gameState),r=this.gameState.skillTree||{},i=(r.tree_legacy_retention||0)*30,a=!!r.tree_golden_start,o=!!r.tree_rebirth_surge;this.container.innerHTML=`
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
              <span class="value">${t.currentMultiplier.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        <!-- Requirements Section -->
        <div class="rebirth-section">
          <h3>Requisitos para o Rebirth #${t.nextRebirth}</h3>
          <div class="req-bars-container">
            <!-- Coins Requirement -->
            <div class="req-bar-card ${e.coinsMet?`completed`:``}">
              <div class="req-bar-header">
                <span class="req-title">💰 Moedas em Caixa</span>
                <span class="req-values">$${n.formatNumber(e.currentCoins)} / $${n.formatNumber(e.coinsNeeded)}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill coins-fill" style="width: ${(e.coinsProgress*100).toFixed(1)}%;"></div>
              </div>
              <div class="req-status-text">${e.coinsMet?`✓ Concluído`:`Faltam $${n.formatNumber(Math.max(0,e.coinsNeeded-e.currentCoins))}`}</div>
            </div>

            <!-- Dice Requirement -->
            <div class="req-bar-card ${e.diceMet?`completed`:``}">
              <div class="req-bar-header">
                <span class="req-title">🎲 Dados Ativos no Tabuleiro</span>
                <span class="req-values">${e.currentDice} / ${e.diceNeeded}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill dice-fill" style="width: ${(e.diceProgress*100).toFixed(1)}%;"></div>
              </div>
              <div class="req-status-text">${e.diceMet?`✓ Concluído`:`Compre mais ${Math.max(0,e.diceNeeded-e.currentDice)} dado(s)`}</div>
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
                <span class="reward-val">+${o?`200%`:`100%`} (${t.nextMultiplier.toFixed(1)}x total)</span>
              </div>
            </div>
            <div class="reward-pill stardust-pill">
              <span class="reward-icon">✨</span>
              <div class="reward-info">
                <span class="reward-name">Stardust Cósmico</span>
                <span class="reward-val">+${t.stardustReward} Stardust</span>
              </div>
            </div>
            <div class="reward-pill gem-pill">
              <span class="reward-icon">💎</span>
              <div class="reward-info">
                <span class="reward-name">Gemas Preciosas</span>
                <span class="reward-val">+${t.gemsReward} Gemas</span>
              </div>
            </div>
            <div class="reward-pill perk-pill">
              <span class="reward-icon">⚡</span>
              <div class="reward-info">
                <span class="reward-name">Velocidade de Progressão</span>
                <span class="reward-val">Recomeço ${t.nextMultiplier.toFixed(1)}x mais rápido!</span>
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
              <li>Upgrades comuns comprados com moedas ${i>0?`<b style="color:#60a5fa">(${i}% preservado pelo Legado!)</b>`:``}</li>
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
              ${a?`<li style="color:#fde047"><b>Início Dourado: Começa com $10.000 e 2 Dados de Bronze!</b></li>`:``}
            </ul>
          </div>
        </div>

        <!-- Action Button -->
        <div class="rebirth-action-area">
          <button class="rebirth-main-btn ${e.canRebirth?`btn-active`:`btn-disabled`}" 
                  id="btn-rebirth-trigger" 
                  ${e.canRebirth?``:`disabled`}>
            ${e.canRebirth?`Transcender para Rebirth #${t.nextRebirth} ✨`:`Requisitos Incompletos 🔒`}
          </button>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div class="rebirth-modal-backdrop" id="rebirth-modal" style="display: none;">
        <div class="rebirth-modal-card">
          <div class="modal-glow-header">
            <span class="modal-icon">⚠️</span>
            <h3>Confirmar Renascimento #${t.nextRebirth}</h3>
          </div>
          <p class="modal-body-text">
            Você está prestes a realizar um <b>Rebirth</b>. Suas moedas e upgrades comuns serão reiniciados, 
            mas você receberá <b>+${o?`200%`:`100%`}</b> de multiplicador permanente, 
            <b>+${t.stardustReward} Stardust</b> e <b>+${t.gemsReward} Gemas</b>!
          </p>
          <div class="modal-highlights">
            <div>Multiplicador: <b>${t.currentMultiplier.toFixed(1)}x ➔ ${t.nextMultiplier.toFixed(1)}x</b></div>
            <div>Stardust Ganho: <b style="color: #60a5fa;">+${t.stardustReward} ✨</b></div>
            <div>Gemas Ganhas: <b style="color: #f43f5e;">+${t.gemsReward} 💎</b></div>
          </div>
          <div class="modal-actions">
            <button class="modal-cancel-btn" id="modal-rebirth-cancel">Cancelar</button>
            <button class="modal-confirm-btn" id="modal-rebirth-confirm">Sim, Renascer Agora! 🔄</button>
          </div>
        </div>
      </div>
    `,this.setupModalEvents()}setupModalEvents(){let e=this.container.querySelector(`#btn-rebirth-trigger`),t=this.container.querySelector(`#rebirth-modal`),n=this.container.querySelector(`#modal-rebirth-cancel`),r=this.container.querySelector(`#modal-rebirth-confirm`);e&&e.addEventListener(`click`,()=>{i.playClick(),t&&(t.style.display=`flex`)}),n&&n.addEventListener(`click`,()=>{i.playClick(),t&&(t.style.display=`none`)}),r&&r.addEventListener(`click`,()=>{let e=this.gameState.performRebirth();t&&(t.style.display=`none`),e.success?(p({particleCount:120,spread:90,origin:{y:.6}}),this.render()):alert(e.reason||`Não foi possível renascer.`)})}},h=[{id:`ach_roll_1`,name:`Primeiro Lançamento`,desc:`Role os dados pela primeira vez.`,rewardGems:2,condition:e=>e.stats.totalRolls>=1},{id:`ach_roll_50`,name:`Mãos Calejadas`,desc:`Realize 50 rolagens de dados.`,rewardGems:3,condition:e=>e.stats.totalRolls>=50},{id:`ach_roll_250`,name:`Mestre dos Dados`,desc:`Realize 250 rolagens de dados.`,rewardGems:5,condition:e=>e.stats.totalRolls>=250},{id:`ach_coins_1k`,name:`Primeiro Milhar`,desc:`Acumule $1.000 moedas no total.`,rewardGems:2,condition:e=>e.stats.totalCoinsEarned>=1e3},{id:`ach_coins_50k`,name:`Cofre Farto`,desc:`Acumule $50.000 moedas no total.`,rewardGems:5,condition:e=>e.stats.totalCoinsEarned>=5e4},{id:`ach_coins_1m`,name:`Milionário dos Dados`,desc:`Acumule $1.000.000 moedas no total.`,rewardGems:10,condition:e=>e.stats.totalCoinsEarned>=1e6},{id:`ach_stardust_1`,name:`Poeira Cósmica`,desc:`Colete seu primeiro Stardust ✨.`,rewardGems:3,condition:e=>e.stats.totalStardustEarned>=1},{id:`ach_stardust_25`,name:`Colecionador Estelar`,desc:`Colete 25 Stardust no total.`,rewardGems:6,condition:e=>e.stats.totalStardustEarned>=25},{id:`ach_hand_1`,name:`Automação Começa`,desc:`Ative sua primeira Mão Mecânica.`,rewardGems:3,condition:e=>(e.commonUpgrades?.helperHands||0)>=1||!!e.skillTree.tree_helper_hand_1},{id:`ach_dice_5`,name:`Mesa Movimentada`,desc:`Tenha pelo menos 4 dados ativos.`,rewardGems:5,condition:e=>e.activeDice.length>=4},{id:`ach_rebirth_1`,name:`O Grande Salto`,desc:`Realize o seu 1º Rebirth.`,rewardGems:10,condition:e=>e.rebirths>=1},{id:`ach_rebirth_3`,name:`Transcendência`,desc:`Realize 3 Rebirths no total.`,rewardGems:20,condition:e=>e.rebirths>=3},{id:`ach_crit_10`,name:`Impacto Fulminante`,desc:`Consiga 10 rolagens críticas.`,rewardGems:5,condition:e=>(e.stats.criticalRollsCount||0)>=10},{id:`ach_dark_matter`,name:`Alquimia Proibida`,desc:`Obtenha Matéria Escura 🌌.`,rewardGems:25,condition:e=>(e.stats.totalDarkMatterEarned||0)>=1}],g=class{constructor(e,t){this.container=e,this.gameState=t,this.render()}formatTime(e){let t=Math.floor(e/3600),n=Math.floor(e%3600/60),r=e%60;return t>0?`${t}h ${n}m ${r}s`:n>0?`${n}m ${r}s`:`${r}s`}render(){let e=this.gameState.stats,t=`
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">🎲</span>
          <div class="stat-val">${e.totalRolls.toLocaleString(`pt-BR`)}</div>
          <div class="stat-lbl">Rolagens Totais</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <div class="stat-val">$${n.formatNumber(e.totalCoinsEarned)}</div>
          <div class="stat-lbl">Moedas Ganhas</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✨</span>
          <div class="stat-val">${e.totalStardustEarned.toLocaleString(`pt-BR`)}</div>
          <div class="stat-lbl">Stardust Coletado</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💎</span>
          <div class="stat-val">${e.totalGemsEarned.toLocaleString(`pt-BR`)}</div>
          <div class="stat-lbl">Gemas Coletadas</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🌌</span>
          <div class="stat-val">${e.totalDarkMatterEarned.toLocaleString(`pt-BR`)}</div>
          <div class="stat-lbl">Matéria Escura</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <div class="stat-val">$${n.formatNumber(e.highestRollIncome)}</div>
          <div class="stat-lbl">Maior Rolagem Única</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⚡</span>
          <div class="stat-val">${(e.criticalRollsCount||0).toLocaleString(`pt-BR`)}</div>
          <div class="stat-lbl">Rolagens Críticas</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🔄</span>
          <div class="stat-val">${this.gameState.rebirths}</div>
          <div class="stat-lbl">Renascimentos (Rebirths)</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏱️</span>
          <div class="stat-val">${this.formatTime(e.playTimeSeconds)}</div>
          <div class="stat-lbl">Tempo de Jogo</div>
        </div>
      </div>
    `,r=``;h.forEach(e=>{let t=!!this.gameState.achievements[e.id],n=!t&&e.condition(this.gameState);r+=`
        <div class="achievement-card ${t?`ach-unlocked`:n?`ach-claimable`:`ach-locked`}">
          <div class="ach-header">
            <span class="ach-badge">${t?`✓`:n?`🎁`:`🔒`}</span>
            <div class="ach-texts">
              <div class="ach-title">${e.name}</div>
              <div class="ach-desc">${e.desc}</div>
            </div>
          </div>
          <div class="ach-footer">
            <span class="ach-reward">Recompensa: <b>+${e.rewardGems} 💎 Gemas</b></span>
            ${n?`
              <button class="ach-claim-btn" data-id="${e.id}" data-reward="${e.rewardGems}">Resgatar Gemas</button>
            `:t?`<span class="ach-status-done">Concluída ✓</span>`:`<span class="ach-status-locked">Bloqueada</span>`}
          </div>
        </div>
      `}),this.container.innerHTML=`
      <div class="stats-view-wrapper">
        <div class="stats-section-title">
          <h2>Estatísticas da Partida</h2>
        </div>
        ${t}

        <div class="stats-section-title" style="margin-top: 2rem;">
          <h2>Conquistas & Marcos</h2>
        </div>
        <div class="achievements-grid">
          ${r}
        </div>
      </div>
    `,this.setupEvents()}setupEvents(){this.container.querySelectorAll(`.ach-claim-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.id,n=parseInt(e.dataset.reward,10);t&&n&&(this.gameState.achievements[t]=!0,this.gameState.addGems(n),i.playPurchase(),this.render())})})}},_=class{constructor(e,t){this.container=e,this.gameState=t,this.render()}render(){this.container.innerHTML=`
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
            <span id="volume-display">${Math.round(this.gameState.settings.soundVolume*100)}%</span>
          </div>
          <div class="setting-row">
            <span>Silenciar Todos os Sons:</span>
            <label class="toggle-switch">
              <input type="checkbox" id="mute-toggle" ${this.gameState.settings.soundMuted?`checked`:``} />
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
    `,this.setupEvents()}setupEvents(){let e=this.container.querySelector(`#promo-code-input`),t=this.container.querySelector(`#promo-code-btn`),n=this.container.querySelector(`#code-message`),r=()=>{let t=(e.value||``).trim();if(!t)return;let r=this.gameState.redeemCode(t);n.textContent=r.message,n.className=`code-message ${r.success?`msg-success`:`msg-error`}`,r.success?(i.playPurchase(),e.value=``):i.playClick()};t.addEventListener(`click`,r),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&r()});let a=this.container.querySelector(`#volume-slider`),o=this.container.querySelector(`#volume-display`),s=this.container.querySelector(`#mute-toggle`);a.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);this.gameState.settings.soundVolume=t,i.setVolume(t),o.textContent=`${Math.round(t*100)}%`,this.gameState.save()}),s.addEventListener(`change`,e=>{let t=e.target.checked;this.gameState.settings.soundMuted=t,i.setMuted(t),this.gameState.save()});let c=this.container.querySelector(`#btn-export-save`),l=this.container.querySelector(`#btn-import-save`),u=this.container.querySelector(`#btn-reset-save`),d=this.container.querySelector(`#save-message`);c.addEventListener(`click`,()=>{let e=localStorage.getItem(`roll_a_dice_save_v2`)||``;navigator.clipboard.writeText(e).then(()=>{d.textContent=`Salve copiado para a área de transferência!`,d.className=`code-message msg-success`,i.playPurchase()})}),l.addEventListener(`click`,()=>{let e=prompt(`Cole aqui o texto do seu salve:`);if(e)try{JSON.parse(e),localStorage.setItem(`roll_a_dice_save_v2`,e),window.location.reload()}catch{alert(`Dados de salve inválidos.`)}}),u.addEventListener(`click`,()=>{confirm(`Tem certeza absoluta que deseja apagar todo o seu progresso? Esta ação não pode ser desfeita.`)&&(this.gameState.resetAll(),window.location.reload())})}},v=class{constructor(){this.currentTab=`game`,this.currentUIInstance=null,this.lastTime=performance.now(),this.autoRollTimer=0,this.kineticPulseTimer=0,this.initDOM(),this.initEngines(),this.initTabs(),this.initHUD(),this.initControls(),this.startLoop()}initDOM(){this.sceneContainer=document.getElementById(`scene-container`),this.tabOverlay=document.getElementById(`tab-overlay`),this.tableControls=document.getElementById(`table-controls`),this.btnRollAll=document.getElementById(`btn-roll-all`),this.btnAutoRoll=document.getElementById(`btn-auto-roll`),this.autoRollStatus=document.getElementById(`auto-roll-status`),this.hudCoins=document.getElementById(`hud-coins`),this.hudStardust=document.getElementById(`hud-stardust`),this.hudGems=document.getElementById(`hud-gems`),this.hudRebirth=document.getElementById(`hud-rebirth`),this.hudDarkMatter=document.getElementById(`hud-darkmatter`)}initEngines(){this.board2D=new c(this.sceneContainer,o),o.subscribe(()=>{this.updateHUD(),this.board2D.syncWithState(),this.currentUIInstance&&typeof this.currentUIInstance.render==`function`&&this.currentUIInstance.render()})}initHUD(){this.updateHUD()}updateHUD(){let e=n.getRebirthRewards(o);this.hudCoins.querySelector(`.val`).textContent=`$${n.formatNumber(o.coins)}`,this.hudStardust.querySelector(`.val`).textContent=`${o.stardust.toLocaleString(`pt-BR`)}`,this.hudGems.querySelector(`.val`).textContent=`${o.gems.toLocaleString(`pt-BR`)}`,this.hudRebirth.querySelector(`.val`).textContent=`Rebirth ${o.rebirths} (${e.currentMultiplier.toFixed(1)}x)`,o.darkMatter>0||o.skillTree.tree_cosmic_catalyst?(this.hudDarkMatter.style.display=`flex`,this.hudDarkMatter.querySelector(`.val`).textContent=`${o.darkMatter.toLocaleString(`pt-BR`)}`):this.hudDarkMatter.style.display=`none`}initTabs(){document.querySelectorAll(`.tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tab;i.playClick(),this.switchTab(t)})})}switchTab(e){this.currentTab!==e&&(this.currentTab=e,document.querySelectorAll(`.tab-btn`).forEach(t=>{t.classList.toggle(`active`,t.dataset.tab===e)}),e===`game`?(this.tabOverlay.style.display=`none`,this.tableControls.style.display=`flex`,this.tabOverlay.className=`tab-view-overlay`,this.currentUIInstance=null,this.board2D.updateArenaBounds()):(this.tableControls.style.display=`none`,this.tabOverlay.style.display=`block`,e===`tree`?(this.tabOverlay.className=`tab-view-overlay tree-overlay-full`,this.currentUIInstance=new d(this.tabOverlay,o)):(this.tabOverlay.className=`tab-view-overlay`,e===`shop`?this.currentUIInstance=new l(this.tabOverlay,o):e===`upgrades`?this.currentUIInstance=new u(this.tabOverlay,o):e===`rebirth`?this.currentUIInstance=new m(this.tabOverlay,o):e===`stats`?this.currentUIInstance=new g(this.tabOverlay,o):e===`settings`&&(this.currentUIInstance=new _(this.tabOverlay,o)))))}initControls(){this.btnRollAll.addEventListener(`click`,()=>{this.board2D.rollAll(1.2)}),window.addEventListener(`keydown`,e=>{e.code===`Space`&&!e.target.matches(`input, textarea, button`)&&(e.preventDefault(),this.board2D.rollAll(1))}),this.btnAutoRoll.addEventListener(`click`,()=>{i.playClick(),o.settings.autoRoll=!o.settings.autoRoll,this.updateAutoRollBtn(),o.save()}),this.updateAutoRollBtn()}updateAutoRollBtn(){let e=!!o.settings.autoRoll;this.btnAutoRoll.classList.toggle(`active`,e),this.autoRollStatus.textContent=`Auto-Roll: ${e?`LIGADO`:`DESLIGADO`}`}startLoop(){let e=t=>{let n=Math.min((t-this.lastTime)/1e3,.1);this.lastTime=t,o.settings.autoRoll&&(this.autoRollTimer+=n,this.autoRollTimer>=(o.settings.autoRollInterval||4)&&(this.autoRollTimer=0,this.board2D.rollAll(1))),o.skillTree.tree_master_autoroll&&(this.kineticPulseTimer+=n,this.kineticPulseTimer>=10&&(this.kineticPulseTimer=0,this.board2D.rollAll(1.6))),this.board2D.update(n),this.board2D.render(),requestAnimationFrame(e)};requestAnimationFrame(e)}};window.addEventListener(`DOMContentLoaded`,()=>{window.game=new v});