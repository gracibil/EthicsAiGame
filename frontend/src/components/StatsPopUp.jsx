import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { formatCurrency, getMetricValueColor } from "../lib/utils";

const StatsPopUp = ({ playerStats, gameState }) => {
  const [showStats, setShowStats] = useState(false);

  if (gameState && gameState !== 'playing') return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      <button
        onClick={() => setShowStats(!showStats)}
        className="px-3 py-2 text-sm bg-black/60 border border-cyan-500/50 hover:bg-cyan-900/60 hover:border-cyan-400 text-cyan-200 font-bold rounded-lg transition-all backdrop-blur-sm shadow-lg"
      >
        {showStats ? 'Close' : 'System Status'}
      </button>

      {showStats && (
        <div className="mt-2 p-4 w-[calc(100vw-2rem)] sm:w-64 bg-black/90 border border-cyan-800 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in">
          <h3 className="text-cyan-400 font-bold mb-3 border-b border-cyan-900/50 pb-2 tracking-wide text-xs">
            System Status
          </h3>
          
          <div className="flex flex-col gap-2">
            {Object.entries(playerStats)
              .filter(([key]) => ['capital', 'compute', 'alignment', 'sentiment', 'scrutiny', 'entropy'].includes(key.toLowerCase()))
              .map(([key, value]) => (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger className="w-full cursor-default">
                    <div className="flex justify-between items-center text-sm w-full">
                    <span className="text-gray-400 text-left capitalize">
                      {key}
                    </span>
                    <span className={`font-mono font-bold text-right ${getMetricValueColor(key, value)}`}>
                      {key.toLowerCase() === 'capital' ? formatCurrency(value * 100000) : `${value}/20`}
                    </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/95 border border-cyan-800 text-cyan-200 shadow-xl">
                    <p>{`This is your current ${key}.`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPopUp;