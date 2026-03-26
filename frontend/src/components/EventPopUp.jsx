import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { OptionSelectWindow } from "./OptionSelectWindow";

function EventPopUp({ event, open, setOpen, gameState, onOptionSelect, footerAction, finalStats }) {
  
  const handleEventOptionSelect = (option) => {
    onOptionSelect(option)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-2xl max-w-[90vw]"        
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >        
        {event.image && (
          <div 
              className="w-full flex-shrink-0 bg-contain bg-no-repeat bg-center"            style={{ 
              backgroundImage: `url(${event.image})`,
              height: 'clamp(150px, 30vh, 350px)'  // scales with screen, min 150px max 350px
            }}
          />
        )}

        <div className="overflow-y-auto flex-1 flex flex-col gap-4 py-2">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription>{event.description}</DialogDescription>
          </DialogHeader>

          {finalStats && (
            <div className="border border-cyan-900/50 rounded p-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
              {Object.entries(finalStats)
                .filter(([key, value]) =>
                  !key.toLowerCase().includes('seed') &&
                  !['military', 'oversight', 'killswitch'].includes(key.toLowerCase()) &&
                  !isNaN(value)
                )
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="text-cyan-500/70 uppercase tracking-wider">{key}</span>
                    <span className="text-cyan-300">{value}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {event.options?.length > 1 && (
          <OptionSelectWindow gameState={gameState} scenario={event} onOptionSelect={handleEventOptionSelect} />
        )}

        {footerAction && (
          <DialogFooter>
            <Button
              onClick={footerAction.onClick}
              className="border border-red-500 text-red-500 px-8 py-3 hover:bg-red-500 hover:text-black transition rounded font-bold tracking-widest uppercase bg-transparent"
            >
              {footerAction.label}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EventPopUp;