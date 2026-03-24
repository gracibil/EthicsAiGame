import { useState, useMemo, useEffect } from 'react'
import StoryData from './acts/story.json'
import EventsData from './events.json'

// Components
import EventPopUp from './components/EventPopUp'
import StatsPopUp from './components/StatsPopUp'
import { OptionSelectWindow } from './components/OptionSelectWindow'
import TextWindow from './components/TextWindow'
import TitleScreen from './components/TitleScreen'
import CharacterSelectionScreen from './components/CharacterSelectionScreen'
import DiceModal from './components/DiceModal'

// Utilities & Store
import { useGameStore } from './store/gameStore'
import { evaluateEndings } from './store/endings'
import { formatCurrency, getMetricValueColor } from './lib/utils'

const ACT3_BRANCHES = {
  a: () => import('./acts/act3_a.json'),
  b: () => import('./acts/act3_b.json'),
  c: () => import('./acts/act3_c.json'),
}

const branchConditions = StoryData.branchConditions ?? []

const ARCHETYPES = [
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

// Evaluate a conditions array against a metrics snapshot.
function resolveConditions(conditions, metrics) {
  for (const cond of conditions) {
    if (cond.default) return cond.endingId ?? cond.branch ?? null
    const met = Object.entries(cond.if ?? {}).every(([key, rule]) => {
      const val = metrics[key] ?? 0
      if (rule.gte !== undefined && val < rule.gte) return false
      if (rule.lte !== undefined && val > rule.lte) return false
      return true
    })
    if (met) return cond.endingId ?? cond.branch ?? null
  }
  return null
}

function App() {
  // Global Store
  const { metrics, applyEffects, activeEnding, resetGame } = useGameStore()

  // UI Flow State
  const [gameState, setGameState] = useState('title') // 'title', 'selection', 'playing', 'ending'
  const [isReadingFinished, setIsReadingFinished] = useState(false)
  const [diceRoll, setDiceRoll] = useState(null)
  
  // Game Progression State
  const [scenes, setScenes] = useState(StoryData.scenes || StoryData.scenarios || [])
  const [currentScenario, setCurrentScenario] = useState(null)
  const [inBranch, setInBranch] = useState(false)
  const [branchMeta, setBranchMeta] = useState(null) 
  const [endingScene, setEndingScene] = useState(null)
  
  // Events State
  const [currentEvent, setCurrentEvent] = useState(null)
  const [eventOpen, setEventOpen] = useState(false)
  const allEvents = useMemo(() => [...EventsData.events], [])

  // Watch for global ending trigger
  useEffect(() => {
    if (activeEnding) {
      setGameState('ending')
    }
  }, [activeEnding])

  const handleCharacterSelect = (archetype) => {
    // Override starting metrics in Zustand store
    useGameStore.setState({ metrics: archetype.metrics })
    setCurrentScenario(scenes[0]) 
    setGameState('playing')
  }

  const checkEvents = () => {
    const currentMetrics = useGameStore.getState().metrics
    const triggeredEvent = allEvents.find(event => {
      if (!event.triggers) return false
      return Object.entries(event.triggers).every(
        ([key, val]) => (currentMetrics[key] ?? 0) >= val
      )
    })

    if (triggeredEvent) {
      allEvents.splice(allEvents.indexOf(triggeredEvent), 1)
      return triggeredEvent
    }
    return null
  }

  const advanceScene = async (option) => {
    // 1. Check if option has a specific next scenario
    let nextScenario = null;
    
    if (option && option.nextScenario) {
      nextScenario = scenes.find(s => s.id === option.nextScenario)
    } else {
      // Default to linear or next sequentially linked scenario
      const currentIndex = scenes.findIndex(s => s.id === currentScenario?.id);
      nextScenario = scenes[currentIndex + 1]; 
    }

    if (nextScenario) {
      setCurrentScenario(nextScenario)
      return
    }

    // 2. No more scenes in current array -> Trigger Act 3 Branching
    if (!inBranch) {
      const branchId = resolveConditions(branchConditions, useGameStore.getState().metrics) ?? 'c'
      const data = await ACT3_BRANCHES[branchId]()
      const bData = data.default
      
      setScenes(bData.scenes || bData.scenarios)
      setBranchMeta({
        endingConditions: bData.endingConditions ?? [],
        endings: bData.endings ?? [],
      })
      setCurrentScenario((bData.scenes || bData.scenarios)[0])
      setInBranch(true)
      return
    }

    // 3. End of branch scenes -> Resolve final ending
    if (branchMeta && branchMeta.endingConditions.length > 0) {
      const currentMetrics = useGameStore.getState().metrics
      const endingId = resolveConditions(branchMeta.endingConditions, currentMetrics)
      const matched = branchMeta.endings.find(e => e.id === endingId) ?? null
      
      if (matched) {
        setEndingScene(matched)
        setCurrentScenario(matched) // Display the ending text in the window
      }
    }
  }

  const processPostActionChecks = async (option) => {
    // Apply standard stat effects using Zustand
    const effects = option?.effects || option?.consequences?.stat_effects
    if (effects) applyEffects(effects)

    // Check for hard endings
    const ending = evaluateEndings(useGameStore.getState().metrics)
    if (ending || activeEnding) {
      useGameStore.setState({ activeEnding: ending || activeEnding })
      setGameState('ending')
      return
    }
    
    // Check for direct event consequence
    if (option?.consequences?.event) {
      const eventScenario = allEvents.find(e => e.id === option.consequences.event)
      if (eventScenario) {
        setCurrentEvent(eventScenario)
        setEventOpen(true)
        return
      }
    }

    // Check for passive event triggers
    const event = checkEvents()
    if (event){
      setCurrentEvent(event)
      setEventOpen(true)
      return
    }

    // If no interruptions, proceed
    await advanceScene(option)
  }

  const handleOptionSelect = (option) => {
    setIsReadingFinished(false);
    
    // DICE ROLL CHECK
    if (option.isGamble) {
      const gambleMetric = option.gambleMetric || 'compute'; 
      const currentMetricValue = useGameStore.getState().metrics[gambleMetric] || 0;
      const modifier = Math.floor(currentMetricValue / 12);
      const rawRoll = Math.floor(Math.random() * 6) + 1;
      const finalRoll = rawRoll + modifier;

      let outcome, rawEffects;

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

      let effectsToApply = JSON.parse(JSON.stringify(rawEffects ?? {}));

      setDiceRoll({
        rawRoll, modifier, finalRoll, outcome, gambleMetric,
        failureDescription: option.failureDescription,
        effectsToApply,
        originalOption: option
      });
      return; 
    }

    // STANDARD OPTION RESOLUTION
    processPostActionChecks(option)
  }

  const handleDiceClose = () => {
    if (!diceRoll) return;

    // Apply the gambled consequences via a synthetic option
    const resolvedOption = {
      ...diceRoll.originalOption,
      effects: diceRoll.effectsToApply
    }

    setDiceRoll(null);
    processPostActionChecks(resolvedOption);
  }

  const handleRestart = () => {
    resetGame();
    setGameState('title');
    setInBranch(false);
    setBranchMeta(null);
    setEndingScene(null);
    setScenes(StoryData.scenes || StoryData.scenarios || []);
  }

  return (
    <>
      <div className={`bg-[url(./assets/images/main_screen_2.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] items-center justify-center`}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20 mix-blend-overlay"></div>

        {diceRoll && <DiceModal diceRoll={diceRoll} onConfirm={handleDiceClose} />}

        {gameState === 'title' && (
          <div id='text-area' className='absolute ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[55%] lg:w-[50%] text-white h-[80%] sm:h-[75%] p-2 rounded-lg flex flex-col items-center justify-between overflow-y-auto'>
            <TitleScreen onStart={() => setGameState('selection')} />
          </div>
        )}

        {gameState === 'selection' && (
          <div id='text-area' className='absolute ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[55%] lg:w-[50%] text-white h-[80%] sm:h-[75%] p-2 rounded-lg flex flex-col items-center justify-between overflow-y-auto'>
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
            
            {currentEvent && (
              <EventPopUp 
                event={currentEvent} 
                open={eventOpen} 
                gameState={metrics} 
                setOpen={setEventOpen} 
                onOptionSelect={(opt) => {
                  setEventOpen(false);
                  setCurrentEvent(null);
                  processPostActionChecks(opt);
                }} 
              />
            )}
            
            {currentScenario && !eventOpen && (
              <div id='text-area' className='absolute p-6 ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] text-white h-[85%] sm:h-[80%] border border-cyan-900/50 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.05)] flex flex-col overflow-hidden z-10 bg-black/40 backdrop-blur-sm'>
                  
                  <div className="flex-1 p-6 sm:p-8 overflow-hidden flex flex-col">
                      <TextWindow 
                        scenario={currentScenario} 
                        onFinish={setIsReadingFinished} 
                      />
                  </div>

                  {isReadingFinished && currentScenario.options && currentScenario.options.length > 0 && (
                      <div className="p-4 sm:p-6 border-t border-cyan-900/50 shrink-0 animate-fade-in">
                          <OptionSelectWindow 
                            gameState={metrics} 
                            scenario={currentScenario} 
                            onOptionSelect={handleOptionSelect} 
                            className='w-full flex flex-col items-stretch justify-center gap-3' 
                          />
                      </div>
                  )}

                  {/* Handle branch ending continuation where there are no options */}
                  {isReadingFinished && endingScene && (!currentScenario.options || currentScenario.options.length === 0) && (
                     <div className="p-4 sm:p-6 border-t border-cyan-900/50 shrink-0 flex justify-center">
                        <button onClick={() => setGameState('ending')} className="border border-white px-6 py-2 hover:bg-white hover:text-black transition">
                          Continue to Epilogue
                        </button>
                     </div>
                  )}
              </div>    
            )}
          </>
        )}

        {gameState === 'ending' && (
          <div className="z-30 w-[90%] sm:w-[75%] md:w-[60%] h-[80%] p-6 md:p-10 rounded-xl bg-black/80 backdrop-blur-md shadow-2xl border border-red-900/50 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-4xl font-bold text-red-500 mb-6">{activeEnding?.title || "The End"}</h1>
            <p className="max-w-2xl text-lg text-gray-300 mb-10 leading-relaxed">
              {activeEnding?.narrative || (endingScene && endingScene.text) || "Your journey concludes here."}
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