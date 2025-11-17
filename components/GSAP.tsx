'use client'

import { MOTION_CONFIG } from '@/lib/animations'
import gsap from 'gsap'


if (typeof window !== 'undefined') {
    gsap.defaults({
        ease: MOTION_CONFIG.EASING.OUT,
        duration: MOTION_CONFIG.DURATION.DEFAULT,
    })
}

export function GSAP() {

    return null
}
