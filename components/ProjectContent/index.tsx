import { Project } from '@/app/data'
import { useIsMobile } from '@/hooks/use-mobile'
import { animateFadeUp, MOTION_CONFIG } from '@/lib/animations'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from "three"
import { NextProjectSection } from './components/NextProjectSection'
import { ProjectHero } from './components/ProjectHero'
import { ProjectImages } from './components/ProjectImages'
import { AVAILABILITIES_OPTIONS, PROJECT_CATEGORY_LABEL } from './constants'
import { useEscapeKey } from './hooks/useEscapeKey'
import { useNextProject } from './hooks/useNextProject'
import { useProjectTransition } from './hooks/useProjectTransition'

interface CloseButtonProps {
    onClose: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClose }) => {
    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
            }}
            className="text-white/80 hover:text-white text-xs uppercase flex items-center gap-2 space-x-2 self-end px-4 sm:px-8 mb-6 sm:mb-4"
            data-close-button
            aria-label="Close project and return to index"
        >
            <span aria-hidden="true">←</span> Return to Index
        </button>
    )
}

const buildTagsAndMetadata = (currentProject: Project) => {

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
        { label: 'CATEGORY', value: PROJECT_CATEGORY_LABEL[currentProject.category] },
        { label: 'SIZE', value: `${currentProject.dimensions.width}x${currentProject.dimensions.height} cm` },
        { label: 'YEAR', value: currentProject.endDate ? new Date(currentProject.endDate).getFullYear() : '' },
    ]

    return { tags, metadata }
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
    const isMobile = useIsMobile()

    const { nextProject, nextProjectTitle } = useNextProject(currentProject.id)
    const { isTransitioning, triggerTransition } = useProjectTransition({
        containerRef,
        frameRef,
        isMobile,
        onNext
    })

    const { tags, metadata } = useMemo(() => buildTagsAndMetadata(currentProject), [currentProject])

    // BUILD THE TIMELINE
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
        alphaEls.forEach((el) => gsap.set(el, { opacity: 1, visibility: 'visible' }))
        fadeEls.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))

        tl.add(
            gsap.fromTo(
                containerRef.current,
                {
                    visibility: 'hidden',
                    opacity: 0,
                    backdropFilter: 'blur(0px)',
                },
                {
                    visibility: 'visible',
                    opacity: 1,
                    duration: MOTION_CONFIG.DURATION.OVERLAY,
                    ease: MOTION_CONFIG.EASING.OVERLAY,
                    backdropFilter: 'blur(10px)'
                }
            ))

        const staggerDelay = MOTION_CONFIG.STAGGER_DELAY.MD
        tl.add(animateFadeUp(backToIndexEl, {
            y: MOTION_CONFIG.Y_OFFSET.LG,
        }), `<=${staggerDelay}`)
        tl.add(animateFadeUp(titleEl, {
            y: MOTION_CONFIG.Y_OFFSET.LG,
        }), `<=${staggerDelay}`)
            .add(animateFadeUp(descriptionEl, {
                y: MOTION_CONFIG.Y_OFFSET.LG,
            }), `<=${staggerDelay}`)
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

        timelineRef.current = tl
    }, {
        scope: containerRef,
        dependencies: [isVisible, currentProject]
    })

    // TRIGGER THE TIMELINE
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

    useEscapeKey(onClose, isVisible)

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-40 min-h-[100svh] h-[100vh] max-h-[100svh] bg-black/60 text-white overflow-y-auto overflow-x-hidden w-screen pt-20 invisible flex flex-col"
            data-overlay-container
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
        >
            <CloseButton onClose={onClose} />
            <div>
                <ProjectHero project={currentProject} tags={tags} metadata={metadata} />
                <ProjectImages images={currentProject.images} projectName={currentProject.name} />
                {Boolean(nextProject) && isVisible && (
                    <NextProjectSection
                        project={nextProject}
                        title={nextProjectTitle}
                        onNextProject={triggerTransition}
                        frameRef={frameRef}
                        isTransitioning={isTransitioning}
                        isMobile={isMobile}
                    />
                )}
            </div>
        </div>
    )
}