import { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "./ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip"
import { Button } from "./ui/button"

const StatsPopUp =({playerStats})=>{
    return(
        <>
        <Dialog>
                <DialogTrigger asChild>
                    <Button className='absolute top-4 right-4 p-2 bg-green-300/30 rounded-md text-sm font-bold hover:bg-green-300/50'>
                        View Stats
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-1/4">
                    <p>Player Stats:</p>
                    {
                        Object.entries(playerStats).map(([key, value]) => (
                            <TooltipProvider>
                            <Tooltip>
                            
                            
                            <TooltipTrigger className="w-full">
                                <div className="flex flex-row">

                                    <p className="mr-auto" key={key}>{key}:</p> 
                                    <p className="ml-auto">{value}</p>
                                    
                                </div>
                            </TooltipTrigger>

                            <TooltipContent>
                                <p>{`This is your current ${key}.`}</p>
                                {/**TODO : Add metric descriptions */}
                            </TooltipContent>
                            
                            </Tooltip>
                            </TooltipProvider>

                        ))
                    }
                </DialogContent>
            </Dialog>

        
        
        
        </>
    )

}

export default StatsPopUp