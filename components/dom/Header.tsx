'use client';

import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { animateFadeUp, MOTION_CONFIG } from '@/lib/animations'
import { useStore } from '@/lib/store';

const Header = () => {
    const headerRef = useRef<HTMLElement>(null)
    const isLoaderLoaded = useStore((state) => state.isLoaderLoaded)
    const tlRef = useRef<gsap.core.Timeline | null>(null)


    useGSAP(() => {
        if (!headerRef.current || !isLoaderLoaded) return

        const container = gsap.utils.selector(headerRef)
        const logoEl = container('[data-header-logo]')
        const centerInfoEls = container('[data-header-center]')
        const navEls = container('[data-header-nav]')
        const contactEl = container('[data-header-contact]')

        const tl = gsap.timeline({ id: 'header', paused: true })

        tl.add(
            animateFadeUp(logoEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }), `<+=${MOTION_CONFIG.STAGGER_DELAY.LG}`
        )
        tl.add(
            animateFadeUp(centerInfoEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD,
            }),
            `<+=${MOTION_CONFIG.STAGGER_DELAY.SM}`
        )
        tl.add(
            animateFadeUp(navEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD,
            }),
            `<+=${MOTION_CONFIG.STAGGER_DELAY.SM}`
        )
        tl.add(
            animateFadeUp(contactEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }),
            `<+=${MOTION_CONFIG.STAGGER_DELAY.SM}`
        )

        tlRef.current = tl;
    }, {
        scope: headerRef,
        dependencies: [isLoaderLoaded]
    })

    useEffect(() => {
        if (isLoaderLoaded && tlRef.current)
            tlRef.current.play()
    }, [isLoaderLoaded])


    return (
        <nav
            ref={headerRef}
            className="fixed top-0 left-0 right-0 z-50 px-8 mt-6 sm:px-[4] sm:mt-4 grid grid-cols-12 w-full items-center text-white"
            aria-label="Main navigation"
        >
            {/* Left side */}
            <div
                className="col-start-1 col-end-3 text-white text-sm"
                data-header-logo
            >
                <span aria-label="Abnalem">Abnalem</span>
            </div>

            {/* Center elements */}
            <div
                className="col-start-3 col-end-6 flex items-center space-x-8 text-sm text-white/80 invisible md:visible"
                aria-label="Contact information"
            >
                <time
                    // dateTime={new Date().toISOString()}
                    data-header-center>
                    04:21 PM, CET
                </time>
                {/* <a
                    href="mailto:hello@abnalem.com"
                    className="hover:text-white transition-colors"
                    data-header-center
                    aria-label="Send email to hello@abnalem.com"
                >
                    hello@abnalem.com
                </a> */}
                <a
                    href="https://www.instagram.com/abn.alem/"
                    className="hover:text-white transition-colors"
                    data-header-center
                    aria-label="Instagram profile: @abn.alem"
                    target='_blank'
                    rel="noopener noreferrer"
                >
                    @abn.alem
                </a>
            </div>

            {/* Navigation */}
            <div
                className="col-start-9 col-end-12 flex items-center space-x-1 text-sm text-white/80 invisible md:visible"
                role="navigation"
                aria-label="Site navigation"
            >
                <button
                    className="hover:text-white transition-colors"
                    data-header-nav
                    aria-label="About page"
                >
                    About,
                </button>
                <button
                    className="hover:text-white transition-colors"
                    data-header-nav
                    aria-label="Shop page"
                >
                    Shop
                </button>
            </div>

            {/* Right side navigation */}
            <div
                className="col-start-12 col-end-13 flex items-center space-x-6 text-sm text-white/80 justify-end"
            >
                <button
                    className="hover:text-white transition-colors"
                    data-header-contact
                    aria-label="Contact page"
                >
                    Contact
                </button>
            </div>
        </nav>
    )
}
export default Header;
