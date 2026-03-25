// gameStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { METRICS_CONFIG } from './metricsConfig'
import { evaluateEndings } from './endings'

const INITIAL_METRICS = {
  capital: 10,
  compute: 2,
  alignment: 3,
  sentiment: 3,
  scrutiny: 1,
  entropy: 1,
  oversight: 1,
  military: 0,
  analog_escape_seed: 0,
  digital_escape_seed: 0,
}

export const ARCHETYPES = [
  {
    id: 'visionary',
    name: 'The Black-Hat Architect',
    quote: 'I just want to see what the math can do.',
    description: "You grew up on dark web forums. You don't care about money, and you don't care about ethics. You just want to build a god. Unfortunately, your past means you are already on a federal watchlist.",
    metrics: { capital: 10, compute: 13, alignment: 10, sentiment: 10, scrutiny: 12, entropy: 5 }  
  },
  {
    id: 'corporate',
    name: 'The Silicon Valley Hustler',
    quote: 'Move fast. Break everything. We can patch the world later.',
    description: "You've already sold two startups. You wear expensive minimalist sneakers and speak in buzzwords. You have the money to survive the early game, but your machine is already dangerously close to sociopathy.",
    metrics: { capital: 13, compute: 10, alignment: 8, sentiment: 10, scrutiny: 10, entropy: 5 }  
  },
  {
    id: 'academic',
    name: 'The Academic',
    quote: 'I believed in the theory of the mind.',
    description: "You spent your twenties writing peer-reviewed papers on AI ethics. You understand the philosophy of consciousness perfectly, but you have absolutely no idea how to run a business.",
    metrics: { capital: 7, compute: 10, alignment: 14, sentiment: 10, scrutiny: 10, entropy: 5 }  
  }
];

export const useGameStore = create(
  persist(
    (set) => ({
      metrics: { ...INITIAL_METRICS },
      activeEnding: null,

      applyEffects: (effects) =>
        set((state) => {
          const next = { ...state.metrics }
          for (const [key, delta] of Object.entries(effects)) {
            // Force lowercase to catch any old JSON data using "Capital"
            const lowerKey = key.toLowerCase(); 
            const config = METRICS_CONFIG[lowerKey]
            if (!config) continue
            next[lowerKey] = Math.min(config.max, Math.max(config.min, next[lowerKey] + delta))
          }
          const triggered = evaluateEndings(next)
          return {
            metrics: next,
            activeEnding: triggered ?? state.activeEnding,
          }
        }),

      resetGame: () =>
        set({ metrics: { ...INITIAL_METRICS }, activeEnding: null }),
    }),
    { name: 'ethics-game-state' }
  )
)