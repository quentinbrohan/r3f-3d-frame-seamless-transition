import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { gsap } from "gsap";

export const MOTION_CONFIG = {
  Y_OFFSET: {
    LG: 50,
    MD: 32,
  },
  STAGGER: {
    LG: 0.2,
    MD: 0.1,
  },
  STAGGER_DELAY: {
    SM: 0.1,
    MD: 0.15,
    LG: 0.6,
  },
  DURATION: {
    TRANSITION: 0.7,
    CAROUSEL: 0.8,
    FRAME_SCALE: 0.8,
    OVERLAY: 0.4,
    CTA: 0.3,
    DEFAULT: 0.5,
  },
  EASING: {
    DEFAULT: "power2.inOut",
    CAROUSEL: "power2.inOut",
    FRAME_SCALE: "cubic.inOut",
    OVERLAY: "power2.inOut",
    OUT: "power2.out",
  },
};

export const animatePageFadeIn = () => {
  return gsap.from(["canvas"], {
    opacity: 0,
    duration: MOTION_CONFIG.DURATION.TRANSITION,
    ease: MOTION_CONFIG.EASING.DEFAULT,
  });
};

export const animateNavToPageFadeOut = (
  router: AppRouterInstance,
  href: string
) => {
  const tl = gsap.timeline();

  tl.to(["main", "canvas"], {
    opacity: 0,
    duration: MOTION_CONFIG.DURATION.TRANSITION,
    ease: MOTION_CONFIG.EASING.DEFAULT,
  }).call(() => router.push(href));
};

export const animateFadeUp = (
  target: gsap.TweenTarget,
  options: Partial<gsap.TweenVars> = {}
) => {
  return gsap.from(target, {
    opacity: 0,
    y: MOTION_CONFIG.Y_OFFSET.MD,
    duration: MOTION_CONFIG.DURATION.TRANSITION,
    ...options,
  });
};

export const animateFadeUpOut = (
  target: gsap.TweenTarget,
  options: Partial<gsap.TweenVars> = {}
) => {
  return gsap.to(target, {
    opacity: 0,
    y: MOTION_CONFIG.Y_OFFSET.MD,
    duration: MOTION_CONFIG.DURATION.TRANSITION * 0.25,
    ...options,
  });
};
