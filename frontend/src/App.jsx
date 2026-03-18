import { useState, useEffect, useMemo } from 'react'
import Scenarios from './scenarios.json'
import Events from './events.json'
import EventPopUp from './components/EventPopUp'
import StatsPopUp from './components/StatsPopUp'
import { OptionSelectWindow } from './components/OptionSelectWIndow'
import TextWindow from './components/textWindow'
function App() {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const allEvents = useMemo(() => Events.events, [])

  const getScenario = () => {
    const nextScenarioId = currentScenario ? currentScenario.nextScenario : 0
    const nextScenario = allScenarios.find(scenario => scenario.id === nextScenarioId)
    setCurrentScenario(nextScenario)
    
  }

  const getEvent = (eventId) =>{
    const event = allEvents.find(event => event.id == eventId)
    setCurrentEvent(event)
  }

  const startGame = () => {
    setGameStarted(true)
  }

  const checkOptionReqirments = (option) => {
    // Check if the player meets the requirements for the selected option
    return true
  }

  const applyOptionConsequences = (option) => {
    // Apply the consequences of the selected option to the player's stats
    if(option?.consequences?.event){
      getEvent(option.consequences.event)
      setEventOpen(true)
    }
    else{
      getScenario(currentScenario)
    }
    return true
  }

  const handleNextScenario = (option) => {
    // Check first if an option triggers an event, if so open the event pop up and load the event scenario. If not, load a new random scenario.
    if (option.consequences && option.consequences?.event) {
      const eventScenario = allEvents.find(event => event.id === option.consequences.event)
      if (eventScenario) {
        setCurrentEvent(eventScenario)
        setEventOpen(true)
      }
    } else {
      getScenario(currentScenario)
    }

  }

  const handleOptionSelect = (option) => {
    // Handle option selection logic here
    console.log("Selected Option:", option)

    checkOptionReqirments(option) // Check if the player meets the requirements for the selected option

    applyOptionConsequences(option) // Update player stats based on the selected option

  }

  useEffect(() => {
    if (allScenarios.length > 0) {
      getScenario()
    }
  }, [allScenarios])

  useEffect(() => {
    if (currentScenario) {
      console.log("Current Scenario:", currentScenario)
    }
  }, [currentScenario])

  

  return (
    <>
      <div className={`bg-[url(./assets/images/main_screen_2.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] flex items-center justify-center`}>
        <StatsPopUp playerStats={{cash: 1000, reputation: 50, entropy: 20}}/>
        {
          currentEvent !== null ?(
            <EventPopUp event={currentEvent} open={eventOpen} setOpen={setEventOpen} onOptionSelect={handleOptionSelect}  />

          ): (<></>)
        }
     
      
 


          {currentScenario !== null ? (

          <div id='text-area' className='absolute ml-auto mr-auto w-[50%] text-white h-[75%] p-2 rounded-lg flex flex-col items-center justify-between'>
              <TextWindow scenario={currentScenario} className={"h-3/5 p-6 bg-red-500/10"} />
              <OptionSelectWindow gameState={{cash: 1000, reputation: 50, entropy: 20}} scenario={currentScenario} onOptionSelect={handleOptionSelect} className='w-full bg-blue-500/10 h-2/5 p-4 mb-8 flex flex-col items-center justify-center gap-2' />
          </div>    

          ) : (
            <></>
          )}
            

      </div>

    </>
  )
}

export default App
