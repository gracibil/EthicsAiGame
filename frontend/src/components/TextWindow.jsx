import { useState, useEffect } from 'react';
import { Button } from './ui/button';

// Helper to determine the player's highest or lowest stat
const getDominantMetric = (stats, type) => {
  const keys = ['capital', 'compute', 'alignment', 'sentiment', 'scrutiny', 'entropy'];
  let selectedKey = keys[0];
  let selectedValue = stats[selectedKey] || 0;

  for (const key of keys) {
    const val = stats[key] || 0;
    if (type === 'highest' && val > selectedValue) {
      selectedKey = key;
      selectedValue = val;
    } else if (type === 'lowest' && val < selectedValue) {
      selectedKey = key;
      selectedValue = val;
    }
  }
  return selectedKey.charAt(0) + selectedKey.slice(1);
};

const DialogueBlock = ({ block }) => {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="mb-6 animate-fade-in">
        <p className="text-cyan-400 font-bold text-left mb-2">{selected.label}</p>
        <p className="whitespace-pre-wrap text-left text-gray-200 leading-relaxed italic">{selected.response}</p>
      </div>
    );
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
  );
}


const TextWindow = ({ scenario, onFinish, gameStats }) => {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [scenario]);

  if (!scenario.contentBlocks) {
    useEffect(() => {
      onFinish(true);
    }, [scenario, onFinish]);

    return (
      <div className="flex flex-col h-full w-full">
        <h2 className="text-2xl font-bold mb-4 text-cyan-300  tracking-widest">{scenario.title}</h2>
        <p className="flex-1 text-gray-300 leading-relaxed">{scenario.description}</p>
      </div>
    );
  }

  const pages = [];
  let currentPage = [];
  let currentLabel = "Next";

  scenario.contentBlocks.forEach(block => {
    if (block.type === 'continue') {
      pages.push({ blocks: currentPage, continueLabel: block.label || "→" });
      currentPage = [];
    } else {
      currentPage.push(block);
    }
  });
  if (currentPage.length > 0) {
    pages.push({ blocks: currentPage, continueLabel: null });
  }

  const isLastPage = pageIndex >= pages.length - 1;

  useEffect(() => {
    onFinish(isLastPage);
  }, [isLastPage, onFinish]);

  const handleNext = () => {
    if (!isLastPage) {
      setPageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1);
    }
  };

  const currentBlocks = pages[pageIndex]?.blocks || [];
  const label = pages[pageIndex]?.continueLabel;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      
      {/* Title only renders on the first page*/}
      {pageIndex === 0 && (
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest shrink-0 border-b border-cyan-900/50 pb-4 animate-fade-in">
          {scenario.title}
        </h2>
      )}
      
      <div className="flex-1 flex flex-col gap-4 text-gray-300 overflow-hidden text-sm sm:text-base mt-2">
         {currentBlocks.map((block, idx) => {
           if (block.type === 'text') {
             return <p key={idx} className="leading-relaxed animate-fade-in">{block.text}</p>
           }
           
           if (block.type === 'voiceReveal') {
             const metric = getDominantMetric(gameStats || {}, block.voiceType);
             const voiceText = scenario.dynamicVoices?.[block.voiceType]?.[metric] || "";
             
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
           return null;
         })}
      </div>

      <div className="mt-4 flex items-center justify-between w-full shrink-0">
         {pageIndex > 0 ? (
            <Button onClick={handlePrev} variant="cyber-ghost" className="px-6">
                ← Back
            </Button>
         ) : (
           <div /> 
         )}

         {!isLastPage && (
            <Button onClick={handleNext} variant="cyber" className="px-8">
                Continue
            </Button>
         )}
      </div>
    </div>
  );
}

export default TextWindow;