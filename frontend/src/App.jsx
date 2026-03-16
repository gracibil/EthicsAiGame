import { useState, useEffect, useMemo } from 'react'
import Scenarios from './scenarios.json'
import { useGameStore } from './store/gameStore'
function App() {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const applyEffects = useGameStore((state) => state.applyEffects)
  const activeEnding = useGameStore((state) => state.activeEnding)
  // const metrics = useGameStore((state) => state.metrics)
  const getScenario = (previous=null) => {
    const randomIndex = Math.floor(Math.random() * allScenarios.length)
    if (previous && allScenarios[randomIndex].id === previous.id) {
      return getScenario(previous) // Recursively get a new scenario if it's the same as the previous one
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

  useEffect(() => {
    if (allScenarios.length > 0) {
      getScenario()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allScenarios])

  useEffect(() => {
    if (currentScenario) {
      console.log("Current Scenario:", currentScenario)
    }
  }, [currentScenario])

  useEffect(() => {
    if (activeEnding) {
      
      console.log('[Game Over]', activeEnding.id, activeEnding.title)
      console.log(activeEnding.narrative)
    }
  }, [activeEnding])

  
  return (
    <>
      <div className={`bg-[url(./assets/images/main_screen.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] flex items-center justify-center`}>
        <div id='text-area' className=' w-[35%] h-[30%] mb-[17%] p-8 text-center overflow-y-auto'>
          <div class="typewriter">
            <div className='w-fit max-w-full mx-auto'>
              {
                gameStarted? 
                <span>
                  {currentScenario ? (
                    <>
                      <h2 className="text-xl font-bold mb-4">{currentScenario.title}</h2>
                      <p>{currentScenario.description}</p>
                    </>
                  ) : (
                    <p>Loading scenario...</p>
                  )}
                </span>
                :
              
                <span className=''>
                  Welcome to the Game! <br />
                  In this game, you will be presented with various ethical dilemmas. Your task is to make decisions based on your moral compass and see how your choices impact the world around you. <br />

                </span>
              }
            </div>
            
          </div>
          
        </div>
      </div>

         <div id='selection-area' className=' absolute bottom-[35%] left-0 right-0 ml-auto mr-auto w-[35%] h-[17%] flex items-center justify-center flex flex-col gap-1'>

          {
            gameStarted ?
            (
              currentScenario.options.map((option, index) => (
                <button key={index} className=' p-1 hover:bg-green-100/10 hover:text-green-300 text-xs w-full' onClick={() => handleOptionSelect(option)} >
                  <p className="font-bold">{index + 1}. {option.description}</p>
                </button>
              ))
            )
            :

          <button onClick={()=>startGame()} className=' p-1 hover:bg-green-300/30'>
            <p className="font-bold text-white text-2xl">Start Game</p>
          </button>



          }

        </div>     

    </>
  )
}

export default App
