# Roll A Dice — Roblox Edition (Reprodução Fiel Completa)

Este projeto é uma reprodução fiel e detalhada das mecânicas, abas, economia e sistemas visuais do jogo **Roll A Dice** do Roblox (inspirado no clássico *IncremDice*).

---

## 🌟 1. Principais Sistemas Implementados

### 🎲 Simulação 3D & Física Realista de Dados
- **Renderização 3D**: Desenvolvido com **Three.js** com iluminação dinâmica, sombras suaves e texturas procedurais de alta fidelidade para 11 tiers de dados.
- **Física Realista**: Desenvolvido com **Cannon-es**, com gravidade, restituição ajustável (elasticidade das bordas), fricção e detecção exata da face voltada para cima (+Y) através do quaternion do corpo rígido.
- **Helper Hands 3D**: Mãos mecânicas animadas que orbitam o tabuleiro e empurram fisicamente os dados em intervalos regulares.
- **Preservação de Estado**: A navegação entre abas **não reinicia a cena 3D**. A física e a automação continuam rodando fluidamente em segundo plano.

### 🌌 Árvore de Habilidades Completa (Skill Tree)
- **Interface Interativa Pan & Zoom**:
  - Arraste com mouse (pan) ou toque móvel.
  - Zoom com scroll wheel, botões `+` e `-`, e botão `🎯 Centralizar`.
  - Suporte completo a gestos de pinça (pinch-to-zoom) no mobile.
- **33 Nós Interconectados em 5 Ramos Distintos**:
  1. **Automação & Mãos**: Mãos Mecânicas I, II e III, Engrenagens Lubrificadas, Palma Magnética, Mãos Quânticas, Sobrecarga Cinética (Pulso 2x a cada 10s).
  2. **Riqueza & Multiplicadores**: Faces Douradas (+50% base por nível), Seis da Sorte (face 6 rende até 5x), Sinergia de Dados (+15% por dado ativo extra), Cascata de Riqueza (+25% de bônus cumulativo entre tiers), Rolagens Críticas, Mestre dos Críticos (10x em críticos), Fortuna Exponencial (+10% por dado colecionado).
  3. **Stardust & Cósmico**: Gênese Estelar (dados normais passam a dropar Stardust ✨ ao caírem no 6), Estrelas Cadentes (estrelas cadentes clicáveis que caem na mesa com recompensas imediatas), Colheitadeira Estelar, Ressonância Estelar (+2% renda por 10 Stardust mantidos), Catalisador de Matéria Escura 🌌, Infusão Escura (+500% por nível), Singularidade (3x em todos os recursos).
  4. **Maestria de Dados & Física**: Mesa Ampliada (+25% de área física no tabuleiro), Bordas Elásticas, Slots Adicionais I e II (capacidade expandida de dados), Massa Cinética, Prisma Celestial.
  5. **Renascimento & Transcendência**: Catalisador de Rebirth (-25% no requisito de moedas), Retenção de Legado (preserva até 90% dos upgrades comuns após o Rebirth), Surto de Rebirth (+200% por rebirth), Início Dourado (começa com $10.000 e 2 Dados de Bronze), Sabedoria Eterna (+50% Stardust e +25% Gemas).
- **Linhas SVG Dinâmicas**: Conectores com curvas de Bézier que acendem em azul brilhante quando disponíveis e em dourado quando compradas.
- **Painel de Detalhes (Inspector Modal)**: Informações completas do nó, bônus atual vs próximo nível, checklist de requisitos e validação imediata de compra.

### 💎 Sistema de Recursos Separados
1. **Moedas ($)**: Ganhas ao rolar dados. Gastas na Loja de Dados e nos Upgrades Comuns.
2. **Stardust (✨)**: Recurso estelar gasto exclusivamente na Árvore de Habilidades. Obtido em rolagens de 6 com *Gênese Estelar*, estrelas cadentes clicáveis, Dados Estelares, códigos e recompensas de Rebirth.
3. **Gemas (💎)**: Moeda rara obtida em conquistas e Rebirths.
4. **Matéria Escura (🌌)**: Recurso cósmico obtido em rolagens críticas na face 6 com o *Catalisador*, gasto nos nós cósmicos mais poderosos.
5. **Rebirth Multiplier (🔄)**: Multiplicador permanente aplicado globalmente a todas as rendas.

### 🔄 Sistema de Rebirth (Transcendência Atômica)
- **Requisitos Dinâmicos**: Escalonamento exponencial com barras de progresso ao vivo para Moedas e Dados Ativos.
- **Janela de Confirmação Detalhada**: Explica claramente os ganhos e as perdas antes de executar.
- **Transação Lógica Única**:
  - Verifica requisitos.
  - Concede multiplicadores permanentes, Stardust e Gemas.
  - Aplica o bônus de *Retenção de Legado* e *Início Dourado*.
  - Zera apenas o saldo de moedas e os upgrades comuns não retidos.
  - Dispara celebração sonora e chuva de confetes.
  - Salva o novo estado instantaneamente.

### 🛒 Loja de Dados (11 Tiers)
- Madeira (1x)
- Bronze (2.5x)
- Ferro (6x)
- Prata (15x)
- Ouro (40x)
- Diamante (120x)
- Esmeralda (400x)
- Rubi (1,500x)
- Obsidiana (5,000x)
- Dado Estelar (20,000x + 1 Stardust garantido por rolagem)
- Dado Cósmico (100,000x + 1 Matéria Escura)

### ⚡ Upgrades Comuns (Moedas)
- Seletor de compras múltiplas: `1x`, `5x`, `10x`, e `MÁX`.
- **Suporte à tecla Shift**: Segurar a tecla Shift ativa o modo de compra **MÁX** instantaneamente.

### 🎟️ Códigos Promocionais (Promo Codes)
- `release`: +6.000 moedas
- `rolladice`: +4.000 moedas e +5 Stardust ✨
- `stardust`: +15 Stardust ✨
- `gems`: +10 Gemas 💎

---

## 🚀 Como Executar o Jogo Localmente

Certifique-se de estar na pasta do projeto:
```bash
cd c:\Users\Aluno\Desktop\jogo2
```

Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

Ou para pré-visualizar a versão de produção otimizada:
```bash
npm run preview
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`) no seu navegador!
