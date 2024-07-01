import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Search from './search'

export default function DialogBtn() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button style={{width: '100%', textAlign: 'left'}}>Search</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]"  style={{color: 'white'}}>
        <DialogHeader>
          <DialogTitle>Search all locations</DialogTitle>
          <DialogDescription>
            This does not look at territories, only point locations.
          </DialogDescription>
        </DialogHeader>
        <Search />
      </DialogContent>
    </Dialog>
  )
}
