import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { METRIC_KEYS } from '../store/metricsConfig'

export function SceneRenderer({ scene, onOptionSelect }) {
  const { metrics } = useGameStore()

  const blocks = scene.contentBlocks ?? []

  // Find the index of the next gate (continue/dialogueChoice) at or after `from`,
  // or blocks.length if there are no more gates.
  const findNextGate = (from) => {
    for (let i = from; i < blocks.length; i++) {
      if (blocks[i].type === 'continue' || blocks[i].type === 'dialogueChoice') return i
    }
    return blocks.length
  }

  // Start at the first gate so all leading text is immediately visible
  const [blockIndex, setBlockIndex] = useState(() => findNextGate(0))
  const allBlocksShown = blockIndex >= blocks.length
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [blockIndex])

  const advance = () => setBlockIndex(findNextGate(blockIndex + 1))

  // Find the voice line for highest or lowest metric that has an entry in dynamicVoices
  const getVoice = (voiceType) => {
    if (!scene.dynamicVoices?.[voiceType]) return null
    const sorted = [...METRIC_KEYS].sort((a, b) =>
      voiceType === 'highest' ? metrics[b] - metrics[a] : metrics[a] - metrics[b]
    )
    const key = sorted.find(k => scene.dynamicVoices[voiceType][k])
    return key ? scene.dynamicVoices[voiceType][key] : null
  }

  const meetsRequirements = (option) => {
    const reqs = option.requirements ?? option.requires
    if (!reqs) return true
    return Object.entries(reqs).every(([key, rule]) => {
      const val = metrics[key] ?? 0
      if (typeof rule === 'object') {
        if (rule.min !== undefined && val < rule.min) return false
        if (rule.max !== undefined && val > rule.max) return false
        return true
      }
      return val >= rule
    })
  }

  const renderBlock = (block, index) => {
    // Don't render blocks beyond the current gate
    if (index > blockIndex) return null

    switch (block.type) {
      case 'text':
        return <p key={index} className="text-white mb-4 whitespace-pre-wrap">{block.text}</p>

      case 'voiceReveal': {
        const voice = getVoice(block.voiceType)
        return voice ? (
          <p key={index} className="text-yellow-300 italic mb-4">
            {block.prompt}<br />{voice}
          </p>
        ) : null
      }

      case 'continue':
        // Only show button while this block is the current gate; disappears after advancing
        return index === blockIndex ? (
          <button
            key={index}
            onClick={advance}
            className="text-white border border-white px-4 py-1 mt-2 hover:bg-white hover:text-black transition"
          >
            {block.label}
          </button>
        ) : null

      case 'dialogueChoice':
        // dialogueChoice is a gate — passes control to DialogueChoice which calls advance() when done
        return (
          <DialogueChoice
            key={index}
            block={block}
            isGate={index === blockIndex}
            onDone={advance}
          />
        )

      default:
        return null
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2 h-full overflow-y-auto">
      <h2 className="text-white text-lg font-bold mb-4">{scene.title}</h2>
      <div className="flex-1">
        {blocks.map((block, i) => renderBlock(block, i))}
      </div>
      {allBlocksShown && (!scene.options || scene.options.length === 0) && (
        <div className="mt-4">
          <button
            onClick={() => onOptionSelect({})}
            className="text-white border border-white px-4 py-2 hover:bg-white hover:text-black transition"
          >
            Continue →
          </button>
        </div>
      )}
      {allBlocksShown && scene.options && scene.options.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {scene.options.map(option => {
            const enabled = meetsRequirements(option)
            return (
              <button
                key={option.id}
                disabled={!enabled}
                onClick={() => enabled && onOptionSelect(option)}
                className={`text-left border px-4 py-2 transition ${
                  enabled
                    ? 'border-white text-white hover:bg-white hover:text-black'
                    : 'border-gray-600 text-gray-600 cursor-not-allowed'
                }`}
              >
                {option.description}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// DialogueChoice renders cosmetic dialogue options (no stat effects).
// When a choice is made and the response is shown, a continue button lets
// the player advance past this gate (calls onDone).
function DialogueChoice({ block, isGate, onDone }) {
  const [chosen, setChosen] = useState(null)

  if (chosen === null) {
    // Only show the choice buttons while this block is the active gate
    if (!isGate) return null
    return (
      <div className="my-4 flex flex-col gap-2">
        {block.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setChosen(i)}
            className="text-left text-blue-300 hover:text-blue-100 italic"
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  // After choosing: show response + a continue button to advance past this gate
  return (
    <div className="my-4">
      <p className="text-gray-300 italic mb-2">{block.options[chosen].response}</p>
      {isGate && (
        <button
          onClick={onDone}
          className="text-white border border-white px-4 py-1 hover:bg-white hover:text-black transition"
        >
          →
        </button>
      )}
    </div>
  )
}
