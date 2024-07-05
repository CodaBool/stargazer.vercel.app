import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SearchBox from './search'
import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { isMobile } from '@/lib/utils.js'

export default function DialogBtn({ zoom, width, height, svg, projection }) {
  const [open, setOpen] = useState()
  const btn = useRef(null)
  const mobile = isMobile()

  useEffect(() => {
    function down(e) {
      if (e.code === 'Space') {
        if (open) return
        // literally no clue why location list is short
        // if this timeout is not present 🤷
        setTimeout(() => {
          setOpen(true)
        }, 0)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" ref={btn} onClick={() => setOpen(true)}><Search size={16} className="relative top-[1px]" /> Search</Button>
      <DialogContent className="sm:max-w-[500px]" style={{ color: 'white' }}>
        <DialogHeader>
          <DialogTitle>Search the Map</DialogTitle>
          <DialogDescription>
            {!mobile && "You can open this search at anypoint by pressing Space."}
          </DialogDescription>
        </DialogHeader>
        <SearchBox setOpen={setOpen} zoom={zoom} width={width} height={height} svg={svg} projection={projection} />
      </DialogContent>
    </Dialog>
  )
}
