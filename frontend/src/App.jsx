import { useState, useEffect, useMemo } from 'react'
import Scenarios from './scenarios.json'
import Events from './events.json'
import EventPopUp from './components/EventPopUp'
import StatsPopUp from './components/StatsPopUp'
import { OptionSelectWindow } from './components/OptionSelectWIndow'
import TextWindow from './components/textWindow'
import { evaluateEndings } from './store/endings'
import { useGameStore } from './store/gameStore'

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

const METRICS_LIST = Object.keys(INITIAL_METRICS)

function App() {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const allEvents = useMemo(() => Events.events, [])
  const [gameStats, setGameStats] = useState(INITIAL_METRICS)

  const updateMetrics = (key, value) => {
      let new_value = gameStats[key] + value
      if (new_value > MAX_METRICS[key]) {
        // if the new value exceeds the maximum, set it to the maximum
        new_value = MAX_METRICS[key]
      }else if (new_value < 0) {
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
        }else{
          return false
        }

      }

      }
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
    if (option?.consequences?.stat_effects){
      // Apply consequences of a selected action
      for (const [key, value] of Object.entries(option.consequences.stat_effects)) {
          updateMetrics(key, value)
      }
    }
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

    checkOptionReqirments(option) // Check if the player meets the requirements for the selected option

    applyOptionConsequences(option) // Update player stats based on the selected option

    const ending = checkEndings() // Check if the updated stats trigger any endings

    const event = checkEvents() // Check if the updated stats trigger any events

    if(ending){
    // Handle ending logic here (e.g. show ending screen, reset game, etc.)
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

  useEffect(() => {
    if (allScenarios.length > 0) {
      getScenario()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allScenarios])

  useEffect(() => {
    if (currentScenario) {
    }
  }, [currentScenario])

  
  return (
    <>
      <div className={`bg-[url(./assets/images/main_screen_2.png)] flex flex-col bg-cover bg-center h-[100vh] w-[100vw] flex items-center justify-center`}>
        <StatsPopUp playerStats={gameStats}/>
        {
          currentEvent !== null ?(
            <EventPopUp event={currentEvent} open={eventOpen} gameState={gameStats} setOpen={setEventOpen} onOptionSelect={handleOptionSelect}  />

          ): (<></>)
        }
          {currentScenario !== null ? (

          <div id='text-area' className='absolute ml-auto mr-auto w-[50%] text-white h-[75%] p-2 rounded-lg flex flex-col items-center justify-between'>
              <TextWindow scenario={currentScenario} className={"h-3/5 p-6"} />
              <OptionSelectWindow gameState={gameStats} scenario={currentScenario} onOptionSelect={handleOptionSelect} className='w-full h-2/5 p-4 mb-8 flex flex-col items-center justify-center gap-2' />
          </div>    

          ) : (
            <></>
          )}
            

      </div>

    </>
  )
}

export default App
