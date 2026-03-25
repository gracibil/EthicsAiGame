import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useGameStore } from '../store/gameStore'
import { formatCurrency, getEffectColor } from '../lib/utils'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getDominantMetric = (stats, type) => {
  const keys = ['capital', 'compute', 'alignment', 'sentiment', 'scrutiny', 'entropy']
  let selectedKey = keys[0]
  let selectedValue = stats[selectedKey] || 0
  for (const key of keys) {
    const val = stats[key] || 0
    if (type === 'highest' && val > selectedValue) { selectedKey = key; selectedValue = val }
    if (type === 'lowest'  && val < selectedValue) { selectedKey = key; selectedValue = val }
  }
  return selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1)
}

// Split contentBlocks on 'continue' blocks into discrete pages
const buildPages = (contentBlocks = []) => {
  const pages = []
  let current = []
  for (const block of contentBlocks) {
    if (block.type === 'continue') {
      pages.push({ blocks: current, continueLabel: block.label || '→' })
      current = []
    } else {
      current.push(block)
    }
  }
  if (current.length > 0) pages.push({ blocks: current, continueLabel: null })
  return pages
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const DialogueBlock = ({ block }) => {
  const [selected, setSelected] = useState(null)

  if (selected) {
    return (
      <div className="mb-6 animate-fade-in">
        <p className="text-cyan-400 font-bold text-left mb-2">{selected.label}</p>
        <p className="whitespace-pre-wrap text-left text-gray-200 leading-relaxed italic">{selected.response}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 mb-10 border-l-2 border-cyan-800 pl-4 mt-2 animate-fade-in">
      {block.options.map((opt, idx) => (
        <button
          key={idx}
          className="text-cyan-400 italic hover:text-cyan-200 text-left transition-colors py-2 min-h-[44px] text-sm sm:text-base"
          onClick={() => setSelected(opt)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const OptionButton = ({ index, gameState, option, onClick }) => {
  const failedRequirements = []

  const checkRequirements = () => {
    if (option.requires) {
      for (const [key, condition] of Object.entries(option.requires)) {
        const val = gameState[key.toLowerCase()] || 0
        if (condition.min !== undefined && val < condition.min) failedRequirements.push({ key, value: `Min ${condition.min}` })
        if (condition.max !== undefined && val > condition.max) failedRequirements.push({ key, value: `Max ${condition.max}` })
      }
    } else if (option.requirements) {
      for (const [key, value] of Object.entries(option.requirements)) {
        if ((gameState[key.toLowerCase()] || 0) < value) failedRequirements.push({ key, value: `Min ${value}` })
      }
    }
    return failedRequirements.length === 0
  }

  const requirementsMet = checkRequirements()

  if (requirementsMet) {
    return (
      <Button
        variant="ghost"
        className="text-sm justify-start text-left h-auto whitespace-normal w-full text-gray-300 hover:text-cyan-200 hover:bg-cyan-900/30 border border-transparent hover:border-cyan-800/50 p-3"
        onClick={onClick}
      >
        <span className="text-cyan-500 mr-2">{index + 1}.</span> {option.description}
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full cursor-not-allowed">
            <Button variant="ghost" disabled className="text-sm justify-start text-left h-auto whitespace-normal w-full text-gray-600 p-3">
              <span className="mr-2">{index + 1}.</span> {option.description}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-red-950/90 border-red-900 text-red-200">
          <p className="font-bold mb-1">Requirements not met:</p>
          <ul className="list-disc pl-4 text-xs">
            {failedRequirements.map((req, i) => (
              <li key={i}>{req.key} ({req.value})</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const ConsequencePreview = ({ option, onConfirm, onCancel }) => (
  <div className="flex flex-col gap-6 animate-fade-in w-full mb-4">
    <div className="p-6 bg-cyan-950/40 border border-cyan-500/50 rounded-lg text-center shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]">
      <h3 className="text-cyan-300 font-bold mb-6 uppercase tracking-widest">Projected Consequences</h3>
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {Object.entries(option?.effects || option?.consequences?.stat_effects || {})
          .filter(([key]) =>
            ['Capital','Compute','Alignment','Sentiment','Scrutiny','Entropy',
             'capital','compute','alignment','sentiment','scrutiny','entropy'].includes(key)
          )
          .map(([key, val]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
            return (
              <span key={key} className={`font-mono text-lg font-bold ${getEffectColor(label, val)}`}>
                {label.toLowerCase() === 'capital'
                  ? <>Capital {val > 0 ? '+' : ''}{formatCurrency(val * 100000)}</>
                  : <>{label} {val > 0 ? '+' : ''}{val}</>
                }
              </span>
            )
          })}
      </div>
      <div className="flex gap-3 justify-center">
        <Button
          variant="ghost"
          className="text-gray-400 border border-gray-700 hover:bg-gray-800 px-6"
          onClick={onCancel}
        >
          Reconsider
        </Button>
        <Button
          className="bg-cyan-900/40 text-cyan-200 border border-cyan-600/50 hover:bg-cyan-800/60 uppercase tracking-widest font-bold px-8"
          onClick={onConfirm}
        >
          Accept Consequences
        </Button>
      </div>
    </div>
  </div>
)

function OptionsPanel({ options, stats, setPendingOption, onOptionSelect }) {
  const handleOptionClick = (option) => {
    const hasConsequences = ('effects' in option) || ('consequences' in option)
    if (hasConsequences) {
      setPendingOption(option)
    } else {
      onOptionSelect(option)
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-3 w-full">
      {options.map((option, index) => (
        <OptionButton
          key={index}
          index={index}
          gameState={stats}
          option={option}
          onClick={() => handleOptionClick(option)}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main SceneRenderer
// ─────────────────────────────────────────────

/**
 * SceneRenderer
 *
 * Props:
 *   scene           – the current scene/scenario object
 *   onOptionSelect  – called with the chosen option (or {} for no-option advance)
 *   gameStats       – metrics snapshot for voiceReveal & requirement checks
 *   isEndingScene   – true when scene is a branch ending (no options, epilogue button)
 *   onEpilogueClick – called when the epilogue button is clicked
 */
export function SceneRenderer({ scene, onOptionSelect, gameStats, isEndingScene = false, onEpilogueClick }) {
  const metrics = useGameStore((state) => state.metrics)
  const stats = gameStats || metrics

  const [pageIndex, setPageIndex] = useState(0)
  const [pendingOption, setPendingOption] = useState(null)

  // Reset on scene change
  useEffect(() => {
    setPageIndex(0)
    setPendingOption(null)
  }, [scene])

  const hasOptions = scene?.options && scene.options.length > 0

  // ── Fallback: no contentBlocks ────────────────────────────────────────────
  if (!scene?.contentBlocks) {
    return (
      <div className="flex flex-col h-full w-full">
        <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-widest">{scene?.title}</h2>
        <p className="flex-1 text-gray-300 leading-relaxed">{scene?.description}</p>

        <div className="mt-4 shrink-0 border-t border-cyan-900/50 pt-4 animate-fade-in">
          {pendingOption ? (
            <ConsequencePreview
              option={pendingOption}
              onConfirm={() => { setPendingOption(null); onOptionSelect(pendingOption) }}
              onCancel={() => setPendingOption(null)}
            />
          ) : hasOptions ? (
            <OptionsPanel
              options={scene.options}
              stats={stats}
              setPendingOption={setPendingOption}
              onOptionSelect={onOptionSelect}
            />
          ) : isEndingScene ? (
            <div className="flex justify-center">
              <Button onClick={onEpilogueClick} className="border border-white px-6 py-2 hover:bg-cyan-900/50 transition">
                Continue to Epilogue
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="cyber" onClick={() => onOptionSelect({})} className="px-8">
                Continue →
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Paginated contentBlocks path ──────────────────────────────────────────
  const pages = buildPages(scene.contentBlocks)
  const isLastPage = pageIndex >= pages.length - 1
  const currentBlocks = pages[pageIndex]?.blocks || []
  const continueLabel = pages[pageIndex]?.continueLabel

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">

      {/* Title — first page only */}
      {pageIndex === 0 && (
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest shrink-0 border-b border-cyan-900/50 pb-4 animate-fade-in">
          {scene.title}
        </h2>
      )}

      {/* Content blocks */}
      <div className="flex-1 flex flex-col gap-4 text-gray-300 overflow-y-auto text-sm sm:text-base mt-2 pr-1">
        {currentBlocks.map((block, idx) => {
          if (block.type === 'text') {
            return <p key={idx} className="leading-relaxed animate-fade-in whitespace-pre-wrap">{block.text}</p>
          }
          if (block.type === 'voiceReveal') {
            const metric = getDominantMetric(stats, block.voiceType)
            const voiceText = scene.dynamicVoices?.[block.voiceType]?.[metric] || ''
            return (
              <div key={idx} className="my-2 p-4 bg-cyan-950/10 border-l-2 border-cyan-500/50 rounded animate-fade-in">
                <p className="italic text-cyan-500/80 font-mono text-xs sm:text-sm mb-2">{block.prompt}</p>
                <p className="text-cyan-100 text-sm font-mono leading-relaxed">{voiceText}</p>
              </div>
            )
          }
          if (block.type === 'dialogueChoice') {
            return <DialogueBlock key={idx} block={block} />
          }
          return null
        })}
      </div>

      {/* Footer navigation */}
      <div className="mt-4 shrink-0 border-t border-cyan-900/50 pt-4">

        {/* Not last page: prev / next */}
        {!isLastPage && (
          <div className="flex items-center justify-between w-full">
            {pageIndex > 0 ? (
              <Button onClick={() => setPageIndex(p => p - 1)} variant="cyber-ghost" className="px-6">
                ← Back
              </Button>
            ) : <div />}
            <Button onClick={() => setPageIndex(p => p + 1)} variant="cyber" className="px-8">
              {continueLabel || 'Continue'}
            </Button>
          </div>
        )}

        {/* Last page: consequence preview, options, or advance button */}
        {isLastPage && (
          <div className="animate-fade-in">
            {pendingOption ? (
              <ConsequencePreview
                option={pendingOption}
                onConfirm={() => { setPendingOption(null); onOptionSelect(pendingOption) }}
                onCancel={() => setPendingOption(null)}
              />
            ) : hasOptions ? (
              <OptionsPanel
                options={scene.options}
                stats={stats}
                setPendingOption={setPendingOption}
                onOptionSelect={onOptionSelect}
              />
            ) : (
              <div className="flex items-center justify-between">
                {pageIndex > 0 ? (
                  <Button onClick={() => setPageIndex(p => p - 1)} variant="cyber-ghost" className="px-6">
                    ← Back
                  </Button>
                ) : <div />}
                {isEndingScene ? (
                  <Button onClick={onEpilogueClick} className="border border-white px-6 py-2 hover:bg-cyan-900/50 transition">
                    Continue to Epilogue
                  </Button>
                ) : (
                  <Button variant="cyber" onClick={() => onOptionSelect({})} className="px-8">
                    Continue →
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}