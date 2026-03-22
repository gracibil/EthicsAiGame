import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useState } from "react"
const OptionSelectWindow = ({ gameState, scenario, onOptionSelect, className }) => {
    const [selectedOption, setSelectedOption] = useState(null)

    const handleOptionClick = (option) => {
        const hasConsequences = 'consequences' in option

        if (hasConsequences && (selectedOption === null)){
            setSelectedOption(option)
        }else{
            setSelectedOption(null)
            onOptionSelect(option)

        }

    }
    return (
        <div className={className}>
            {
                selectedOption !== null ? (
                    <div className="p-4 rounded-md w-full flex flex-col bg-gray-800/90">
                        <h3 className="text-lg font-bold mb-2">Consequences of your choice:</h3>
                        {
                            Object.entries(selectedOption?.consequences?.stat_effects || {}).map(([key, value]) => (
                                <p key={key}>{`${key}: ${value > 0 ? '+' : ''}${value}`}</p>
                            ))
                        }
                        <Button variant="outline" className="ml-auto mr-auto text-gray-500" onClick={() => handleOptionClick(selectedOption)}>
                                Continue
                        </Button>
                        
                    </div>
                ) : (

                    <>
                        {scenario.options.map((option, index) => (
                            <OptionButton key={index} index={index} gameState={gameState} option={option} onClick={() => handleOptionClick(option)} />
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
        // Check if the option has requirements and if they are met
        if (option.requirements) {
            for (const [key, value] of Object.entries(option.requirements)) {
                if (gameState[key] < value) {
                    failedRequirements.push({key, value})
                }
            }
        }
            return failedRequirements.length === 0 // All requirements met    
        }
    const requirmentsMet = checkOptionRequirements()
    return (
        <>
        {
            requirmentsMet == true ? (
                <button className="text-sm hover:text-blue-300 hover:text-base w-full" onClick={onClick}>
                  {index + 1}.  {option.description}
                </button>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger disabled className='m-0 text-gray-500 text-sm w-full'>
                            
                                {index+ 1} .  {option.description}
                            
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>To select this option you require: {failedRequirements.map(req => `${req.key} (${req.value})`).join(', ')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )

        }
        </>
    )
}

export {OptionSelectWindow, OptionButton};