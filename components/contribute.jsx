import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

export default function CustomDialog({ children, to, title, description }) {
  const router = useRouter()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-left ps-4 h-8 max-w-[12em]">{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" style={{ color: 'white' }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="py-6">
            {description}
          </DialogDescription >
        </DialogHeader>
        <Button onClick={() => router.push(to)}>Let's do it!</Button >
      </DialogContent>
    </Dialog>
  )
}
