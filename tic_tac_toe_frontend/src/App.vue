<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useStats } from './composables/useStats'

type Player = 'X' | 'O'
type CellValue = Player | null

const board = ref<CellValue[]>(Array(9).fill(null))
const currentPlayer = ref<Player>('X')

/**
 * Calculates the winner (if any) given a 3x3 tic tac toe board.
 */
function calculateWinner(cells: CellValue[]): { winner: Player | null; line: number[] | null } {
  const lines: number[][] = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const line of lines) {
    const [a, b, c] = line
    const v = cells[a]
    if (v && v === cells[b] && v === cells[c]) {
      return { winner: v, line }
    }
  }
  return { winner: null, line: null }
}

const winnerInfo = computed(() => calculateWinner(board.value))
const winner = computed(() => winnerInfo.value.winner)
const winningLine = computed(() => winnerInfo.value.line)

const isDraw = computed(() => {
  return !winner.value && board.value.every((c) => c !== null)
})

const statusText = computed(() => {
  if (winner.value) return `Winner: ${winner.value}`
  if (isDraw.value) return `It's a draw.`
  return `Turn: ${currentPlayer.value}`
})

const isGameOver = computed(() => Boolean(winner.value) || isDraw.value)

function isCellWinning(index: number): boolean {
  const line = winningLine.value
  if (!line) return false
  return line.includes(index)
}

function canPlayCell(index: number): boolean {
  return !isGameOver.value && board.value[index] === null
}

/**
 * Stats:
 * - Persisted to localStorage (guarded so the game still works if storage is unavailable).
 * - Updated automatically once per completed game (win/draw).
 */
const { stats, xWinRate, oWinRate, drawRate, anyWinRate, load: loadStats, recordOutcome, reset: resetStats } = useStats()

/**
 * Tracks whether the currently displayed game has already been recorded into stats.
 * This prevents double-counting when computed state re-evaluates.
 */
const hasRecordedThisGame = ref(false)

onMounted(() => {
  loadStats()
})

watch(
  isGameOver,
  (overNow) => {
    if (!overNow) {
      // New game started / board reset -> allow recording again.
      hasRecordedThisGame.value = false
      return
    }

    // Record exactly once when the game transitions to "over".
    if (hasRecordedThisGame.value) return

    if (winner.value === 'X' || winner.value === 'O') {
      recordOutcome(winner.value)
      hasRecordedThisGame.value = true
    } else if (isDraw.value) {
      recordOutcome('draw')
      hasRecordedThisGame.value = true
    }
  },
  { immediate: true },
)

function playCell(index: number) {
  if (!canPlayCell(index)) return

  const next = board.value.slice()
  next[index] = currentPlayer.value
  board.value = next

  // Only toggle if game isn't over after the move
  const { winner: w } = calculateWinner(next)
  if (!w && !next.every((c) => c !== null)) {
    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'
  }
}

function resetGame() {
  board.value = Array(9).fill(null)
  currentPlayer.value = 'X'
}
</script>

<template>
  <main class="page">
    <section class="layout" aria-label="Tic Tac Toe with Statistics">
      <!-- Stats panel -->
      <aside class="statsCard" aria-label="Statistics dashboard">
        <header class="statsHeader">
          <div>
            <h2 class="statsTitle">Statistics</h2>
            <p class="statsSubtitle">Persisted across refreshes on this device.</p>
          </div>

          <button class="statsResetBtn" type="button" @click="resetStats">Reset Statistics</button>
        </header>

        <div class="statsGrid" role="list" aria-label="Game statistics">
          <div class="statItem" role="listitem">
            <div class="statLabel">Total games</div>
            <div class="statValue">{{ stats.totalGames }}</div>
          </div>

          <div class="statItem" role="listitem">
            <div class="statLabel">X wins</div>
            <div class="statValue statPrimary">{{ stats.xWins }}</div>
            <div class="statCaption">Win rate: {{ xWinRate.toFixed(0) }}%</div>
          </div>

          <div class="statItem" role="listitem">
            <div class="statLabel">O wins</div>
            <div class="statValue statSecondary">{{ stats.oWins }}</div>
            <div class="statCaption">Win rate: {{ oWinRate.toFixed(0) }}%</div>
          </div>

          <div class="statItem" role="listitem">
            <div class="statLabel">Draws</div>
            <div class="statValue statError">{{ stats.draws }}</div>
            <div class="statCaption">Draw rate: {{ drawRate.toFixed(0) }}%</div>
          </div>
        </div>

        <div class="statsFooter">
          <span class="statsFooterLabel">Overall (non-draw) win rate:</span>
          <span class="statsFooterValue">{{ anyWinRate.toFixed(0) }}%</span>
        </div>
      </aside>

      <!-- Game card -->
      <section class="card" aria-label="Tic Tac Toe">
        <header class="header">
          <div class="titleWrap">
            <h1 class="title">Tic Tac Toe</h1>
            <p class="subtitle">Two players. Take turns. First to three in a row wins.</p>
          </div>

          <div class="status" role="status" aria-live="polite">
            <span
              class="statusPill"
              :class="{
                statusPrimary: !winner && !isDraw,
                statusSuccess: winner,
                statusSecondary: isDraw,
              }"
            >
              {{ statusText }}
            </span>
          </div>
        </header>

        <div class="boardWrap">
          <div class="board" role="grid" aria-label="3 by 3 board">
            <button
              v-for="(cell, idx) in board"
              :key="idx"
              class="cell"
              type="button"
              role="gridcell"
              :aria-label="`Cell ${idx + 1}${cell ? `, ${cell}` : ''}`"
              :disabled="!canPlayCell(idx)"
              :class="{
                cellFilled: cell !== null,
                cellX: cell === 'X',
                cellO: cell === 'O',
                cellWin: isCellWinning(idx),
              }"
              @click="playCell(idx)"
            >
              <span class="cellValue" aria-hidden="true">{{ cell ?? '' }}</span>
            </button>
          </div>
        </div>

        <footer class="footer">
          <button class="resetBtn" type="button" @click="resetGame">Reset game</button>

          <div class="legend" aria-label="Legend">
            <div class="legendItem">
              <span class="dot dotPrimary" aria-hidden="true"></span>
              <span>Primary: #3b82f6</span>
            </div>
            <div class="legendItem">
              <span class="dot dotSuccess" aria-hidden="true"></span>
              <span>Success: #06b6d4</span>
            </div>
          </div>
        </footer>
      </section>
    </section>
  </main>
</template>

<style scoped>
/* Theme tokens per request */
.page {
  --ttt-primary: #3b82f6;
  --ttt-success: #06b6d4;
  --ttt-error: #ef4444;
  --ttt-secondary: #64748b;
  --ttt-bg: #f9fafb;
  --ttt-surface: #ffffff;
  --ttt-text: #111827;

  --ttt-border: rgba(17, 24, 39, 0.12);
  --ttt-shadow: 0 12px 30px rgba(17, 24, 39, 0.08);

  min-height: calc(100vh - 4rem);
  display: grid;
  place-items: center;
  background: var(--ttt-bg);
  padding: 1.25rem;
  color: var(--ttt-text);
}

.layout {
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1rem;
  align-items: start;
}

/* Shared card style */
.card,
.statsCard {
  background: var(--ttt-surface);
  border: 1px solid var(--ttt-border);
  border-radius: 16px;
  box-shadow: var(--ttt-shadow);
  padding: 1.25rem;
}

/* Stats panel */
.statsHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.statsTitle {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.statsSubtitle {
  margin: 0.25rem 0 0 0;
  color: var(--ttt-secondary);
  font-size: 0.85rem;
}

.statsResetBtn {
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
  color: var(--ttt-error);
  font-weight: 700;
  border-radius: 12px;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.06s ease;
}

.statsResetBtn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.55);
}

.statsResetBtn:active {
  transform: translateY(1px);
}

.statsResetBtn:focus-visible {
  outline: 3px solid rgba(239, 68, 68, 0.25);
  outline-offset: 2px;
}

.statsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.65rem;
}

.statItem {
  border: 1px solid var(--ttt-border);
  border-radius: 14px;
  padding: 0.75rem 0.85rem;
  background: rgba(249, 250, 251, 0.65);
}

.statLabel {
  color: var(--ttt-secondary);
  font-size: 0.85rem;
}

.statValue {
  margin-top: 0.25rem;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.statCaption {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--ttt-secondary);
}

.statPrimary {
  color: var(--ttt-primary);
}

.statSecondary {
  color: var(--ttt-secondary);
}

.statError {
  color: var(--ttt-error);
}

.statsFooter {
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--ttt-border);
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: baseline;
}

.statsFooterLabel {
  color: var(--ttt-secondary);
  font-size: 0.85rem;
}

.statsFooterValue {
  font-weight: 800;
}

/* Game */
.header {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.titleWrap {
  min-width: 220px;
}

.title {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0.35rem 0 0 0;
  color: var(--ttt-secondary);
  font-size: 0.95rem;
}

.status {
  display: flex;
  align-items: center;
}

.statusPill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--ttt-border);
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  background: #fff;
}

.statusPrimary {
  border-color: rgba(59, 130, 246, 0.35);
  color: var(--ttt-primary);
  background: rgba(59, 130, 246, 0.08);
}

.statusSuccess {
  border-color: rgba(6, 182, 212, 0.45);
  color: var(--ttt-success);
  background: rgba(6, 182, 212, 0.1);
}

.statusSecondary {
  border-color: rgba(100, 116, 139, 0.35);
  color: var(--ttt-secondary);
  background: rgba(100, 116, 139, 0.09);
}

.boardWrap {
  display: grid;
  place-items: center;
  padding: 0.75rem 0;
}

.board {
  width: min(360px, 92vw);
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cell {
  appearance: none;
  border: 1px solid var(--ttt-border);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 0 rgba(17, 24, 39, 0.04);
  cursor: pointer;

  display: grid;
  place-items: center;

  transition:
    transform 0.06s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.cell:hover:enabled {
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow:
    0 10px 18px rgba(59, 130, 246, 0.08),
    0 2px 0 rgba(17, 24, 39, 0.04);
  transform: translateY(-1px);
}

.cell:active:enabled {
  transform: translateY(0px);
}

.cell:focus-visible {
  outline: 3px solid rgba(59, 130, 246, 0.35);
  outline-offset: 2px;
}

.cell:disabled {
  cursor: not-allowed;
  opacity: 0.92;
}

.cellValue {
  font-size: clamp(2.4rem, 8vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.cellX .cellValue {
  color: var(--ttt-primary);
}

.cellO .cellValue {
  color: var(--ttt-secondary);
}

.cellWin {
  border-color: rgba(6, 182, 212, 0.55);
  background: rgba(6, 182, 212, 0.1);
  box-shadow:
    0 14px 26px rgba(6, 182, 212, 0.12),
    0 2px 0 rgba(17, 24, 39, 0.04);
}

.footer {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.75rem;
  justify-items: center;
}

.resetBtn {
  width: 100%;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.08);
  color: var(--ttt-primary);
  font-weight: 700;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  cursor: pointer;

  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.06s ease;
}

.resetBtn:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.5);
}

.resetBtn:active {
  transform: translateY(1px);
}

.resetBtn:focus-visible {
  outline: 3px solid rgba(59, 130, 246, 0.35);
  outline-offset: 2px;
}

.legend {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--ttt-secondary);
  font-size: 0.85rem;
}

.legendItem {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--ttt-border);
  background: rgba(249, 250, 251, 0.7);
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.dotPrimary {
  background: var(--ttt-primary);
}

.dotSuccess {
  background: var(--ttt-success);
}

@media (max-width: 820px) {
  .layout {
    max-width: 560px;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .card,
  .statsCard {
    padding: 1rem;
  }
  .legend {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
