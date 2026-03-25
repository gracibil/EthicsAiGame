// Event pop up component

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { OptionButton } from "./OptionSelectWIndow";
import { OptionSelectWindow } from "./OptionSelectWIndow";
function EventPopUp({ event, open, setOpen, gameState, onOptionSelect }) {
  const handleEventOptionSelect = (option) =>{
    onOptionSelect(option)
    setOpen(false)
  }

  return (
    <Dialog className="h-[80vh] w-[500px] text-white" open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-fit h-fit bg-blue-900">
        <div className={`w-full h-[350px] bg-[url(${event.image})]  bg-cover bg-center`}></div>
        <DialogHeader >
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{event.description}</DialogDescription>
        </DialogHeader>

        <OptionSelectWindow gameState={gameState} scenario={event} onOptionSelect={handleEventOptionSelect} />

      </DialogContent>
    </Dialog>
  )
}

export default EventPopUp;