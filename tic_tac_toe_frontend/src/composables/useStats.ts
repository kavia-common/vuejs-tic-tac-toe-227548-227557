import { computed, reactive } from 'vue'

type Player = 'X' | 'O'

export type GameOutcome = Player | 'draw'

export type StatsState = {
  totalGames: number
  xWins: number
  oWins: number
  draws: number
}

const STORAGE_KEY = 'ttt_stats_v1'

function clampNonNegativeInt(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.floor(n))
}

function sanitizeStats(maybe: unknown): StatsState {
  const obj = (maybe ?? {}) as Partial<Record<keyof StatsState, unknown>>
  return {
    totalGames: clampNonNegativeInt(obj.totalGames),
    xWins: clampNonNegativeInt(obj.xWins),
    oWins: clampNonNegativeInt(obj.oWins),
    draws: clampNonNegativeInt(obj.draws),
  }
}

/**
 * Stats composable for Tic Tac Toe.
 *
 * Persistence:
 * - Stats are stored under localStorage key `ttt_stats_v1`.
 * - All localStorage access is guarded with try/catch so the app still works
 *   in environments where storage is unavailable/blocked.
 */
// PUBLIC_INTERFACE
export function useStats() {
  /** Reactive state containing counters. */
  const stats = reactive<StatsState>({
    totalGames: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
  })

  const xWinRate = computed(() => (stats.totalGames === 0 ? 0 : (stats.xWins / stats.totalGames) * 100))
  const oWinRate = computed(() => (stats.totalGames === 0 ? 0 : (stats.oWins / stats.totalGames) * 100))
  const drawRate = computed(() => (stats.totalGames === 0 ? 0 : (stats.draws / stats.totalGames) * 100))
  const anyWinRate = computed(() =>
    stats.totalGames === 0 ? 0 : ((stats.xWins + stats.oWins) / stats.totalGames) * 100,
  )

  function safeRead(): StatsState | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return sanitizeStats(JSON.parse(raw))
    } catch {
      return null
    }
  }

  function safeWrite(value: StatsState): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // ignore persistence failures (private browsing / blocked storage / etc.)
    }
  }

  function safeRemove(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  function apply(next: StatsState) {
    stats.totalGames = next.totalGames
    stats.xWins = next.xWins
    stats.oWins = next.oWins
    stats.draws = next.draws
  }

  // PUBLIC_INTERFACE
  function load(): void {
    /** Load stats from localStorage (if available). */
    const loaded = safeRead()
    if (loaded) apply(loaded)
  }

  // PUBLIC_INTERFACE
  function save(): void {
    /** Save current stats to localStorage (if available). */
    safeWrite({ ...stats })
  }

  // PUBLIC_INTERFACE
  function recordOutcome(outcome: GameOutcome): void {
    /**
     * Increment counters for a completed game outcome and persist immediately.
     * Call this exactly once per finished game.
     */
    stats.totalGames += 1
    if (outcome === 'X') stats.xWins += 1
    else if (outcome === 'O') stats.oWins += 1
    else stats.draws += 1

    save()
  }

  // PUBLIC_INTERFACE
  function reset(): void {
    /**
     * Reset all counters to 0 and clear persisted localStorage entry.
     * Does NOT affect the current game board state.
     */
    apply({ totalGames: 0, xWins: 0, oWins: 0, draws: 0 })
    safeRemove()
  }

  return {
    stats,
    xWinRate,
    oWinRate,
    drawRate,
    anyWinRate,
    load,
    save,
    recordOutcome,
    reset,
  }
}
