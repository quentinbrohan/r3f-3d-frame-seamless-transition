import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { CustomFrame, DEFAULT_FRAME_SCALE } from './webgl/CustomFrame'
import { Project, ProjectCategories, PROJECTS } from '@/app/data'
import { animateFadeUp, animateFadeUpOut, MOTION_CONFIG } from '@/lib/animations'
import { SHARED_CANVAS_PROPS } from '@/app/page'
import { CAROUSEL_RADIUS } from './MainScene'
import * as THREE from "three";

const AVAILABILITIES_OPTIONS = {
    AVAILABLE: 'AVAILABLE',
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    SOLD: 'SOLD'
} as const;

const AVAILABILITIES_VALUE: Record<keyof typeof AVAILABILITIES_OPTIONS, string> = {
    AVAILABLE: 'Available',
    NOT_AVAILABLE: 'Not available',
    SOLD: 'Sold out'
} as const;

export const PROJECT_CATEGORY_LABEL: Record<ProjectCategories, string> = {
    PHYSICAL_ART: 'Physical Art'
}

interface ProjectContentProps {
    isVisible: boolean
    onClose: () => void
    currentProject: Project
    onNext: () => void;
}

export function ProjectContent({ isVisible, onClose, currentProject, onNext }: ProjectContentProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<gsap.core.Timeline | null>(null)
    const frameRef = useRef<THREE.Group>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const { nextProject, nextProjectTitle } = useMemo(() => {
        const currentProjectIndex = PROJECTS.findIndex(p => p.id === currentProject.id)
        const nextProjectIndex = (currentProjectIndex + 1) % PROJECTS.length

        return {
            nextProject: PROJECTS[nextProjectIndex],
            nextProjectTitle: PROJECTS[nextProjectIndex]?.name ?? ''
        }
    }, [currentProject.id])

    const tags = useMemo(() => ([
        {
            label: 'Print',
            value: currentProject.isPrintAvailable ? AVAILABILITIES_OPTIONS.AVAILABLE : AVAILABILITIES_OPTIONS.NOT_AVAILABLE,
        },
        {
            label: 'Original',
            value: currentProject.isOriginalAvailable ? AVAILABILITIES_OPTIONS.AVAILABLE : AVAILABILITIES_OPTIONS.NOT_AVAILABLE,
        },
    ]), [currentProject.isOriginalAvailable, currentProject.isPrintAvailable])

    const metadata = useMemo(() => ([
        { label: 'THEME', value: currentProject.theme },
        { label: 'CATEGORY', value: PROJECT_CATEGORY_LABEL[currentProject.category] },
        { label: 'SIZE', value: `${currentProject.dimensions.width}x${currentProject.dimensions.height} cm` },
        { label: 'YEAR', value: currentProject.endDate ? new Date(currentProject.endDate).getFullYear() : '' },
    ]), [currentProject.category, currentProject.dimensions.height, currentProject.dimensions.width, currentProject.endDate, currentProject.theme])

    const onNextProject = useCallback(() => {
        if (!frameRef.current || !containerRef.current) return;

        const container = gsap.utils.selector(containerRef)
        const nextProjectContainerEl = container('[data-next-project-container]')
        const nextProjectTitleEl = container('[data-next-project-title]')
        const nextProjectNameColorEl = container('[data-next-project-name-color]')
        const nextProjectNameStrokeEl = container('[data-next-project-name-stroke]')

        const tl = gsap.timeline({ id: 'project-content' });
        const targetScale = 1;

        tl.add(
            gsap.to(containerRef.current, {
                duration: MOTION_CONFIG.DURATION.CTA,
                scrollTo: {
                    y: nextProjectContainerEl[0],
                    offsetY: 0
                },
                ease: MOTION_CONFIG.EASING.OUT,
                onStart: () => {
                    setIsTransitioning(true)
                }
            })
        )
        tl.add(
            animateFadeUpOut(nextProjectTitleEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }),
        )
        tl.add(
            animateFadeUpOut(nextProjectNameColorEl, {
                y: MOTION_CONFIG.Y_OFFSET.LG
            }),
            `<+=${MOTION_CONFIG.STAGGER_DELAY.MD}`
        )
        tl.add(
            animateFadeUpOut(nextProjectNameStrokeEl, {
                y: MOTION_CONFIG.Y_OFFSET.LG
            }),
            `<+=${MOTION_CONFIG.STAGGER_DELAY.MD}`
        )

        tl.to(frameRef.current.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: MOTION_CONFIG.DURATION.FRAME_SCALE,
            ease: MOTION_CONFIG.EASING.FRAME_SCALE
        }, 0.2)

        tl.add(() => {
            onNext()
            setIsTransitioning(false)
        }, 0.6) // todo adjust based on scale progress since different on desktop and mobile


        tl.add(() => {
            gsap.set(frameRef.current!.scale, {
                x: DEFAULT_FRAME_SCALE,
                y: DEFAULT_FRAME_SCALE,
                z: DEFAULT_FRAME_SCALE,
            })
        })

    }, [onNext])


    useGSAP(() => {
        if (!containerRef.current || !isVisible || !currentProject) return

        const tl = gsap.timeline({ paused: true })
        timelineRef.current = tl

        const container = gsap.utils.selector(containerRef)

        const backToIndexEl = container('[data-close-button]')
        const titleEl = container('[data-title]')
        const descriptionEl = container('[data-description]')
        const tagEls = container('[data-tag-item]')
        const metadataEls = container('[data-metadata-item]')
        const imageEls = container('[data-image-item]')
        const nextProjectTitleEl = container('[data-next-project-title]')
        const nextProjectNameColorEl = container('[data-next-project-name-color]')
        const nextProjectNameStrokeEl = container('[data-next-project-name-stroke]')

        const alphaEls = [containerRef]
        const fadeEls = [backToIndexEl, titleEl, descriptionEl, tagEls, metadataEls, imageEls, nextProjectTitleEl, nextProjectNameColorEl, nextProjectNameStrokeEl].filter(Boolean)
        alphaEls.forEach((el) => gsap.set(el, { autoAlpha: 1 }))
        fadeEls.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))

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
                    duration: MOTION_CONFIG.DURATION.OVERLAY,
                    ease: MOTION_CONFIG.EASING.OVERLAY,
                    backdropFilter: 'blur(10px)'

                }
            ))
        const staggerDelay = MOTION_CONFIG.STAGGER_DELAY.MD;
        tl.add(animateFadeUp(backToIndexEl, {
            y: MOTION_CONFIG.Y_OFFSET.LG,
        }), `<=${staggerDelay}`)
        tl.add(animateFadeUp(titleEl, {
            y: MOTION_CONFIG.Y_OFFSET.LG,
        }), `<=${staggerDelay}`)
            .add(animateFadeUp(descriptionEl, {
                y: MOTION_CONFIG.Y_OFFSET.LG,
            }),
                `<=${staggerDelay}`)
            .add(animateFadeUp(tagEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD,
            }), `<=${staggerDelay}`)
            .add(animateFadeUp(metadataEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD
            }), `<=${staggerDelay}`)
            .add(animateFadeUp(imageEls, {
                y: MOTION_CONFIG.Y_OFFSET.LG,
                stagger: MOTION_CONFIG.STAGGER.LG
            }), `<=${staggerDelay}`)
        if (nextProjectTitleEl) {
            tl.add(animateFadeUp(nextProjectTitleEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }), `<=${staggerDelay}`)
                .add(animateFadeUp(nextProjectNameColorEl, {
                    y: MOTION_CONFIG.Y_OFFSET.LG,
                }), `<=${staggerDelay}`)
                .add(animateFadeUp(nextProjectNameStrokeEl, {
                    y: MOTION_CONFIG.Y_OFFSET.LG,
                }), `<=${staggerDelay}`)
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
            if (!timelineRef.current || !containerRef.current) return

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

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[40] bg-black/60 text-white overflow-y-auto overflow-x-hidden w-screen pt-20 invisible"
            data-overlay-container
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
        >
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onClose()
                }}
                className="fixed top-24 right-8 z-50 text-white/80 hover:text-white text-sm flex items-center space-x-2"
                data-close-button
                aria-label="Close project and return to index"
            >
                <span aria-hidden="true">←</span> Return to Index
            </button>

            <div>
                <ProjectHero project={currentProject} tags={tags} metadata={metadata} />
                <ProjectImages images={currentProject.images} projectName={currentProject.name} />
                {Boolean(nextProject) && (
                    <NextProjectSection
                        project={nextProject}
                        title={nextProjectTitle}
                        onNextProject={onNextProject}
                        frameRef={frameRef}
                        isTransitioning={isTransitioning}
                    />
                )}
            </div>
        </div>
    )
}

interface ProjectHeroProps {
    project: Project;
    tags: { label: string; value: keyof typeof AVAILABILITIES_VALUE }[];
    metadata: { label: string; value: string | number }[];
}

const ProjectHero = ({ project, tags, metadata }: ProjectHeroProps) => (
    <div className="grid grid-cols-6 md:grid-cols-12 gap-4 px-8 pt-16">
        <div className="col-start-1 col-end-13 md:col-start-2 md:col-end-12">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-16">
                <div className="col-span-5 md:col-span-5" data-title>
                    <h1 id="project-title" className="text-6xl lg:text-7xl font-light text-white-400 leading-tight text-balance">
                        {project.name}
                    </h1>
                </div>

                <div className="col-span-6 md:col-span-5 space-y-8">
                    <div data-description>
                        <p className="text-sm text-white/70">{project.description}</p>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
                                    data-tag-item={tag.value}
                                >
                                    <span style={{ opacity: tag.value === AVAILABILITIES_OPTIONS.AVAILABLE ? 1 : 0.6 }}>
                                        {tag.label.toUpperCase()}: {AVAILABILITIES_VALUE[tag.value]}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-6 pt-8">
                        {metadata.map((meta) => (
                            <div key={meta.label} data-metadata-item>
                                <div
                                    // data-metadata-item={meta.label}
                                    className="text-xs text-white-400 mb-2 uppercase tracking-wider">
                                    {meta.label}
                                </div>
                                <div
                                    // data-metadata-item={String(meta.value ?? '')}
                                    className="text-sm text-white">
                                    {meta.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const ProjectImages = ({ images, projectName }: { images: string[]; projectName: string }) => (
    <section className="grid grid-cols-12 gap-4 px-8 mt-16 mb-32" aria-label={`${projectName} images`}>
        <div className="col-start-1 col-end-13">
            <div className="mb-8">
                <div className="overflow-hidden">
                    <img
                        data-image-item
                        src={images[0]}
                        alt={`${projectName} - Main artwork view`}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>

        <div className="col-start-1 col-end-13 md:col-start-2 md:col-end-12 grid grid-cols-2 gap-8">
            {images.slice(-2).map((src, index) => (
                <div key={src} className="aspect-[3/4] overflow-hidden">
                    <img
                        src={src}
                        alt={`${projectName} - Detail view ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    </section>
)

interface NextProjectSectionProps {
    project: Project;
    title: string;
    onNextProject: () => void;
    frameRef: React.RefObject<THREE.Group>;
    isTransitioning: boolean;
}

const NextProjectSection = ({
    project,
    title,
    onNextProject,
    frameRef,
    isTransitioning,
}: NextProjectSectionProps) => (
    <section
        className="relative h-screen flex items-center justify-center bg-black"
        aria-label={`Next project: ${title}`}
        data-next-project-container
    >
        <button
            onClick={onNextProject}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onNextProject()
                }
            }}
            className="absolute inset-0 w-full h-full z-10 cursor-pointer"
            aria-label={`View next project: ${title}`}
        >
            <span className="sr-only">View next project: {title}</span>
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div
                data-next-project-title
                className="absolute text-white text-xl font-light z-[2] pointer-events-none"
                style={{ top: 16 }}
            >
                NEXT PROJECT
            </div>
            <h2
                data-next-project-name-color
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8rem] lg:text-[12rem] font-light text-white leading-none mb-8 text-nowrap"
                style={{
                    color: 'white',
                    WebkitTextStroke: '1px white'
                }}
            >
                {title}
            </h2>
            <h2
                data-next-project-name-stroke
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8rem] lg:text-[12rem] font-light text-white leading-none mb-8 text-nowrap"
                style={{
                    color: 'transparent',
                    WebkitTextStroke: '1px white',
                    zIndex: 2
                }}
            >
                {title}
            </h2>
        </div>

        <div className="w-full h-screen z-[1]">
            <Canvas {...SHARED_CANVAS_PROPS}>
                <ambientLight intensity={0.2} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <pointLight position={[-5, 5, 5]} intensity={0.5} />
                <pointLight position={[5, -5, 5]} intensity={0.3} />
                <Environment
                    files="/webgl/hdri/potsdamer_platz_1k.hdr"
                // files="/webgl/hdri/studio_small_01_1k.hdr"
                // environmentIntensity={1.4}
                />
                <CustomFrame
                    index={0}
                    image={project.images[0]}
                    lookAtCamera={!isTransitioning}
                    ref={frameRef}
                    key={project.id}
                    position={[0, 0, -(CAROUSEL_RADIUS / 2)]}
                />
            </Canvas>
        </div>
    </section>
)