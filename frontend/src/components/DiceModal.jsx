import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'
import { formatCurrency, getEffectColor } from '../lib/utils'

const FACES = [
  [],
  [4],
  [0, 8],
  [0, 4, 8],
  [0, 2, 6, 8],
  [0, 2, 4, 6, 8],
  [0, 2, 3, 5, 6, 8],
]

function Die({ face, rolling, outcome }) {
  const dotColor =
    outcome === 'success' || rolling ? 'bg-cyan-300' : 'bg-red-400'

  const borderClass = rolling
    ? 'border-cyan-400 animate-pulse'
    : outcome === 'success'
    ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
    : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'

  return (
    <div className={`grid grid-cols-3 grid-rows-3 gap-[6px] p-3 w-20 h-20 rounded-xl border-2 bg-black/50 transition-all duration-300 ${borderClass}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-opacity duration-100 ${
            FACES[face]?.includes(i) ? `${dotColor} opacity-100` : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}

export default function DiceModal({ diceRoll, onConfirm }) {
  const [face, setFace] = useState(6)
  const [rolling, setRolling] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const intervalRef = useRef(null)

  const { rawRoll, finalRoll, modifier, gambleMetric, outcome, failureDescription } = diceRoll
  const success = outcome === 'success'
  const critFail = outcome === 'crit'

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRolling(true)
      let ticks = 0
      const maxTicks = 16
      intervalRef.current = setInterval(() => {
        setFace(Math.floor(Math.random() * 6) + 1)
        ticks++
        if (ticks >= maxTicks) {
          clearInterval(intervalRef.current)
          setFace(Math.min(rawRoll, 6))
          setRolling(false)
          setRevealed(true)
        }
      }, 60)
    }, 300)

    return () => {
      clearTimeout(timeout)
      clearInterval(intervalRef.current)
    }
  }, [rawRoll])

  return (
    <Dialog open={true}>
      <DialogContent 
        showCloseButton={false} 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="flex flex-col items-center gap-6 p-8 bg-gray-950 border border-cyan-900/60 rounded-2xl shadow-2xl w-[90%] max-w-sm sm:max-w-sm"
      >
        <p className="text-xs uppercase tracking-widest text-cyan-600 font-bold">
          {gambleMetric} Check
        </p>

        <Die face={face} rolling={rolling} outcome={rolling ? 'rolling' : outcome} />

        {revealed && (
          <div className="flex flex-col items-center gap-2 animate-fade-in w-full">
            {modifier > 0 && (
              <p className="text-xs text-gray-500 tracking-wider">
                {rawRoll} + {modifier} ({gambleMetric} bonus) ={' '}
                <span className="text-cyan-400 font-bold">{finalRoll}</span>
              </p>
            )}

            {critFail ? (
              <>
                <p className="text-red-400 font-bold text-lg uppercase tracking-widest">Critical Failure</p>
                {failureDescription && (
                  <p className="text-gray-400 text-xs text-center italic leading-relaxed px-2">{failureDescription}</p>
                )}
              </>
            ) : success ? (
              <p className="text-cyan-300 font-bold text-lg uppercase tracking-widest">Success</p>
            ) : (
              <>
                <p className="text-red-400 font-bold text-lg uppercase tracking-widest">Failed</p>
                {failureDescription && (
                  <p className="text-gray-400 text-xs text-center italic leading-relaxed px-2">{failureDescription}</p>
                )}
              </>
            )}

            <div className="flex flex-col items-center gap-1 mt-2 mb-2 p-3 bg-black/40 border border-cyan-900/30 rounded-lg w-full">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Consequences:</span>
               
               {diceRoll.effectsToApply && Object.entries(diceRoll.effectsToApply).map(([key, value]) => {
                   // Ensure the key is consistently formatted
                   const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
                   const isCapital = formattedKey === 'Capital';
                   
                   return (
                     <div key={key} className="flex justify-between w-full text-sm px-2 items-center">
                          <span className="text-gray-300 capitalize">
                            {formattedKey}
                          </span>
                         <span className={`font-bold ${getEffectColor(formattedKey, value)}`}>
                             {isCapital 
                               ? `${value > 0 ? '+' : ''}${formatCurrency(value * 100000)}` 
                               : `${value > 0 ? '+' : ''}${value}`}
                         </span>
                     </div>
                   );
               })}

               {(!diceRoll.effectsToApply || Object.keys(diceRoll.effectsToApply).length === 0) && (
                   <span className="text-gray-500 text-xs italic">No immediate stat changes.</span>
               )}
            </div>

            <Button 
              onClick={onConfirm} 
              variant={success ? "cyber" : "cyber-danger"} 
              className="w-full mt-2"
            >
              Apply Consequences →
            </Button>
          </div>
        )}

        {!revealed && (
          <div className="h-24 flex items-center">
            <p className="text-cyan-800 text-xs uppercase tracking-widest animate-pulse">Rolling...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}