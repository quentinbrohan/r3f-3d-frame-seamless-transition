'use client';

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { animateFadeUp, MOTION_CONFIG } from '@/lib/animations'

const Header = () => {
    const headerRef = useRef<HTMLElement>(null)

    useGSAP(() => {
        if (!headerRef.current) return

        const container = gsap.utils.selector(headerRef)
        const logoEl = container('[data-header-logo]')
        const centerInfoEls = container('[data-header-center]')
        const navEls = container('[data-header-nav]')
        const contactEl = container('[data-header-contact]')

        const tl = gsap.timeline()

        tl.add(
            animateFadeUp(logoEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            })
        )
        tl.add(
            animateFadeUp(centerInfoEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD,
            }),
            '<+=0.1'
        )
        tl.add(
            animateFadeUp(navEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD,
            }),
            '<+=0.1'
        )
        tl.add(
            animateFadeUp(contactEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }),
            '<+=0.1'
        )
    }, {
        scope: headerRef
    })

    return (
        <nav
            ref={headerRef}
            className="fixed top-0 left-0 right-0 z-50 px-8 py-6 grid grid-cols-12 w-full items-center text-white"
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
                <a
                    href="mailto:hello@abnalem.com"
                    className="hover:text-white transition-colors"
                    data-header-center
                    aria-label="Send email to hello@abnalem.com"
                >
                    hello@abnalem.com
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
