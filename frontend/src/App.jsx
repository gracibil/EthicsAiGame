import { useState, useEffect, useMemo, useRef } from 'react'
import Scenarios from './scenarios.json'
import { useGameStore } from './store/gameStore'

function App() {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  
  // Interactive Story State
  const [currentStep, setCurrentStep] = useState(0)
  const [resolvedBlocks, setResolvedBlocks] = useState([])
  const scrollRef = useRef(null)

  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const applyEffects = useGameStore((state) => state.applyEffects)
  const activeEnding = useGameStore((state) => state.activeEnding)
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

  const startGame = () => {
    setGameStarted(true)
  }

  const handleOptionSelect = (option) => {
    applyEffects(option.effects ?? {})
    if (!useGameStore.getState().activeEnding) {
      getScenario(currentScenario)
    }
  }

  // Calculate highest and lowest metrics for dynamic voices
  const getActiveVoices = () => {
    if (!currentScenario?.dynamicVoices || !metrics) return null;
    const sortedMetrics = Object.entries(metrics).sort((a, b) => b[1] - a[1]);
    return {
      highest: currentScenario.dynamicVoices.highest[sortedMetrics[0][0]],
      lowest: currentScenario.dynamicVoices.lowest[sortedMetrics[sortedMetrics.length - 1][0]]
    };
  };

  const activeVoices = getActiveVoices();

  // Reset interactive state when a new scenario loads
  useEffect(() => {
    setCurrentStep(0);
    setResolvedBlocks([]);
  }, [currentScenario]);

  // Auto-advance text blocks
  useEffect(() => {
    if (!currentScenario || !currentScenario.contentBlocks) return;
    
    const blocks = currentScenario.contentBlocks;
    if (currentStep < blocks.length) {
      const block = blocks[currentStep];
      // If it's a text block, auto-resolve it immediately. 
      // The step increases, pausing only when it hits a non-text block.
      if (block.type === 'text') {
        setResolvedBlocks(prev => [...prev, { ...block, id: currentStep }]);
        setCurrentStep(s => s + 1);
      }
    }
  }, [currentStep, currentScenario]);

  // Auto-scroll to bottom when new content is revealed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [resolvedBlocks, currentStep]);

  // Handlers for interactive blocks
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
      <div className={`bg-[url(./assets/images/main_screen.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] flex items-center justify-center`}>
        <div ref={scrollRef} id='text-area' className='w-[50%] max-h-[70%] p-10 overflow-y-auto bg-black/70 rounded-xl scroll-smooth border border-cyan-900/50 backdrop-blur-sm shadow-2xl'>
          <div className="w-fit max-w-full mx-auto h-full flex flex-col">
            {gameStarted ? (
              currentScenario ? (
                <>
                  <h2 className="text-2xl font-bold mb-8 text-cyan-300 border-b border-cyan-900/50 pb-4">{currentScenario.title}</h2>
                  
                  {/* Render all resolved history */}
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

                  {/* Render the active interactive prompt */}
                  {currentScenario.contentBlocks && currentStep < currentScenario.contentBlocks.length && (() => {
                    const block = currentScenario.contentBlocks[currentStep];
                    
                    if (block.type === 'continue') {
                      return (
                        <div className="mb-10 pb-4">
                          <button 
                            onClick={() => setCurrentStep(s => s + 1)}
                            className="text-cyan-500 font-bold hover:text-cyan-200 text-left w-full transition-colors text-2xl animate-pulse"
                          >
                            {block.label || "→"}
                          </button>
                        </div>
                      )
                    }
                    
                    if (block.type === 'voiceReveal') {
                      return (
                        <div className="mb-10 pb-4">
                          <button 
                            onClick={() => handleVoiceReveal(block)}
                            className="text-cyan-400 font-bold hover:text-cyan-200 text-left w-full transition-colors animate-pulse"
                          >
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
                              <button 
                                key={idx} 
                                onClick={() => handleDialogueChoice(opt)}
                                className="text-cyan-400 italic hover:text-cyan-200 text-left transition-colors"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null;
                  })()}

                  {/* Render final metric decisions ATTACHED to the end of the text */}
                  {currentStep >= (currentScenario.contentBlocks?.length || 0) && (
                    <div className="mt-6 pt-6 border-t border-cyan-900 flex flex-col gap-3 animate-fade-in pb-8">
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
                    </div>
                  )}
                </>
              ) : (
                <p className="text-cyan-200 animate-pulse mt-auto mb-auto text-center">Loading scenario...</p>
              )
            ) : (
              <div className="text-center flex flex-col items-center justify-center h-full py-10 my-auto">
                <h1 className="text-4xl text-cyan-300 font-bold mb-12 tracking-widest uppercase animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                  The Sound of Falling
                </h1>
                <button onClick={() => startGame()} className='px-8 py-4 bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-800/50 hover:border-cyan-400 rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]'>
                  <p className="font-bold text-cyan-100 text-xl tracking-wider uppercase">Initialize System</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App