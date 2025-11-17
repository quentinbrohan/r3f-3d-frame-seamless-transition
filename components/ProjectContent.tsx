import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { CustomFrame, DEFAULT_FRAME_SCALE, FRAME_PLANE_WIDTH } from './CustomFrame'
import { Project, PROJECT_CATEGORY, PROJECTS } from '@/app/data'
import { animateFadeUp, animateFadeUpOut, MOTION_CONFIG } from '@/lib/animations'
import { SHARED_CANVAS_PROPS } from '@/app/page'
import { CAROUSEL_RADIUS } from './MainScene'
import * as THREE from "three";

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
  onNext: () => void;
  viewportWidth: number;
}

export function ProjectContent({ isVisible, onClose, currentProject, onNext, viewportWidth }: ProjectContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const currentProjectIndex = PROJECTS.findIndex(p => p.id === currentProject.id)
  const nextProjectIndex = (currentProjectIndex + 1) % PROJECTS.length
  const nextProject = PROJECTS[nextProjectIndex]

  const [showOverlayCanvas, setShowOverlayCanvas] = useState(true);
  const [isTransitionning, setIsTransitionning] = useState(false)
  const frameRef = useRef<THREE.Group>(null)

  const onNextProject = () => {
    if (!frameRef.current || !containerRef.current) return;

    setIsTransitionning(true)
    let hasFadeOut = false;

    const tl = gsap.timeline();
    const targetScale = 1;
    tl.to(frameRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 0.8,
      ease: "cubic.inOut",
      onStart: () => {
        const container = gsap.utils.selector(containerRef)

        const nextProjectTitleEl = container('[data-next-project-title]')
        const nextProjectNameColorEl = container('[data-next-project-name-color]')
        const nextProjectNameStrokeEl = container('[data-next-project-name-stroke]')


        const subTl = gsap.timeline();


        subTl.add(
          animateFadeUpOut(nextProjectTitleEl, {
            y: MOTION_CONFIG.Y_OFFSET.MD,
          })
        )
          .add(
            animateFadeUpOut(nextProjectNameColorEl, {
              y: MOTION_CONFIG.Y_OFFSET.LG
            }),
            '<+=0.15')
          .add(
            animateFadeUpOut(nextProjectNameStrokeEl, {
              y: MOTION_CONFIG.Y_OFFSET.LG
            }),
            '<+=0.15'
          )

      },
      onUpdate: () => {
        if (frameRef.current.scale.x > targetScale * 0.7 && !hasFadeOut) {
          // timelineRef.current?.timeScale(6).reverse()


          hasFadeOut = true;
          onNext()
          setIsTransitionning(false)
        }
      },
      onComplete: () => {
        gsap.set(frameRef.current.scale, {
          x: DEFAULT_FRAME_SCALE,
          y: DEFAULT_FRAME_SCALE,
          z: DEFAULT_FRAME_SCALE,
        })
        hasFadeOut = false;
      }
    });

  }

  // Add ref to track fade state
  const hasFadedOut = useRef(false)

  const nextProjectTitle = nextProject?.name

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
    const nextProjectTitleEl = container('[data-next-project-title]')
    const nextProjectNameColorEl = container('[data-next-project-name-color]')
    const nextProjectNameStrokeEl = container('[data-next-project-name-stroke]')

    const alphaEls = [containerRef, backgroundImageEl]
    const fadeEls = [backToIndexEl, titleEl, descriptionEl, tagEls, metadataEls, imageEls, nextProjectTitleEl, nextProjectNameColorEl, nextProjectNameStrokeEl].filter(Boolean)
    alphaEls.forEach((el) => gsap.set(el, { autoAlpha: 1 }))
    fadeEls.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))

    // TODO: gsap default config
    tl.add(
      gsap.fromTo(
        containerRef.current,
        {
          visibility: 'hidden',
          opacity: 0,
          backdropFilter: 'blur(0px)'
        },
        {
          visibility: 'visible',
          opacity: 1,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power2.inOut',
          backdropFilter: 'blur(10px)'

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
          opacity: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power2.inOut',
          // filter: 'blur(20px) brightness(0.3)',

        }
      ), '<')
    tl.add(animateFadeUp(backToIndexEl, {
      y: MOTION_CONFIG.Y_OFFSET.LG,
    }), '<=0.15')
    tl.add(animateFadeUp(titleEl, {
      y: MOTION_CONFIG.Y_OFFSET.LG,
    }), '<=0.15')
      .add(animateFadeUp(descriptionEl, {
        y: MOTION_CONFIG.Y_OFFSET.LG,
      }),
        '<=0.15')
      .add(animateFadeUp(tagEls, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
        stagger: MOTION_CONFIG.STAGGER.MD,
      }), '<=0.15')
      .add(animateFadeUp(metadataEls, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
        stagger: MOTION_CONFIG.STAGGER.MD
      }), '<=0.15')
      .add(animateFadeUp(imageEls, {
        y: MOTION_CONFIG.Y_OFFSET.LG,
        stagger: MOTION_CONFIG.STAGGER.LG
      }), '<=0.15')
    if (nextProjectTitleEl) {
      tl.add(animateFadeUp(nextProjectTitleEl, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
      }), '<=0.15')
        .add(animateFadeUp(nextProjectNameColorEl, {
          y: MOTION_CONFIG.Y_OFFSET.LG,
        }), '<=0.15')
        .add(animateFadeUp(nextProjectNameStrokeEl, {
          y: MOTION_CONFIG.Y_OFFSET.LG,
        }), '<=0.15')
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
        containerRef.current.scrollTop = 0
        timelineRef.current.play()
      } else {
        timelineRef.current.timeScale(6).reverse()
      }
    },
    [currentProject, isVisible]
  )

  useEffect(() => {
    if (isVisible && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [isVisible])

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
    <div ref={containerRef} className="fixed inset-0 z-40 bg-black/60 text-white overflow-y-auto overflow-x-hidden w-screen pt-20 invisible">
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
      <div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 px-8 pt-16">
          <div className="col-start-1 col-end-13 md:col-start-2 md:col-end-12">
            <div className="grid grid-cols-5 md:grid-cols-10  gap-16">
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
        {Boolean(nextProject) && (<div className="relative h-screen flex items-center justify-center bg-black cursor-pointer"
          // onClick={onNext}
          onClick={onNextProject}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div data-next-project-title className="absolute text-white text-xl font-light z-[2] pointer-events-none"
              style={{
                top: 16
              }}
            >NEXT PROJECT</div>
            <h2 data-next-project-name-color className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8rem] lg:text-[12rem] font-light text-white leading-none mb-8 text-nowrap" style={{
              color: 'white',
              WebkitTextStroke: '1px white'
            }}>
              {nextProjectTitle}
            </h2>
            <h2 data-next-project-name-stroke className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8rem] lg:text-[12rem] font-light text-white leading-none mb-8 text-nowrap"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px white',
                zIndex: 2
              }}>
              {nextProjectTitle}
            </h2>
          </div>

          <div className="w-full h-screen z-[1]">
            <Canvas
              {...SHARED_CANVAS_PROPS}
            >
              <ambientLight intensity={0.2} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <pointLight position={[-5, 5, 5]} intensity={0.5} />
              <pointLight position={[5, -5, 5]} intensity={0.3} />
              <Environment preset="city" />
              <CustomFrame
                image={nextProject.images[0]}
                lookAtCamera={!isTransitionning}
                ref={frameRef}
                key={nextProject.id} // TODO: update material directly instead
                position={[0, 0, -(CAROUSEL_RADIUS / 2)]} // /2 because looking at carousel from its center
              />
            </Canvas>
          </div>
        </div>)}
      </div>
    </div>
  )
}