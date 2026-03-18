import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { METRICS_CONFIG } from './metricsConfig'
import { evaluateEndings } from './endings'

export const useGameStore = create(
  persist(
    (set) => ({
      metrics: null, // Start as null to indicate no character chosen
      activeEnding: null,

      startGameWithCharacter: (characterMetrics) => 
        set({ metrics: { ...characterMetrics }, activeEnding: null }),

      applyEffects: (effects) =>
        set((state) => {
          if (!state.metrics) return state;
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

      resetGame: () =>
        set({ metrics: null, activeEnding: null }),
    }),
    { name: 'ethics-game-state' }
  )
)