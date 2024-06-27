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
        <footer className="bottom-0 w-full p-8">
          <p className="text-center text-ring">These are community run maps </p>
        </footer>
      </body>
    </html>
  )
}
