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

export default function CustomDialog({ children, to, title, content, titleJSX }) {
  const router = useRouter()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-left h-8 w-[12em]">{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" style={{ color: 'white' }}>
        <DialogHeader>
          <DialogTitle>{titleJSX ? titleJSX : title}</DialogTitle>
          <DialogDescription className="py-6">
            {content}
          </DialogDescription >
        </DialogHeader>
        {to &&
          <Button onClick={() => router.push(to)}>Let's do it!</Button >
        }
      </DialogContent>
    </Dialog>
  )
}
