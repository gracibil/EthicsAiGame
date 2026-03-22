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
import { OptionButton } from "./optionSelectWIndow";
function EventPopUp({ event, open, setOpen, gameState, onOptionSelect }) {
  console.log('event : ', event)

  const handleEventOptionSelect = (option) =>{
    onOptionSelect(option)
    setOpen(false)
  }

  return (
    <Dialog className="h-[80vh] w-[500px]" open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-fit h-fit bg-red-900">
        <div className={`w-full h-[350px] bg-[url(${event.image})]  bg-cover bg-center`}></div>
        <DialogHeader >
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{event.description}</DialogDescription>
        </DialogHeader>
          {
 
            event.options.map((option, index)=>{
              return <OptionButton index={index} option={option} onClick={()=>handleEventOptionSelect(option)}   />;
            })

          }        

        <DialogFooter className={'text-white'}>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventPopUp;