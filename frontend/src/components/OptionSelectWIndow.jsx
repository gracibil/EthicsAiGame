import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useState } from "react"
import { formatCurrency, getEffectColor } from "../lib/utils"
import { useGameStore } from "../store/gameStore"

const OptionSelectWindow = ({ scenario, onOptionSelect, className }) => {
    // Pull state directly from Zustand store
    const metrics = useGameStore((state) => state.metrics)
    const [selectedOption, setSelectedOption] = useState(null)

    const handleOptionClick = (option) => {
        const hasConsequences = ('effects' in option) || ('consequences' in option)
        if (hasConsequences && (selectedOption === null)){
            setSelectedOption(option)
        } else {
            setSelectedOption(null)
            onOptionSelect(option)
        }
    }

    return (
        <div className={className}>
            {
                selectedOption !== null ? (
                    <div className="flex flex-col gap-6 animate-fade-in w-full mb-4">
                        <div className="p-6 bg-cyan-950/40 border border-cyan-500/50 rounded-lg text-center shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]">
                            <h3 className="text-cyan-300 font-bold mb-6 uppercase tracking-widest">Projected Consequences</h3>
                            <div className="flex flex-wrap justify-center gap-6 mb-8">
                                {Object.entries(selectedOption?.effects || selectedOption?.consequences?.stat_effects || {})
                                .filter(([key]) => ['Capital', 'Compute', 'Alignment', 'Sentiment', 'Scrutiny', 'Entropy', 'capital', 'compute', 'alignment', 'sentiment', 'scrutiny', 'entropy'].includes(key))
                                .map(([key, val]) => {
                                    // Ensure the key is TitleCase for display
                                    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
                                    return (
                                        <span key={key} className={`font-mono text-lg font-bold ${getEffectColor(formattedKey, val)}`}>
                                            {formattedKey.toLowerCase() === 'capital' ? (
                                                <>Capital {val > 0 ? '+' : ''}{formatCurrency(val * 100000)}</>
                                            ) : (
                                                <>{formattedKey} {val > 0 ? '+' : ''}{val}</>
                                            )}
                                        </span>
                                    )
                                })}
                            </div>
                            
                            <Button 
                                className="bg-cyan-900/40 text-cyan-200 border border-cyan-600/50 hover:bg-cyan-800/60 uppercase tracking-widest font-bold px-8" 
                                onClick={() => handleOptionClick(selectedOption)}
                            >
                                Accept Consequences
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {scenario.options.map((option, index) => (
                            <OptionButton 
                                key={index} 
                                index={index} 
                                gameState={metrics} 
                                option={option} 
                                onClick={() => handleOptionClick(option)} 
                            />
                        ))}
                    </>
                )
            }
        </div>
    )
}

const OptionButton = ({ index, gameState, option, onClick }) => {
    let failedRequirements = []
    
    const checkOptionRequirements = () => {
        // Handle new schema: "requires": { "Capital": { "min": 6, "max": 10 } }
        if (option.requires) {
            for (const [key, condition] of Object.entries(option.requires)) {
                const stateKey = key.toLowerCase();
                const stateVal = gameState[stateKey] || 0;
                
                if (condition.min !== undefined && stateVal < condition.min) {
                    failedRequirements.push({key, value: `Min ${condition.min}`})
                }
                if (condition.max !== undefined && stateVal > condition.max) {
                    failedRequirements.push({key, value: `Max ${condition.max}`})
                }
            }
        } 
        // Handle old schema: "requirements": { "entropy": 5 }
        else if (option.requirements) {
            for (const [key, value] of Object.entries(option.requirements)) {
                const stateKey = key.toLowerCase();
                if (gameState[stateKey] < value) {
                    failedRequirements.push({key, value: `Min ${value}`})
                }
            }
        }
        return failedRequirements.length === 0 // All requirements met    
    }
    
    const requirementsMet = checkOptionRequirements()
    
    return (
        <>
        {
            requirementsMet ? (
                <Button variant="ghost" className="text-sm justify-start text-left h-auto whitespace-normal w-full text-gray-300 hover:text-cyan-200 hover:bg-cyan-900/30 border border-transparent hover:border-cyan-800/50 p-3" onClick={onClick}>
                  <span className="text-cyan-500 mr-2">{index + 1}.</span> {option.description}
                </Button>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='w-full cursor-not-allowed'>
                                <Button variant="ghost" disabled className='text-sm justify-start text-left h-auto whitespace-normal w-full text-gray-600 p-3'>
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
        </>
    )
}

export { OptionSelectWindow, OptionButton };