import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Contribute({path, text}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full text-left ps-4 h-8 max-w-[12em]">{text}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]"  style={{color: 'white'}}>
        <DialogHeader>
          <DialogTitle>Want to help improve this?</DialogTitle>
          <DialogDescription>
            This map is built off contributions from the community. .
          </DialogDescription>
        </DialogHeader>
        <Button>Let's do it! {path}</Button>
      </DialogContent>
    </Dialog>
  )
}
