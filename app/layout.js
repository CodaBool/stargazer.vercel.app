import './globals.css'

export const metadata = {
  title: 'Maps',
  description: 'Community Designed Maps',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}
