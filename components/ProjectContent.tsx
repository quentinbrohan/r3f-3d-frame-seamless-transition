import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { CustomFrame } from './CustomFrame'
import { Project, PROJECT_CATEGORY, PROJECTS } from '@/app/data'
import { animateFadeUp, animatePageFadeIn, MOTION_CONFIG } from '@/lib/animations'

const AVAILABILITIES_OPTIONS = {
  AVAILABLE: 'AVAILABLE',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  SOLD: 'SOLD'
} as const;

const AVAILABILITIES_VALUE = {
  AVAILABLE: 'Available',
  NOT_AVAILABLE: 'Not available',
  SOLD: 'Sold out'
} as const;

interface ProjectContentProps {
  isVisible: boolean
  onClose: () => void
  currentProject: Project
}

export function ProjectContent({ isVisible, onClose, currentProject }: ProjectContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const currentProjectIndex = PROJECTS.findIndex(p => p.id === currentProject.id)
  const nextProjectIndex = (currentProjectIndex + 1) % PROJECTS.length
  const nextProject = PROJECTS[nextProjectIndex]

  const nextProjectTitle = nextProject?.name
  const nextProjectTitleArray = nextProjectTitle
    ? [
      nextProjectTitle.slice(0, Math.ceil(nextProjectTitle.length / 3)),
      nextProjectTitle.slice(
        Math.ceil(nextProjectTitle.length / 3),
        Math.ceil((2 * nextProjectTitle.length) / 3)
      ),
      nextProjectTitle.slice(Math.ceil((2 * nextProjectTitle.length) / 3))
    ]
    : []

  // GSAP entrance animation
  useGSAP(() => {
    if (!containerRef.current || !isVisible || !currentProject) return

    const tl = gsap.timeline({ paused: true })
    timelineRef.current = tl

    const container = gsap.utils.selector(containerRef)

    const backToIndexEl = container('button')
    const backgroundImageEl = container('[data-background-image]')
    const titleEl = container('[data-title]')
    const descriptionEl = container('[data-description]')
    const tagEls = container('[data-tag-item]')
    const metadataEls = container('[data-metadata-item]')
    const imageEls = container('[data-image-item]')
    const nextProjectEl = container('[data-next-project]')

    const alphaEls = [containerRef, backgroundImageEl]
    const fadeEls = [backToIndexEl, titleEl, descriptionEl, tagEls, metadataEls, imageEls, nextProjectEl].filter(Boolean)
    alphaEls.forEach((el) => gsap.set(el, { autoAlpha: 1 }))
    fadeEls.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))

    // TODO: gsap default config
    // UPD animation.
    tl.add(
      gsap.fromTo(
        containerRef.current,
        {
          visibility: 'hidden',
          opacity: 0,
        },
        {
          visibility: 'visible',
          opacity: 1,
          autoAlpha: 1,
          duration: 0.001,
          ease: 'power2.inOut',
        }
      ))
    tl.add(
      gsap.fromTo(
        backgroundImageEl,
        {
          visibility: 'hidden',
          opacity: 0,
          // filter: 'blur(20px) brightness(0.5)',

        },
        {
          visibility: 'visible',
          opacity: 1,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power2.inOut',
          // filter: 'blur(20px) brightness(0.3)',

        }
      ), '<')
    tl.add(animateFadeUp(backToIndexEl, {
      y: MOTION_CONFIG.Y_OFFSET.LG,
    }), '<=0.3')
    tl.add(animateFadeUp(titleEl, {
      y: MOTION_CONFIG.Y_OFFSET.LG,
    }), '<=0.3')
      .add(animateFadeUp(descriptionEl, {
        y: MOTION_CONFIG.Y_OFFSET.LG,
      }),
        '<=0.3')
      .add(animateFadeUp(tagEls, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
        stagger: MOTION_CONFIG.STAGGER.MD,
      }), '<=0.3')
      .add(animateFadeUp(metadataEls, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
        stagger: MOTION_CONFIG.STAGGER.MD
      }), '<=0.3')
      .add(animateFadeUp(imageEls, {
        y: MOTION_CONFIG.Y_OFFSET.LG,
        stagger: MOTION_CONFIG.STAGGER.LG
      }), '<=0.3')
    if (nextProjectEl) {
      tl.add(animateFadeUp(nextProjectEl, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
      }), '<=0.3')
    }

    timelineRef.current = tl;

    return () => {
      tl.kill()
    }

  }, {
    scope: containerRef,
    dependencies: [isVisible, currentProject]
  })

  useEffect(
    function toggleMenuAnimation() {
      if (!timelineRef.current) return

      if (currentProject && isVisible) {
        timelineRef.current.play()
      } else {
        timelineRef.current.timeScale(6).reverse()
      }
    },
    [currentProject, isVisible]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, onClose])

  const tags = [
    {
      label: 'Print',
      value: currentProject.isPrintAvailable ? AVAILABILITIES_OPTIONS.AVAILABLE : AVAILABILITIES_OPTIONS.NOT_AVAILABLE,
    },
    {
      label: 'Original',
      value: currentProject.isOriginalAvailable ? AVAILABILITIES_OPTIONS.AVAILABLE : AVAILABILITIES_OPTIONS.NOT_AVAILABLE,
    },
  ]

  const metadata = [
    { label: 'THEME', value: currentProject.theme },
    { label: 'CATEGORY', value: PROJECT_CATEGORY[currentProject.category] },
    { label: 'SIZE', value: `${currentProject.dimensions.width}x${currentProject.dimensions.height} cm` },
    { label: 'YEAR', value: currentProject.endDate ? new Date(currentProject.endDate).getFullYear() : '' },
  ]

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 bg-black text-white overflow-y-auto overflow-x-hidden w-screen pt-20 invisible">
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClose()
        }}
        className="fixed top-24 right-8 z-50 text-white/80 hover:text-white text-sm flex items-center space-x-2"
      >
        ← Return to Index
      </button>

      {/* TODO: use texture directly? */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${currentProject.images[0]})`,
          filter: 'blur(20px) brightness(0.3)',
          transform: 'scale(1.2)',
        }}
        data-background-image={currentProject.images[0]}
      />

      {/* Main Content */}
      <div className="pb-16">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 px-8 pt-16">
          <div className="col-start-1 col-end-13 md:col-start-2 md:col-end-12">
            <div className="grid grid-cols-5 md:grid-cols-10">
              {/* Title */}
              <div className="col-span-5 md:col-span-5"
                data-title
              >
                <h1 className="text-6xl lg:text-7xl font-light text-white-400 leading-tight">
                  {currentProject.name}
                </h1>
              </div>

              {/* Details */}
              <div className="col-span-6 md:col-span-5 space-y-8">
                <div data-description>
                  <p className="text-sm text-white/70">{currentProject.description}</p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
                        data-tag-item={tag.value}
                      >
                        <span
                          style={{
                            opacity: tag.value === 'AVAILABLE' ? 1 : 0.6
                          }}>
                          {/* {tag.label.toUpperCase()}: {AVAILABILITIES_VALUE[tag.value]} */}
                          {tag.label.toUpperCase()}: {AVAILABILITIES_VALUE[tag.value]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-6 pt-8 TODO:REMOVE:border-t border-white/20">
                  {metadata.map((meta) => (
                    <div key={meta.label}>
                      <div data-metadata-item={meta.label} className="text-xs text-white-400 mb-2 uppercase tracking-wider">{meta.label}</div>
                      <div data-metadata-item={meta.value} className="text-sm text-white">{meta.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-12 gap-4 px-8 mt-16 mb-32">
          <div className="col-start-1 col-end-13">
            <div className="mb-8">
              <div className="overflow-hidden">
                <img data-image-item src={currentProject.images[0]} alt="Artwork" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="col-start-1 col-end-13  md:col-start-2 md:col-end-12 grid grid-cols-2 gap-8">
            {currentProject.images.slice(-2).map((src) => (
              <div key={src} className="aspect-[3/4] overflow-hidden">
                <img
                  src={src}
                  alt="Detail view"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next Project */}
        <div className="relative h-screen flex items-center justify-center">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
            <h2 className="text-[12rem] lg:text-[16rem] font-light text-white leading-none mb-8 text-nowrap">
              {nextProjectTitleArray[0]}
              <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>
                {nextProjectTitleArray[1]}
              </span>
              {nextProjectTitleArray[2]}
            </h2>
            <div data-next-project className="text-white text-xl font-light">NEXT PROJECT</div>
          </div>

          <div className="w-96 h-96 z-0 relative">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
              <ambientLight intensity={0.2} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <pointLight position={[-5, 5, 5]} intensity={0.5} />
              <pointLight position={[5, -5, 5]} intensity={0.3} />
              <Environment preset="city" />
              <CustomFrame
                onThroughPlane={() => null}
                image={nextProject?.images[0]}
                lookAtCamera
              />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}