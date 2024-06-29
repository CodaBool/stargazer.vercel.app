import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from "@/components/ui/tooltip"

import './globals.css'

export const metadata = {
  title: 'Maps',
  description: 'Community Designed Maps',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Toaster />
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
