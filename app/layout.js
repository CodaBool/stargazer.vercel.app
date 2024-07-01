import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from "@/components/ui/tooltip"
import Menubar from "@/components/menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import './globals.css'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Maps',
  description: 'Community Designed Maps',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen">
        <Toaster />
        <Menubar />
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <footer className="bottom-0 w-full p-2" style={{ background: 'black', borderTop: '2px solid grey', position: 'absolute', bottom: '0'}}>
          <p className="text-center text-ring" style={{color: 'white'}}>MIT License, free and open source</p>
        </footer>
      </body>
    </html>
  )
}
