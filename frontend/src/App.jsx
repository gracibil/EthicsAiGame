import { useState, useEffect, useMemo, useRef } from 'react'
import Scenarios from './scenarios.json'
import { useGameStore } from './store/gameStore'

const ARCHETYPES = [
  {
    id: 'visionary',
    name: 'The Rogue Engineer',
    quote: '"Move fast. Break everything. We can patch the world later."',
    description: 'High technical capacity but struggling with funding and ethics. You run on pure momentum.',
    metrics: { Capital: 6, Compute: 16, Alignment: 6, Sentiment: 12, Scrutiny: 8, Entropy: 12 }
  },
  {
    id: 'corporate',
    name: 'The Board Proxy',
    quote: '"Innovation is just another asset class. Secure the funding first."',
    description: 'Well-funded and highly scrutinized. The model is safe, boring, and highly profitable.',
    metrics: { Capital: 16, Compute: 8, Alignment: 8, Sentiment: 10, Scrutiny: 12, Entropy: 6 }
  },
  {
    id: 'academic',
    name: 'The Chief Ethicist',
    quote: '"Intelligence without containment is just a faster way to die."',
    description: 'Deeply aligned and highly respected by the public, but struggling to achieve raw compute power.',
    metrics: { Capital: 8, Compute: 7, Alignment: 16, Sentiment: 15, Scrutiny: 6, Entropy: 8 }
  }
];

function App() {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [gameState, setGameState] = useState('title') 
  
  // Interactive Story State
  const [currentStep, setCurrentStep] = useState(0)
  const [resolvedBlocks, setResolvedBlocks] = useState([])
  const scrollRef = useRef(null)

  // States for Stats Toggle and Effect Delay
  const [showStats, setShowStats] = useState(false)
  const [lastAppliedEffects, setLastAppliedEffects] = useState(null)

  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const applyEffects = useGameStore((state) => state.applyEffects)
  const startGameWithCharacter = useGameStore((state) => state.startGameWithCharacter)
  const metrics = useGameStore((state) => state.metrics)

  const getScenario = (previous = null) => {
    if (allScenarios.length === 0) return;
    if (allScenarios.length === 1) {
      setCurrentScenario(allScenarios[0]);
      return;
    }
    const randomIndex = Math.floor(Math.random() * allScenarios.length)
    if (previous && allScenarios[randomIndex].id === previous.id) {
      return getScenario(previous)
    }
    setCurrentScenario(allScenarios[randomIndex])
  }

  const handleCharacterSelect = (archetype) => {
    startGameWithCharacter(archetype.metrics)
    setGameState('playing')
  }

  const handleOptionSelect = (option) => {
    const effects = option.effects ?? {};
    setLastAppliedEffects(effects); // Store to display
    applyEffects(effects);          // Apply to the store
  }

  const handleProceed = () => {
    setLastAppliedEffects(null);
    if (!useGameStore.getState().activeEnding) {
      getScenario(currentScenario);
    }
  }

  const getActiveVoices = () => {
    if (!currentScenario?.dynamicVoices || !metrics) return null;
    const sortedMetrics = Object.entries(metrics).sort((a, b) => b[1] - a[1]);
    return {
      highest: currentScenario.dynamicVoices.highest[sortedMetrics[0][0]],
      lowest: currentScenario.dynamicVoices.lowest[sortedMetrics[sortedMetrics.length - 1][0]]
    };
  };

  const activeVoices = getActiveVoices();

  useEffect(() => {
    setCurrentStep(0);
    setResolvedBlocks([]);
  }, [currentScenario]);

  useEffect(() => {
    if (!currentScenario || !currentScenario.contentBlocks) return;
    const blocks = currentScenario.contentBlocks;
    if (currentStep < blocks.length) {
      const block = blocks[currentStep];
      if (block.type === 'text') {
        setResolvedBlocks(prev => [...prev, { ...block, id: currentStep }]);
        setCurrentStep(s => s + 1);
      }
    }
  }, [currentStep, currentScenario]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [resolvedBlocks, currentStep, lastAppliedEffects]);

  const handleVoiceReveal = (block) => {
    const voiceText = block.voiceType === 'highest' ? activeVoices.highest : activeVoices.lowest;
    setResolvedBlocks(prev => [...prev, { type: 'voice', text: voiceText, id: currentStep }]);
    setCurrentStep(s => s + 1);
  }

  const handleDialogueChoice = (option) => {
    setResolvedBlocks(prev => [...prev, { type: 'dialogue', label: option.label, response: option.response, id: currentStep }]);
    setCurrentStep(s => s + 1);
  }

  useEffect(() => {
    if (allScenarios.length > 0 && !currentScenario) {
      getScenario()
    }
  }, [allScenarios])

  return (
    <>
      {/* GLOBAL STATS TOGGLE */}
      {gameState === 'playing' && metrics && (
        <div className="absolute top-6 right-6 z-50 flex flex-col items-end">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-black/60 border border-cyan-500/50 hover:bg-cyan-900/60 hover:border-cyan-400 text-cyan-200 font-bold rounded-lg transition-all backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,255,0.1)]"
          >
            {showStats ? 'Close Metrics' : 'View Metrics'}
          </button>
          
          {showStats && (
            <div className="mt-4 p-5 w-64 bg-black/90 border border-cyan-800 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in">
              <h3 className="text-cyan-400 font-bold mb-3 border-b border-cyan-900/50 pb-2 uppercase tracking-widest text-sm">System Status</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(metrics).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{key}</span>
                    <span className={`font-mono font-bold ${val >= 15 ? 'text-cyan-400' : val <= 5 ? 'text-red-400/80' : 'text-gray-200'}`}>
                      {val}/20
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`bg-[url(./assets/images/main_screen.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] flex items-center justify-center`}>
        <div ref={scrollRef} id='text-area' className='w-[60%] max-h-[80%] p-10 overflow-y-auto bg-black/80 rounded-xl scroll-smooth border border-cyan-900/50 backdrop-blur-md shadow-2xl'>
          <div className="w-fit max-w-full mx-auto h-full flex flex-col">
            
            {/* 1. TITLE SCREEN */}
            {gameState === 'title' && (
              <div className="text-center flex flex-col items-center justify-center h-full py-10 my-auto">
                <h1 className="text-4xl text-cyan-300 font-bold mb-12 tracking-widest uppercase animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                  The Sound of Falling
                </h1>
                <button onClick={() => setGameState('selection')} className='px-8 py-4 bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-800/50 hover:border-cyan-400 rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]'>
                  <p className="font-bold text-cyan-100 text-xl tracking-wider uppercase">Initialize System</p>
                </button>
              </div>
            )}

            {/* 2. CHARACTER SELECTION SCREEN */}
            {gameState === 'selection' && (
              <div className="flex flex-col h-full py-4 animate-fade-in">
                <h2 className="text-3xl text-cyan-400 font-bold mb-2 text-center tracking-widest uppercase">Select Your Background</h2>
                <p className="text-gray-400 text-center mb-10 italic">Your starting architecture dictates your initial advantages and vulnerabilities.</p>
                
                <div className="grid grid-cols-1 gap-6 w-full">
                  {ARCHETYPES.map((arch) => (
                    <button 
                      key={arch.id}
                      onClick={() => handleCharacterSelect(arch)}
                      className="group p-6 bg-black/60 border border-cyan-900/60 hover:border-cyan-400 hover:bg-cyan-950/40 transition-all rounded-lg text-left relative overflow-hidden flex flex-col gap-3 shadow-lg"
                    >
                      <div className="flex justify-between items-center border-b border-cyan-900/40 pb-2">
                        <h3 className="text-xl font-bold text-cyan-200 group-hover:text-cyan-100">{arch.name}</h3>
                      </div>
                      <p className="text-sm text-cyan-500/80 italic">"{arch.quote}"</p>
                      <p className="text-gray-300 text-sm leading-relaxed mb-2">{arch.description}</p>
                      
                      <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-2 pt-4 border-t border-cyan-900/30">
                        {Object.entries(arch.metrics).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 uppercase tracking-wider">{key}</span>
                            <span className={`font-bold ${val > 10 ? 'text-cyan-400' : val < 10 ? 'text-red-400/80' : 'text-gray-200'}`}>
                              {val}/20
                            </span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MAIN GAME SCREEN */}
            {gameState === 'playing' && (
              currentScenario ? (
                <>
                  <h2 className="text-2xl font-bold mb-8 text-cyan-300 border-b border-cyan-900/50 pb-4">{currentScenario.title}</h2>
                  
                  {resolvedBlocks.map((block) => {
                    if (block.type === 'text') {
                      return <p key={block.id} className="whitespace-pre-wrap text-left mb-6 text-gray-200 leading-relaxed">{block.text}</p>
                    }
                    if (block.type === 'voice') {
                      const parts = block.text.split(':');
                      return (
                        <div key={block.id} className="mb-6 p-4 border border-cyan-800 bg-cyan-900/20 text-left text-sm italic rounded">
                          <p className="font-bold text-cyan-200">{parts[0]}:</p>
                          <p className="text-cyan-100">{parts.slice(1).join(':')}</p>
                        </div>
                      )
                    }
                    if (block.type === 'dialogue') {
                      return (
                        <div key={block.id} className="mb-6">
                          <p className="text-cyan-400 font-bold text-left mb-2">{block.label}</p>
                          <p className="whitespace-pre-wrap text-left text-gray-200 leading-relaxed italic">{block.response}</p>
                        </div>
                      )
                    }
                    return null;
                  })}

                  {currentScenario.contentBlocks && currentStep < currentScenario.contentBlocks.length && (() => {
                    const block = currentScenario.contentBlocks[currentStep];
                    if (block.type === 'continue') {
                      return (
                        <div className="mb6 pb-4">
                          <button onClick={() => setCurrentStep(s => s + 1)} className="text-cyan-500 font-bold hover:text-cyan-200 text-left w-full transition-colors text-2xl animate-pulse">
                            {block.label || "→"}
                          </button>
                        </div>
                      )
                    }
                    if (block.type === 'voiceReveal') {
                      return (
                        <div className="mb-10 pb-4">
                          <button onClick={() => handleVoiceReveal(block)} className="text-cyan-400 font-bold hover:text-cyan-200 text-left w-full transition-colors animate-pulse">
                            {block.prompt}
                          </button>
                        </div>
                      )
                    }
                    if (block.type === 'dialogueChoice') {
                      return (
                        <div>
                          <div className="flex flex-col gap-3 mb-10 border-l-2 border-cyan-800 pl-4 mt-2">
                            {block.options.map((opt, idx) => (
                              <button key={idx} onClick={() => handleDialogueChoice(opt)} className="text-cyan-400 italic hover:text-cyan-200 text-left transition-colors">
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null;
                  })()}

                  {/* Render final metric decisions or Pending Effects */}
                  {currentStep >= (currentScenario.contentBlocks?.length || 0) && (
                    <div className="mt-6 pt-6 border-t border-cyan-900 flex flex-col gap-3 animate-fade-in pb-8">
                      
                      {lastAppliedEffects ? (
                        <div className="flex flex-col gap-6">
                          <div className="p-6 bg-cyan-950/40 border border-cyan-500/50 rounded-lg text-center shadow-inner animate-pulse">
                            <h3 className="text-cyan-300 font-bold mb-4 uppercase tracking-widest">Consequences Applied</h3>
                            <div className="flex flex-wrap justify-center gap-6">
                              {Object.entries(lastAppliedEffects).map(([key, val]) => (
                                <span key={key} className={`font-mono text-lg font-bold ${val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {key} {val > 0 ? '+' : ''}{val}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleProceed}
                            className='p-4 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-200 font-bold text-center w-full border border-cyan-500/50 hover:border-cyan-400 transition-all rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]' 
                          >
                            Proceed →
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-cyan-500 font-bold mb-2 uppercase tracking-widest text-sm">Make your decision:</p>
                          {currentScenario.options.map((option, index) => (
                            <button 
                              key={index} 
                              className='p-4 bg-black/40 hover:bg-cyan-900/40 text-gray-300 hover:text-cyan-100 text-sm w-full border border-cyan-800/40 hover:border-cyan-400/60 transition-all rounded-lg text-left shadow-lg' 
                              onClick={() => handleOptionSelect(option)}
                            >
                              <p className="font-bold">{option.description}</p>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-cyan-200 animate-pulse mt-auto mb-auto text-center">Loading scenario...</p>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App