import React, { useEffect, useRef, useState } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial, useTexture, CubeCamera, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Project, PROJECTS } from "@/app/data";
import { CustomFrame } from "./CustomFrame";
import { ProjectContent } from "./ProjectContent";

// === Shader material for texture blending ===
const TransitionMaterial = shaderMaterial(
    {
        texture1: null,
        texture2: null,
        transition: 0,
    },
    `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
  `,
    `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float transition;
  varying vec2 vUv;

  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec4 color1 = texture2D(texture1, uv);
    vec4 color2 = texture2D(texture2, uv);
    vec4 blended = mix(color1, color2, transition);
    blended.rgb *= 0.6; // darken for reflection tone
    gl_FragColor = blended;
  }
`
);
extend({ TransitionMaterial });

const projectsMainImages = PROJECTS.map((p) => p.images[0]);

const MainScene: React.FC = () => {
    const textures = useTexture(projectsMainImages);
    const { camera } = useThree();

    useEffect(() => {
        textures.forEach((t) => {
            t.flipY = false;
            t.colorSpace = THREE.SRGBColorSpace;
            t.needsUpdate = true;
        });
    }, [textures]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentProject, setCurrentProject] = useState(PROJECTS[0]);
    const [showContent, setShowContent] = useState(false);

    const meshRefFront = useRef<any>();
    const meshRefBack = useRef<any>();
    const groupRef = useRef<any>();

    const numFrames = projectsMainImages.length;
    const radius = 5;
    const initialRotationOffset = Math.PI;

    const transitionRef = useRef(0);
    const targetRotation = useRef(initialRotationOffset);
    const currentIndexRef = useRef(0);
    const nextIndexRef = useRef(1);

    camera.position.set(0, 0, 0);

    function setTargetRotationForIndex(nextIndex: number, direction = 1) {
        const step = (2 * Math.PI) / numFrames;
        const current = targetRotation.current;

        const desired = (nextIndex * step + initialRotationOffset); // Remove the negative

        let delta = desired - current;
        delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

        // Standard direction enforcement (now intuitive)
        if (direction > 0 && delta < 0) delta += 2 * Math.PI;
        if (direction < 0 && delta > 0) delta -= 2 * Math.PI;

        gsap.to(targetRotation, {
            current: current + delta,
            duration: 1,
            ease: "power2.inOut",
        });
    }

    const animateTransition = (next: number, direction: 1 | -1) => {
        const current = currentIndexRef.current;

        console.log({ textures, current, next });


        if (meshRefFront.current && meshRefBack.current) {
            meshRefFront.current.uniforms.texture1.value = textures[current];
            meshRefFront.current.uniforms.texture2.value = textures[next];
            meshRefFront.current.uniforms.transition.value = 0;

            meshRefBack.current.uniforms.texture1.value = textures[current];
            meshRefBack.current.uniforms.texture2.value = textures[next];
            meshRefBack.current.uniforms.transition.value = 0;
        }

        setTargetRotationForIndex(next, direction);

        gsap.to(transitionRef, {
            current: 1,
            duration: 0.8,
            ease: "power2.inOut",
            onUpdate: () => {
                const t = transitionRef.current;
                if (meshRefFront.current && meshRefBack.current) {
                    meshRefFront.current.uniforms.transition.value = t;
                    meshRefBack.current.uniforms.transition.value = t;
                }
            },
            onComplete: () => {
                // Commit final state
                currentIndexRef.current = next;
                transitionRef.current = 0;

                // Reset both uniforms to the new "current" texture
                if (meshRefFront.current && meshRefBack.current) {
                    meshRefFront.current.uniforms.texture1.value = textures[next];
                    meshRefFront.current.uniforms.texture2.value = textures[next];
                    meshRefFront.current.uniforms.transition.value = 0;

                    meshRefBack.current.uniforms.texture1.value = textures[next];
                    meshRefBack.current.uniforms.texture2.value = textures[next];
                    meshRefBack.current.uniforms.transition.value = 0;
                }

                setCurrentIndex(next);
                setCurrentProject(PROJECTS[next]);
            },
        });
    };



    const handleNext = () => {
        const next = (currentIndexRef.current + 1) % textures.length;
        const nextP = PROJECTS[next]
        console.log({ next, nextP });

        animateTransition(next, 1);
    };

    const handlePrev = () => {
        const prev = (currentIndexRef.current - 1 + textures.length) % textures.length;
        animateTransition(prev, -1);
    };

    const hasIntersected = useRef(false);

    const handleStartMovement = () => {
        hasIntersected.current = false;
        gsap.to(camera.position, {
            z: -3, // TODO: go to intersect instead + stop camera rig + stop float + dim texture
            // z: -2.75, // TODO: go to intersect instead + stop camera rig + stop float + dim texture
            duration: 0.8,
            ease: "power3.out",
            onUpdate: () => {
                if (!hasIntersected.current && camera.position.z <= -2.75) {
                    hasIntersected.current = true;
                    setShowContent(true);
                }
            },
        });
    };

    const handleClose = () => {
        hasIntersected.current = false;

        // setShowContent(false)

        gsap.to(camera.position, {
            z: 0,
            duration: 1*3, // TODO: debug only
            ease: "power3.inOut",
            overwrite: true,
            onUpdate: () => {
                if (!hasIntersected.current && camera.position.z <= -2.75) {
                    hasIntersected.current = true;
                    setShowContent(false);
                }
            },
            onComplete: () => {
                hasIntersected.current = false
            }
        });

        // setTimeout(() => {
        //     // setShowContent(false);
        // }, 300);
    };

    useEffect(() => {
        if (!meshRefFront.current || !meshRefBack.current || textures.length === 0) return;

        const initial = 0; // start from first project
        const next = (initial + 1) % textures.length;

        meshRefFront.current.uniforms.texture1.value = textures[initial];
        meshRefFront.current.uniforms.texture2.value = textures[next];
        meshRefFront.current.uniforms.transition.value = 0;

        meshRefBack.current.uniforms.texture1.value = textures[initial];
        meshRefBack.current.uniforms.texture2.value = textures[next];
        meshRefBack.current.uniforms.transition.value = 0;
    }, [textures]);

    const handleSelectProject = (index: number) => {
        const total = textures.length;
        const current = currentIndexRef.current;
        const diff = index - current;
        const shortest = ((diff + total / 2) % total) - total / 2;

        const direction = shortest > 0 ? 1 : -1; // Remove the inversion

        animateTransition(index, direction);
    };


    useFrame(() => {
        if (!groupRef.current) return;

        // Smoothly ease group rotation toward target
        const rot = groupRef.current.rotation.y;
        groupRef.current.rotation.y += (targetRotation.current - rot) * 0.08;
    });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            <mesh position={[0, 0, -5]}>
                <planeGeometry args={[20, 20]} />
                <transitionMaterial ref={meshRefBack} toneMapped={false} />
            </mesh>

            <mesh position={[0, 0, 5]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[20, 20]} />
                <transitionMaterial ref={meshRefFront} toneMapped={false} />
            </mesh>

            <CubeCamera frames={Infinity} resolution={256} near={0.1} far={1000} position={[0, 0, 2]}>
                {(texture) => (
                    <group ref={groupRef}>
                        {projectsMainImages.map((img, i) => {
                            const angle = -(i / numFrames) * Math.PI * 2;
                            const x = Math.sin(angle) * radius;
                            const z = Math.cos(angle) * radius;
                            const rotationY = angle + Math.PI;

                            return (
                                <CustomFrame
                                    key={i}
                                    image={img}
                                    position={[x, 0, z]}
                                    rotation={[0, rotationY, 0]}
                                    envMap={texture}
                                    onClick={handleStartMovement}
                                    isFollowingCursor={!showContent}

                                />
                            );
                        })}
                    </group>
                )}
            </CubeCamera>

            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <pointLight position={[0, 5, -5]} intensity={0.8} />

            {currentProject && (
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
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <ProjectContent
                            isVisible={showContent}
                            onClose={handleClose}
                            currentProject={currentProject}
                        />

                        <div className="grid grid-cols-12 px-8 w-full z-100 pt-32">
                            <ul className="col-start-9 col-end-13 text-white">
                                {PROJECTS.map((project, i) => (
                                    <li
                                        key={project.name}
                                    >
                                        <button
                                            className={`text-2xl text-left ${currentIndex === i ? 'opacity-100' : 'opacity-60'} transition hover:opacity-100`}
                                            onClick={() => handleSelectProject(i)}
                                        >

                                            {project.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                </Html>
            )}
        </>
    );
};

export default MainScene;
