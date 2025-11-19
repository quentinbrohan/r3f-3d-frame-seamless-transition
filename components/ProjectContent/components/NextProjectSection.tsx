import { Project } from '@/app/data';
import { SHARED_CANVAS_PROPS } from '@/app/page';
import { cn } from '@/lib/utils';
import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { CustomFrame } from '../../MainScene/components/CustomFrame';
import { CAROUSEL_RADIUS } from '../../MainScene/hooks/useCarouselState';

interface NextProjectSectionProps {
    project: Project;
    title: string;
    onNextProject: () => void;
    frameRef: React.RefObject<THREE.Group>;
    isTransitioning: boolean;
    isMobile: boolean;
}
export const NextProjectSection = ({
    project, title, onNextProject, frameRef, isTransitioning, isMobile,
}: NextProjectSectionProps) => (
    <section
        className={cn(
            "relative flex items-center justify-center bg-black text-center px-4",
            "h-dvh"
        )}
        aria-label={`Next project: ${title}`}
        data-next-project-container
    >
        <button
            onClick={onNextProject}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNextProject();
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
                className="absolute text-white text-sm sm:text-xl font-light z-[2] pointer-events-none"
                style={{ top: 16 }}
            >
                NEXT PROJECT
            </div>
            <h2
                data-next-project-name-color
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-light text-white leading-none"
                style={{
                    fontSize: 'clamp(4rem, 8vw, 12rem)',
                    color: 'white',
                    WebkitTextStroke: '1px white',
                    zIndex: 1
                }}
            >
                {title}
            </h2>
            <h2
                data-next-project-name-stroke
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-light text-white leading-none"
                style={{
                    fontSize: 'clamp(4rem, 8vw, 12rem)',
                    color: 'transparent',
                    WebkitTextStroke: '1px white',
                    zIndex: 2
                }}
            >
                {title}
            </h2>
        </div>

        <div className={cn("w-full z-[1]", "h-full")}>
            <Suspense fallback={null}>
                <Canvas {...SHARED_CANVAS_PROPS} camera={{ position: [0, 0, 0.5] }}>
                    <group name="Next Project Lights">
                        <ambientLight intensity={0.2} />
                        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                        <pointLight position={[-5, 5, 5]} intensity={0.5} />
                        <pointLight position={[5, -5, 5]} intensity={0.3} />
                    </group>

                    <Environment
                        files="/webgl/hdri/potsdamer_platz_1k.hdr" />
                    <CustomFrame
                        index={0}
                        image={project.images[0]}
                        lookAtCamera={!isTransitioning}
                        ref={frameRef}
                        key={project.id}
                        position={[0, 0, -(CAROUSEL_RADIUS / 2)]} />
                </Canvas>
            </Suspense>
        </div>
    </section>
);
