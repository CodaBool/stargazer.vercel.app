import Menu from "@/components/menu"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as Toasty } from "@/components/ui/toaster"

export default function Contribute({ children }) {
  return (
    <>
      <Menu nav="true" />
      <Toaster />
      <Toasty />
      {children}
    </>
  )
}
