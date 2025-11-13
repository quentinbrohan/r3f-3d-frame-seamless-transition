import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'R3F 3D Frame Seamless Transition',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
