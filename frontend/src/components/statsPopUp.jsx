import { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "./ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip"
import { Button } from "./ui/button"

const statsPopUp =({playerStats, children})=>{
    return(
        <>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent>
                    <p>Player Stats:</p>
                    <ul>
                        <li>Cash: {playerStats.cash}</li>
                        <li>Reputation: {playerStats.reputation}</li>
                        <li>Entropy: {playerStats.entropy}</li>
                    </ul>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        
        
        
        </>
    )

}