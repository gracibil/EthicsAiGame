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

function EventPopUp({ event, open, setOpen }) {

  return (
    <Dialog className="h-[80vh] w-[500px]" open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-fit h-fit bg-red-900">
        <div className="w-[500px] h-[350px] bg-[url(./assets/images/protest-hard.png)]  bg-cover bg-center"></div>
        <DialogHeader >
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventPopUp;