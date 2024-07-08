import Menubar from '@/components/menu'
import { Toaster } from "@/components/ui/sonner"
import { Toaster as Toasty } from "@/components/ui/toaster"

export default function Menu({ children }) {
  return (
    <>
      <Menubar path={`/profile`} />
      <Toaster />
      <Toasty />
      {children}
    </>
  )
}
