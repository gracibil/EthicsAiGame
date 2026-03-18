import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

const OptionSelectWindow = ({ gameState, scenario, onOptionSelect, className }) => {
    console.log("Rendering OptionSelectWindow with scenario:", scenario)
    return (
        <div className={className}>
            {scenario.options.map((option, index) => (
                <OptionButton index={index} gameState={gameState} option={option} onClick={() => onOptionSelect(option)} />
            ))}
        </div>
    )
}

const OptionButton = ({ index, gameState, option, onClick }) => {
    const checkOptionRequirements = () => {
        // Check if the option has requirements and if they are met
        if (option.requirements) {
            // Implement logic to check if requirements are met
            // This could involve checking player stats, previous choices, etc.
            return true // Placeholder: return true if requirements are met, false otherwise
        }
        return true // If there are no requirements, the option is available
    }
    const requirmentsMet = checkOptionRequirements()
    console.log('option button rendering for option :', option)
    return (
        <>
        {
            requirmentsMet == true ? (
                <button className=" hover:bg-green-100/10 hover:text-green-300 text-xs w-full" onClick={onClick}>
                  {index + 1}.  {option.description}
                </button>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className='m-0'>
                            <button className=" hover:bg-green-100/10 hover:text-green-300 text-xs w-full" disabled onClick={onClick}>
                                {index+ 1} .  {option.description}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Requirements not met</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )

        }
        </>
    )
}

export {OptionSelectWindow, OptionButton};