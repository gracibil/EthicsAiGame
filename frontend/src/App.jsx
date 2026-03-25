import { useState, useMemo } from 'react'
import StoryData from './acts/story.json'
import EventsData from './events.json'
import EventPopUp from './components/EventPopUp'
import StatsPopUp from './components/StatsPopUp'
import { SceneRenderer } from './components/SceneRenderer'
import { useGameStore } from './store/gameStore'

const ACT3_BRANCHES = {
  a: () => import('./acts/act3_a.json'),
  b: () => import('./acts/act3_b.json'),
  c: () => import('./acts/act3_c.json'),
}

const branchConditions = StoryData.branchConditions ?? []

// Evaluate a conditions array against a metrics snapshot.
// Returns the matched endingId/branch string, or null if nothing matched.
// Supports: { gte: N } and { lte: N } per metric key.
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
  const [scenes, setScenes] = useState(StoryData.scenes)
  const [inBranch, setInBranch] = useState(false)
  const [branchMeta, setBranchMeta] = useState(null)   // { endingConditions, endings }
  const [endingScene, setEndingScene] = useState(null)  // text-only scene rendered after branch
  const [gameOver, setGameOver] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [eventOpen, setEventOpen] = useState(false)
  const allEvents = useMemo(() => [...EventsData.events], [])

  const { metrics, applyEffects, activeEnding, resetGame } = useGameStore()

  const currentScene = scenes[sceneIndex]

  const advanceScene = async () => {
    const nextIndex = sceneIndex + 1

    if (nextIndex < scenes.length) {
      setSceneIndex(nextIndex)
      return
    }

    if (!inBranch) {
      // End of story.json — load the correct Act 3 branch
      const branchId = resolveConditions(branchConditions, useGameStore.getState().metrics) ?? 'c'
      const data = await ACT3_BRANCHES[branchId]()
      const bData = data.default
      setScenes(bData.scenes)
      setBranchMeta({
        endingConditions: bData.endingConditions ?? [],
        endings: bData.endings ?? [],
      })
      setSceneIndex(0)
      setInBranch(true)
      return
    }

    // End of branch scenes — resolve ending
    if (branchMeta && branchMeta.endingConditions.length > 0) {
      const currentMetrics = useGameStore.getState().metrics
      const endingId = resolveConditions(branchMeta.endingConditions, currentMetrics)
      const matched = branchMeta.endings.find(e => e.id === endingId) ?? null
      setEndingScene(matched)
    }
  }

  const handleOptionSelect = async (option) => {
    if (option.effects) applyEffects(option.effects)

    if (useGameStore.getState().activeEnding) return

    const currentMetrics = useGameStore.getState().metrics
    const triggered = allEvents.find(event => {
      if (!event.triggers) return false
      return Object.entries(event.triggers).every(
        ([key, val]) => (currentMetrics[key] ?? 0) >= val
      )
    })
    if (triggered) {
      allEvents.splice(allEvents.indexOf(triggered), 1)
      setCurrentEvent(triggered)
      setEventOpen(true)
      return
    }

    if (option.consequences?.event) {
      const eventScenario = allEvents.find(e => e.id === option.consequences.event)
      if (eventScenario) {
        setCurrentEvent(eventScenario)
        setEventOpen(true)
        return
      }
    }

    await advanceScene()
  }

  const handleEventOptionSelect = async (option) => {
    if (option.consequences?.stat_effects) applyEffects(option.consequences.stat_effects)
    if (useGameStore.getState().activeEnding) return
    await advanceScene()
  }

  // Mid-game ending (from endings.js — bankruptcy, jail, etc.)
  if (activeEnding) {
    return (
      <div className="bg-black flex flex-col items-center justify-center h-[100vh] w-[100vw] text-white p-8">
        <h1 className="text-3xl font-bold mb-6">{activeEnding.title}</h1>
        <p className="max-w-xl text-center text-gray-300 mb-8">{activeEnding.narrative}</p>
        <button
          onClick={resetGame}
          className="border border-white px-6 py-2 hover:bg-white hover:text-black transition"
        >
          Play Again
        </button>
      </div>
    )
  }

  // Game over screen (shown after player clicks Continue on ending scene)
  if (gameOver) {
    return (
      <div className="bg-black flex flex-col items-center justify-center h-[100vh] w-[100vw] text-white p-8">
        <h1 className="text-3xl font-bold mb-6">The End</h1>
        <button
          onClick={resetGame}
          className="border border-white px-6 py-2 hover:bg-white hover:text-black transition"
        >
          Play Again
        </button>
      </div>
    )
  }

  // Branch ending scene (rendered by SceneRenderer — no options → "Continue →" → game over)
  if (endingScene) {
    return (
      <div className="bg-black h-[100vh] w-[100vw] flex items-center justify-center">
        <div className="absolute w-[50%] h-[75%] p-2 flex flex-col">
          <SceneRenderer
            scene={endingScene}
            onOptionSelect={() => setGameOver(true)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[url(./assets/images/main_screen_2.png)] bg-cover bg-center h-[100vh] w-[100vw] flex items-center justify-center">
      <StatsPopUp />
      {currentEvent && (
        <EventPopUp
          event={currentEvent}
          open={eventOpen}
          gameState={metrics}
          setOpen={setEventOpen}
          onOptionSelect={handleEventOptionSelect}
        />
      )}
      {currentScene && (
        <div className="absolute w-[50%] h-[75%] p-2 rounded-lg flex flex-col">
          <SceneRenderer key={`${inBranch}-${sceneIndex}`} scene={currentScene} onOptionSelect={handleOptionSelect} />
        </div>
      )}
    </div>
  )
}

export default App
