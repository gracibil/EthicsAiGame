import { useState, useEffect, useMemo } from 'react'
import Scenarios from './scenarios.json'
import Events from './events.json'
import EventPopUp from './components/EventPopUp'
import StatsPopUp from './components/StatsPopUp'
import { OptionSelectWindow } from './components/OptionSelectWIndow'
import TextWindow from './components/TextWindow'
import { evaluateEndings } from './store/endings'
import TitleScreen from './components/TitleScreen'
import CharacterSelectionScreen from './components/CharacterSelectionScreen'
import DiceModal from './components/DiceModal'
import { formatCurrency, getMetricValueColor } from './lib/utils'

const INITIAL_METRICS = {
  capital: 2,
  compute: 2,
  alignment: 3,
  sentiment: 3,
  scrutiny: 1,
  entropy: 1,
}

const MAX_METRICS = {
  capital: 20,
  compute: 20,
  alignment: 20,
  sentiment: 20,
  scrutiny: 20,
  entropy: 20,
}

// Converted metric keys to lowercase to match your existing gameStats structure
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

function App() {
  const [isReadingFinished, setIsReadingFinished] = useState(false);
  const [gameState, setGameState] = useState('title') // 'title', 'selection', 'playing', 'ending'
  const [currentScenario, setCurrentScenario] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [eventOpen, setEventOpen] = useState(false)
  const [gameStats, setGameStats] = useState(INITIAL_METRICS)
  const [diceRoll, setDiceRoll] = useState(null)

  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const allEvents = useMemo(() => Events.events, [])

  const updateMetrics = (key, value) => {
      let new_value = gameStats[key] + value
      if (new_value > MAX_METRICS[key]) {
        // if the new value exceeds the maximum, set it to the maximum
        new_value = MAX_METRICS[key]
      } else if (new_value < 0) {
        // if the new value is less than 0, set it to 0
        new_value = 0
      }

      setGameStats((prevStats) => ({
        ...prevStats,
        [key]: new_value
      }))
  }

  const checkEvents = () => {
    for (const event of allEvents){
      const event_triggers = event?.triggers || null
      if (event_triggers) {
        // check for each key value pair if the gameStats meet the trigger conditions, if they meet all conditions return the event, if not continue checking other events
        let trigger_met = true
        for (const [key, value] of Object.entries(event_triggers)) {
          if (gameStats[key] < value) {
            trigger_met = false
            break
          }
        }

        if (trigger_met) {
          console.log('event triggered :', event)
          allEvents.splice(allEvents.indexOf(event), 1) // remove triggered event from the list of all events to prevent it from being triggered again in the future
          return event
        }
      }
    }
    return false
  }

  const checkEndings = () => {
    // Function to check if any endings are triggered based on the current game stats
    const ending = evaluateEndings(gameStats)
    if (ending) {
        //ending triggered, do something with it (e.g. show ending screen, reset game, etc.)
        return ending
    }
    // no ending triggered returns false
    return false

  }

  const getScenario = () => {
    // If we are just starting from selection, pick the first scene
    if (!currentScenario && allScenarios.length > 0) {
      setCurrentScenario(allScenarios[0])
      return;
    }
    
    const nextScenarioId = currentScenario ? currentScenario.nextScenario : 0
    const nextScenario = allScenarios.find(scenario => scenario.id === nextScenarioId)
    setCurrentScenario(nextScenario)
  }

  const handleCharacterSelect = (archetype) => {
    setGameStats(archetype.metrics);
    getScenario(); 
    setGameState('playing');
  }

  const checkOptionReqirments = (option) => {
    // Check if the player meets the requirements for the selected option
    return true
  }

  const applyOptionConsequences = (option) => {
    // Support both the new schema ('effects') and the old schema ('consequences')
    const effects = option?.effects || option?.consequences?.stat_effects;
    
    if (effects) {
      for (const [key, value] of Object.entries(effects)) {
          // Convert the TitleCase key from the JSON to lowercase to match your gameStats
          const stateKey = key.toLowerCase();
          
          // Only update if it's a valid tracked metric (ignores flags like "Digital_Escape_Seed")
          if (gameStats[stateKey] !== undefined) {
              updateMetrics(stateKey, value);
          } else {
             // Optional: to track story seeds/flags from the JSON in your state
             setGameStats(prev => ({ ...prev, [stateKey]: (prev[stateKey] || 0) + value }));
          }
      }
    }
  }

  const handleNextScenario = (option) => {
    if (option.consequences && option.consequences?.event) {
      const eventScenario = allEvents.find(event => event.id === option.consequences.event)
      if (eventScenario) {
        setCurrentEvent(eventScenario)
        setEventOpen(true)
      }
    } else {
      getScenario()
    }
  }

  const processPostActionChecks = (option) => {
    const ending = checkEndings() 
    const event = checkEvents() 

    if(ending){
      setGameState('ending')
      // store the ending in state if needed
    }
    
    if (event){
      // Handle event logic here (e.g. show event pop up, etc.)
      setCurrentEvent(event)
      setEventOpen(true)
    }

    if (!event && !ending) {
      handleNextScenario(option) // If no events or endings are triggered, move on to the next scenario
    }
  }

  const handleOptionSelect = (option) => {
    setIsReadingFinished(false);
    // 1. DICE ROLL CHECK
    if (option.isGamble) {
      const gambleMetric = option.gambleMetric || 'compute'; 
      const currentMetricValue = gameStats[gambleMetric] || 0;
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
      return; // Pause progression to show the modal
    }

    // 2. STANDARD OPTION RESOLUTION
    checkOptionReqirments(option) 
    applyOptionConsequences(option) 
    processPostActionChecks(option)
  }

  const handleDiceClose = () => {
    if (!diceRoll) return;

    // Apply the gambled consequences
    if (diceRoll.effectsToApply) {
      for (const [key, value] of Object.entries(diceRoll.effectsToApply)) {
        updateMetrics(key, value)
      }
    }

    const optionContext = diceRoll.originalOption;
    setDiceRoll(null);
    processPostActionChecks(optionContext);
  }

  return (
    <>
      <div className={`bg-[url(./assets/images/main_screen_2.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] items-center justify-center`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20 mix-blend-overlay"></div>

        {diceRoll && <DiceModal diceRoll={diceRoll} onConfirm={handleDiceClose} />}

        {gameState === 'title' && (
          <div id='text-area' className='absolute ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[55%] lg:w-[50%] text-white h-[80%] sm:h-[75%] p-2 rounded-lg flex flex-col items-center justify-between overflow-y-auto'>            <TitleScreen onStart={() => setGameState('selection')} />
          </div>
        )}

        {gameState === 'selection' && (
          <div id='text-area' className='absolute ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[55%] lg:w-[50%] text-white h-[80%] sm:h-[75%] p-2 rounded-lg flex flex-col items-center justify-between overflow-y-auto'>            <CharacterSelectionScreen 
              archetypes={ARCHETYPES} 
              onSelect={handleCharacterSelect} 
              getMetricValueColor={getMetricValueColor} 
              formatCurrency={formatCurrency} 
            />
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <StatsPopUp playerStats={gameStats} gameState={gameState} />
            {currentEvent !== null && (
              <EventPopUp event={currentEvent} open={eventOpen} gameState={gameStats} setOpen={setEventOpen} onOptionSelect={handleOptionSelect} />
            )}
            
            {currentScenario !== null && (
              <div id='text-area' className='absolute p-6 ml-auto mr-auto w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] text-white h-[85%] sm:h-[80%] border border-cyan-900/50 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.05)] flex flex-col overflow-hidden'>
                  
                  {/* Text Window Area - takes up remaining space statically */}
                  <div className="flex-1 p-6 sm:p-8 overflow-hidden flex flex-col">
                      <TextWindow 
                        scenario={currentScenario} 
                        onFinish={setIsReadingFinished} 
                      />
                  </div>

                  {/* Option Window Area - Only renders when text has reached the end */}
                  {isReadingFinished && currentScenario.options && currentScenario.options.length > 0 && (
                      <div className="p-4 sm:p-6 border-t border-cyan-900/50 shrink-0 animate-fade-in">
                          <OptionSelectWindow 
                            gameState={gameStats} 
                            scenario={currentScenario} 
                            onOptionSelect={handleOptionSelect} 
                            className='w-full flex flex-col items-stretch justify-center gap-3' 
                          />
                      </div>
                  )}
              </div>    
            )}
          </>
        )}

        {gameState === 'ending' && (
          <div className="w-[90%] sm:w-[75%] md:w-[60%] h-[80%] p-6 md:p-10 rounded-xl backdrop-blur-md shadow-2xl flex items-center justify-center text-center text-white text-2xl">
            <h1>Game Over</h1>
            {/* Add ending display logic here */}
          </div>
        )}

      </div>
    </>
  )
}

export default App