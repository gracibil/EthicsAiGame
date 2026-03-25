import { useState } from 'react';
import { Button } from './ui/button';

const CharacterSelectionScreen = ({ archetypes, onSelect, getMetricValueColor, formatCurrency }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentArch = archetypes[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % archetypes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + archetypes.length) % archetypes.length);
  };

  return (
    <div className="flex flex-col h-full py-4 animate-fade-in items-center justify-center">
      <h2 className="text-xl sm:text-2xl text-cyan-400 font-bold mb-2 text-center tracking-wide sm:tracking-widest uppercase">
        Select Your Background
      </h2>
      <p className="text-gray-400 text-center mb-6 flex-shrink-0 italic text-[10px] sm:text-xs max-w-lg">
        Your starting architecture dictates your initial advantages and vulnerabilities.
      </p>
      
      {/* Carousel Container */}
      <div className="flex flex-row items-center justify-center w-full">
        
        {/* Previous Button */}
        <Button 
          variant="cyber-ghost"
          size="icon-lg"
          onClick={handlePrev}
          className="text-2xl sm:text-4xl font-mono shrink-0 hover:-translate-x-1 mx-2"
        >
          {"<"}
        </Button>

        {/* Character Card */}
        <div className="flex-1 p-4 sm:p-4 border border-cyan-900/60 rounded-lg text-left relative shadow-[0_0_20px_rgba(0,255,255,0.05)] h-[300px] sm:h-[300px]">
          
          <div className="flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cyan-900/40 pb-2 shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-cyan-200 leading-snug">
                {currentArch.name}
              </h3>
              <span className="text-cyan-800 font-mono text-[10px] sm:text-xs shrink-0 ml-4">
                {currentIndex + 1} / {archetypes.length}
              </span>
            </div>
            
            {/* Quote */}
            <p className="text-[10px] sm:text-xs text-cyan-500/80 italic shrink-0">
              "{currentArch.quote}"
            </p>
            
            {/* Description */}
            <p className="text-gray-300 text-[10px] sm:text-xs leading-relaxed">
              {currentArch.description}
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-4 mt-2 pt-4 border-t border-cyan-900/30 shrink-0">
              {Object.entries(currentArch.metrics)
              .filter(([key]) => ['capital', 'compute', 'alignment', 'sentiment', 'scrutiny', 'entropy'].includes(key))
              .map(([key, val]) => (
                <div key={key} className="flex flex-col items-start gap-1">
                  <span className="text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px] leading-none">
                    {key}
                  </span>
                  <span className={`font-bold text-[10px] sm:text-xs ${getMetricValueColor(key, val)}`}>
                    {key.toLowerCase() === 'capital' ? formatCurrency(val * 100000) : `${val}/20`}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Next Button */}
        <Button 
          variant="cyber-ghost"
          size="icon-lg"
          onClick={handleNext}
          className="text-2xl sm:text-4xl font-mono shrink-0 hover:translate-x-1 mx-2"
        >
          {">"}
        </Button>
      </div>

      {/* Select Button */}
      <Button 
        variant="cyber"
        onClick={() => onSelect(currentArch)}
        className="mt-6 w-[80%] sm:w-auto h-12 sm:h-14 px-8 text-sm sm:text-base"
      >
        Initialize Profile
      </Button>

      {/* Pagination Dots */}
      <div className="flex gap-2 mt-4">
        {archetypes.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-cyan-900'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default CharacterSelectionScreen;