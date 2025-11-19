'use client'

import { Project, PROJECTS } from "@/app/data";
import { ProjectContent } from "@/components/ProjectContent";
import { animateFadeUp, MOTION_CONFIG } from "@/lib/animations";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import { Html } from "@react-three/drei";
import gsap from 'gsap';
import { ButtonHTMLAttributes, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

interface InterfaceOverlayProps {
  currentIndex: number;
  currentProject: Project | null;
  showContent: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectProject: (index: number) => void;
  onClose: () => void;
  onNextFromOverlay: () => void;
  onProjectClick: () => void;
  isMobile: boolean;
}

// TODO: move to dom
export const InterfaceOverlay: React.FC<InterfaceOverlayProps> = ({
  currentIndex,
  currentProject,
  showContent,
  onPrev,
  onNext,
  onSelectProject,
  onClose,
  onNextFromOverlay,
  onProjectClick,
  isMobile,
}) => {
  if (!currentProject) return null;

  return (
    <Html
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        zIndex: 10,
      }}
    >
      <>
        {
          // isMobile ? (
          //     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4">
          //         <NavigationButton
          //             direction="prev"
          //             onClick={onPrev}
          //             isInline
          //             className="backdrop-blur-md border border-white/20 bg-white/10"
          //         />
          //         <NavigationButton
          //             direction="next"
          //             onClick={onNext}
          //             isInline
          //             className="backdrop-blur-md border border-white/20 bg-white/10"
          //         />
          //     </div>
          // ) :
          !isMobile && (
            <>
              <NavigationButton direction="prev" onClick={onPrev} />
              <NavigationButton direction="next" onClick={onNext} />
            </>
          )
        }

        <ProjectContent
          isVisible={showContent}
          onClose={onClose}
          currentProject={currentProject}
          onNext={onNextFromOverlay}
        />

        <ProjectList
          currentIndex={currentIndex}
          onSelectProject={onSelectProject}
          isMobile={isMobile}
          onPrev={onPrev}
          onNext={onNext}
          onOpenProject={onProjectClick}
        />
      </>
    </Html>
  );
};

const NAVIGATION_BUTTON_BASE =
  "z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition";
const NAVIGATION_BUTTON_DESKTOP_POSITION = "absolute top-1/2 -translate-y-1/2";

const NavigationButton = ({
  direction,
  onClick,
  isInline = false,
  className,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  isInline?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      NAVIGATION_BUTTON_BASE,
      !isInline && NAVIGATION_BUTTON_DESKTOP_POSITION,
      !isInline && (direction === "prev" ? "left-4" : "right-4"),
      isInline && "relative",
      className
    )}
    aria-label={direction === "prev" ? "Previous project" : "Next project"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  </button>
);

const ViewProjectButton: React.FC<Partial<ButtonHTMLAttributes<any>>> = ({
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      data-view-project-cta
      className={cn(
        "p-4 px-4 w-full border border-white/20 bg-black/60 overflow-hidden",
        className
      )}
    >
      <span
        data-view-project-cta-text
        className={cn("flex justify-between uppercase text-xs gap-2 w-full")}
      >
        VIEW PROJECT
        <span aria-hidden="true">→</span>
      </span>
    </button>
  );
};

const ProjectList = ({
  currentIndex,
  onSelectProject,
  onNext,
  onPrev,
  onOpenProject,
  isMobile,
}: {
  currentIndex: number;
  onSelectProject: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenProject: () => void;
  isMobile: boolean;
}) => {
  const containerDesktopRef = useRef<HTMLDivElement>(null);
  const projectContainerMobileRef = useRef<HTMLDivElement>(null);

  const [isLoaderLoaded, isListFrameHovered] = useStore(
    useShallow((state) => [state.isLoaderLoaded, state.isListFrameHovered])
  );
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (isMobile && !projectContainerMobileRef.current) return;
      if (!isMobile && !containerDesktopRef.current) return;

      let itemEls: HTMLElement[] = [];
      let currentProjectNameEl: HTMLElement[] = [];
      let viewProjectEl: HTMLElement[] = [];

      if (isMobile) {
        const containerMobile = gsap.utils.selector(projectContainerMobileRef);

        currentProjectNameEl = containerMobile("[data-current-project-name]");
        viewProjectEl = containerMobile("[data-view-project-cta]");
        itemEls = containerMobile("li");
      } else {
        const container = gsap.utils.selector(containerDesktopRef);
        itemEls = container("li");
        currentProjectNameEl = container("[data-current-project-name]");
        viewProjectEl = container("[data-view-project-cta]");
      }

      if (itemEls.length === 0) return;

      const tl = gsap.timeline({ id: "project-list", paused: true });

      if (isMobile) {
        tl.add(
          animateFadeUp(currentProjectNameEl, {
            y: MOTION_CONFIG.Y_OFFSET.MD,
          }),
          `<+=${MOTION_CONFIG.STAGGER_DELAY.LG}`
        );
        tl.add(
          animateFadeUp(viewProjectEl, {
            y: MOTION_CONFIG.Y_OFFSET.MD,
          }),
          `<+=${MOTION_CONFIG.STAGGER_DELAY.MD}`
        );
      }
      tl.add(
        animateFadeUp(itemEls, {
          y: MOTION_CONFIG.Y_OFFSET.MD,
          stagger: MOTION_CONFIG.STAGGER.MD,
        }),
        `<+=${MOTION_CONFIG.STAGGER_DELAY.LG}`
      );

      tlRef.current = tl;
    },
    {
      dependencies: [isLoaderLoaded, isMobile],
    }
  );

  useEffect(() => {
    if (isLoaderLoaded && tlRef.current) tlRef.current.play();
  }, [isLoaderLoaded, isMobile]);

  useGSAP(() => {
    if (!isMobile || !projectContainerMobileRef.current) return;

    const container = gsap.utils.selector(projectContainerMobileRef);
    const currentProjectNameEl = container("[data-current-project-name]");
    const viewProjectEl = container("[data-view-project-cta-text]");

    if (!currentProjectNameEl.length || !viewProjectEl.length) return;

    const tl = gsap.timeline();

    tl.add(
      animateFadeUp(currentProjectNameEl, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
        duration: MOTION_CONFIG.DURATION.CTA,
      })
    );
    tl.add(
      animateFadeUp(viewProjectEl, {
        y: MOTION_CONFIG.Y_OFFSET.MD,
        duration: MOTION_CONFIG.DURATION.CTA,
      }),
      `<${MOTION_CONFIG.STAGGER_DELAY.MD}`
    );
  }, [currentIndex, isMobile]);

  const currentProject = PROJECTS[currentIndex];

  // const viewProjectCtaRef = useRef<HTMLButtonElement>(null)
  // const tl = useRef<gsap.core.Timeline | null>(null)

  // useGSAP(() => {
  //     tl.current = gsap.timeline({ paused: true })
  //         .fromTo(
  //             viewProjectCtaRef.current,
  //             { opacity: 0, y: MOTION_CONFIG.Y_OFFSET.MD },
  //             { opacity: 1, y: 0, duration: MOTION_CONFIG.DURATION.CTA }
  //         )
  // }, [isMobile])

  // useEffect(() => {
  //     if (!tl.current) return

  //     if (isListFrameHovered) {
  //         tl.current.play()
  //     } else {
  //         tl.current.reverse()
  //     }
  // }, [isListFrameHovered])

  return (
    <>
      <>
        {isMobile && (
          <div
            ref={projectContainerMobileRef}
            className={cn(
              "fixed w-full px-4 mb-2 bottom-6 text-left text-2xl leading-none",
              "text-white"
            )}
            aria-label={`Open ${currentProject.name} project`}
          >
            <p
              className="mb-4 text-left text-2xl leading-none"
              data-current-project-name
            >
              {currentProject.name}
            </p>
            <ViewProjectButton
              onClick={(e) => {
                e.stopPropagation();
                onOpenProject();
              }}
              className="mb-4"
            />
            <nav className={cn("w-full")} aria-label="Project list">
              <ul className="flex gap-3 items-center text-white" role="list">
                {/* <li className="flex-2">
                            <NavigationButton
                                direction="prev"
                                onClick={onPrev}
                                isInline
                                className="backdrop-blur-md border border-white/20 bg-white/10"
                            />
                        </li> */}
                {PROJECTS.map((project, i) => (
                  <li key={project.name} className="flex-1">
                    <button
                      className={cn("w-full min-h-10 flex items-center")}
                      onClick={() => onSelectProject(i)}
                      aria-label={`View ${project.name} project`}
                      aria-current={currentIndex === i ? "page" : undefined}
                    >
                      <span
                        className={cn(
                          "w-full h-4 rounded-sm border transition",
                          currentIndex === i
                            ? "bg-black/100 border-white/60"
                            : "bg-black/25 border-white/20"
                        )}
                      ></span>
                    </button>
                  </li>
                ))}
                {/* <li className="flex-2">
                            <NavigationButton
                                direction="next"
                                onClick={onNext}
                                isInline
                                className="backdrop-blur-md border border-white/20 bg-white/10"
                            />
                        </li> */}
              </ul>
            </nav>
          </div>
        )}
      </>

      {!isMobile && (
        <nav
          ref={containerDesktopRef}
          className={cn("grid grid-cols-12 px-8 w-full z-100 pt-32")}
          aria-label="Project list"
        >
          <ul className="col-start-9 col-end-13 text-white" role="list">
            {PROJECTS.map((project, i) => (
              <li key={project.name} className="mb-0.5 last:mb-0">
                <button
                  className={`text-2xl text-left ${currentIndex === i ? "opacity-100" : "opacity-60"
                    } transition hover:opacity-100 leading-none`}
                  onClick={() => onSelectProject(i)}
                  aria-label={`View ${project.name} project`}
                  aria-current={currentIndex === i ? "page" : undefined}
                >
                  {project.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {/* {!isMobile && <ViewProjectButton
                ref={viewProjectCtaRef}
                className={cn("opacity-0 z-100 absolute bottom-20 left-1/2 -translate-x-[50%] w-fit text-2xl text-white",
                )}
            />} */}
    </>
  );
};
