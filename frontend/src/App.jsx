import { useState, useMemo, useEffect } from 'react'
import StoryData from './acts/story.json'

// Components
import StatsPopUp from './components/StatsPopUp'
import { SceneRenderer } from './components/SceneRenderer'
import TitleScreen from './components/TitleScreen'
import CharacterSelectionScreen from './components/CharacterSelectionScreen'
import DiceModal from './components/DiceModal'

// Utilities & Store
import { useGameStore, ARCHETYPES } from './store/gameStore'
import { formatCurrency, getMetricValueColor } from './lib/utils'

const ACT3_BRANCHES = {
  a: () => import('./acts/act3_a.json'),
  b: () => import('./acts/act3_b.json'),
  c: () => import('./acts/act3_c.json'),
}

const branchConditions = StoryData.branchConditions ?? []

function resolveConditions(conditions, metrics) {
  for (const cond of conditions) {
    if (cond.default) return cond.endingId ?? cond.branch ?? null
    const met = Object.entries(cond.if ?? {}).every(([key, rule]) => {
      const val = metrics[key.toLowerCase()] ?? 0
      if (rule.gte !== undefined && val < rule.gte) return false
      if (rule.lte !== undefined && val > rule.lte) return false
      return true
    })
    if (met) return cond.endingId ?? cond.branch ?? null
  }
  return null
}

function App() {
  const { metrics, applyEffects, activeEnding, resetGame } = useGameStore()

  const [gameState, setGameState] = useState('title') // 'title' | 'selection' | 'playing' | 'ending'
  const [diceRoll, setDiceRoll] = useState(null)

  // Game progression
  const [scenes, setScenes] = useState(StoryData.scenes || StoryData.scenarios || [])
  const [sceneIndex, setSceneIndex] = useState(0)
  const [inBranch, setInBranch] = useState(false)
  const [branchMeta, setBranchMeta] = useState(null)

  const currentScene = scenes[sceneIndex]

  const handleCharacterSelect = (archetype) => {
    useGameStore.setState({ metrics: archetype.metrics })
    setSceneIndex(0)
    setGameState('playing')
  }

  const advanceScene = async () => {
    const nextIndex = sceneIndex + 1

    if (nextIndex < scenes.length) {
      setSceneIndex(nextIndex)
      return
    }

    // End of main story → branch into Act 3
    if (!inBranch) {
      const branchId = resolveConditions(branchConditions, useGameStore.getState().metrics) ?? 'c'
      const data = await ACT3_BRANCHES[branchId]()
      const bData = data.default
      setScenes(bData.scenes || bData.scenarios)
      setBranchMeta({
        endingConditions: bData.endingConditions ?? [],
        endings: bData.endings ?? [],
      })
      setSceneIndex(0)
      setInBranch(true)
      return
    }

    // End of branch → resolve final ending
    if (branchMeta?.endingConditions.length > 0) {
      const endingId = resolveConditions(branchMeta.endingConditions, useGameStore.getState().metrics)
      const matched = branchMeta.endings.find(e => e.id === endingId) ?? null
      if (matched) {
        useGameStore.setState({ activeEnding: matched })
      }
      setGameState('ending')
    }
  }

  const processPostActionChecks = async (option) => {
    const effects = option?.effects || option?.consequences?.stat_effects
    if (effects) applyEffects(effects)

    await advanceScene()
  }

const handleOptionSelect = (option) => {
    if (option.isGamble) {
      const gambleMetric = option.gambleMetric || 'Compute';
      const stateKey = gambleMetric.toLowerCase(); 
      const currentMetricValue = useGameStore.getState().metrics[stateKey] || 0;

      // Define which metrics hurt the player's odds
      const isInvertedMetric = stateKey === 'scrutiny' || stateKey === 'entropy';

      // Calculate the base modifier
      const baseModifier = Math.floor(currentMetricValue / 6); 
      
      // Invert the modifier for Scrutiny and Entropy
      const modifier = isInvertedMetric ? -baseModifier : baseModifier;

      const rawRoll = Math.floor(Math.random() * 6) + 1;
      const finalRoll = rawRoll + modifier;

      let outcome, rawEffects;
      
      // A natural 1 is always a critical failure, even with high stats
      if (rawRoll === 1) {
        outcome = 'crit'; 
        rawEffects = option.failureEffects;
      } else if (finalRoll >= 4) {
        outcome = 'success'; 
        rawEffects = option.successEffects;
      } else {
        outcome = 'failure'; 
        rawEffects = option.failureEffects;
      }

      setDiceRoll({
        rawRoll, 
        modifier, 
        finalRoll, 
        outcome, 
        gambleMetric,
        failureDescription: option.failureDescription,
        effectsToApply: JSON.parse(JSON.stringify(rawEffects ?? {})),
        originalOption: option,
      });
      return;
    }

    processPostActionChecks(option);
  }

  const handleDiceClose = () => {
    if (!diceRoll) return
    const resolvedOption = { ...diceRoll.originalOption, effects: diceRoll.effectsToApply }
    setDiceRoll(null)
    processPostActionChecks(resolvedOption)
  }

  const handleRestart = () => {
    resetGame()
    setGameState('title')
    setInBranch(false)
    setBranchMeta(null)
    setScenes(StoryData.scenes || StoryData.scenarios || [])
  }

  return (
    <>
      <div className="bg-[url(./assets/images/main_screen_2.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20 mix-blend-overlay" />

        {diceRoll && <DiceModal diceRoll={diceRoll} onConfirm={handleDiceClose} />}

        {gameState === 'title' && (
          <div id="text-area" className="absolute ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[55%] lg:w-[50%] text-white h-[80%] sm:h-[75%] p-2 rounded-lg flex flex-col items-center justify-between overflow-y-auto">
            <TitleScreen onStart={() => setGameState('selection')} />
          </div>
        )}

        {gameState === 'selection' && (
          <div id="text-area" className="absolute ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[55%] lg:w-[50%] text-white h-[80%] sm:h-[75%] p-2 rounded-lg flex flex-col items-center justify-between overflow-y-auto">
            <CharacterSelectionScreen
              archetypes={ARCHETYPES}
              onSelect={handleCharacterSelect}
              getMetricValueColor={getMetricValueColor}
              formatCurrency={formatCurrency}
            />
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <StatsPopUp playerStats={metrics} gameState={gameState} />

            {currentScene && (
              <div
                id="text-area"
                className="relative p-6 ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] text-white h-[85%] sm:h-[80%] border border-cyan-900/50 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.05)] flex flex-col overflow-hidden z-10"
              >
                <div className="flex-1 p-6 sm:p-8 overflow-hidden flex flex-col mt-2">
                  <SceneRenderer
                    scene={currentScene}
                    onOptionSelect={handleOptionSelect}
                    gameStats={metrics}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {gameState === 'ending' && (
          <div className="z-30 w-[90%] sm:w-[75%] md:w-[60%] h-[80%] p-6 md:p-10 rounded-xl shadow-2xl border border-red-900/50 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-4xl font-bold text-red-500 mb-6">{activeEnding?.title || 'The End'}</h1>
            <p className="max-w-2xl text-lg text-gray-300 mb-10 leading-relaxed">
              {activeEnding?.narrative ||
                (activeEnding?.contentBlocks?.map(block => block.text).join(' ') ||
                'Your journey concludes here.')}
            </p>
            <button
              onClick={handleRestart}
              className="border border-red-500 text-red-500 px-8 py-3 hover:bg-red-500 hover:text-black transition rounded font-bold tracking-widest uppercase"
            >
              Initialize New Seed
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default App