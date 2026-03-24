import { useState, useEffect, useMemo } from 'react'
import Scenarios from './scenarios.json'
import Events from './events.json'
import EventPopUp from './components/EventPopUp'
import StatsPopUp from './components/StatsPopUp'
import { OptionSelectWindow } from './components/OptionSelectWIndow'
import TextWindow from './components/textWindow'
import { evaluateEndings } from './store/endings'
import { useGameStore } from './store/gameStore'

function App() {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const allScenarios = useMemo(() => Scenarios.scenarios, [])
  const allEvents = useMemo(() => Events.events, [])

  const { metrics, applyEffects } = useGameStore()

  const checkEvents = () => {
    for (const event of allEvents){
      const event_triggers = event?.triggers || null
      if (event_triggers) {
        // check for each key value pair if the metrics meet the trigger conditions, if they meet all conditions return the event, if not continue checking other events
        let trigger_met = true

        for (const [key, value] of Object.entries(event_triggers)) {
          if (metrics[key] < value) {
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
    return evaluateEndings(useGameStore.getState().metrics) ?? false
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
    if (option?.consequences?.stat_effects) {
      applyEffects(option.consequences.stat_effects)
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
        <StatsPopUp />
        {
          currentEvent !== null ?(
            <EventPopUp event={currentEvent} open={eventOpen} gameState={metrics} setOpen={setEventOpen} onOptionSelect={handleOptionSelect}  />

          ): (<></>)
        }
          {currentScenario !== null ? (

          <div id='text-area' className='absolute ml-auto mr-auto w-[50%] text-white h-[75%] p-2 rounded-lg flex flex-col items-center justify-between'>
              <TextWindow scenario={currentScenario} className={"h-3/5 p-6"} />
              <OptionSelectWindow scenario={currentScenario} onOptionSelect={handleOptionSelect} className='w-full h-2/5 p-4 mb-8 flex flex-col items-center justify-center gap-2' />
          </div>    

          ) : (
            <></>
          )}
            

      </div>

    </>
  )
}

export default App
