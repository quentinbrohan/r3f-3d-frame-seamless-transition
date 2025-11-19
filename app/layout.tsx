import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/dom/Header'
import { GSAP } from '@/components/dom/GSAP'

export const metadata: Metadata = {
  title: 'R3F 3D Frame Seamless Transition',
  description: 'An interactive 3D art gallery experience built with React Three Fiber. Explore artworks in a seamless 3D carousel with smooth transitions and immersive frame interactions.',
  keywords: ['React Three Fiber', '3D', 'WebGL', 'Interactive Gallery', 'Three.js', 'Next.js', '3D Art', 'WebGL Gallery'],
  authors: [{ name: 'Quentin Brohan', url: 'https://www.quentinbrohan.fr/' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <GSAP />
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
