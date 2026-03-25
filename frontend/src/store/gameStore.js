import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { METRICS_CONFIG } from './metricsConfig'
import { evaluateEndings } from './endings'

const INITIAL_METRICS = {
  Capital: 10,
  Compute: 2,
  Alignment: 3,
  Sentiment: 3,
  Scrutiny: 1,
  Entropy: 1,
  // Hidden flags — not displayed in UI
  Oversight: 1,
  Military: 0,
  Analog_Escape_Seed: 0,
  Digital_Escape_Seed: 0,
}

export const useGameStore = create(
  persist(
    (set) => ({
      metrics: { ...INITIAL_METRICS },

      activeEnding: null,

      /**
       * Apply metric deltas from a scenario option choice.
       * e.g. { Capital: -1, Alignment: 1 }
       */
      applyEffects: (effects) =>
        set((state) => {
          const next = { ...state.metrics }
          for (const [key, delta] of Object.entries(effects)) {
            const config = METRICS_CONFIG[key]
            if (!config) continue
            next[key] = Math.min(config.max, Math.max(config.min, next[key] + delta))
          }
          const triggered = evaluateEndings(next)
          return {
            metrics: next,
            activeEnding: triggered ?? state.activeEnding,
          }
        }),

      /** Reset metrics to baseline and clear any active ending. */
      resetGame: () =>
        set({ metrics: { ...INITIAL_METRICS }, activeEnding: null }),
    }),
    { name: 'ethics-game-state' }
  )
)
