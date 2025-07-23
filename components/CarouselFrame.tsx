import { useEffect, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { CustomFrame } from "./CustomFrame"

function CarouselFrame({ projectsMainImages,
    // targetRotation, setTargetRotation,
    onNext,
    envMap,
    onPrev,
    transition,
    setTransition,
}) {
    const numFrames = projectsMainImages.length
    const radius = 2.5 * 2

    const initialRotationOffset = Math.PI // 180°

    // Start with targetRotation so frame 0 is in front
    const [targetRotation, setTargetRotation] = useState(-initialRotationOffset)
    const groupRef = useRef()

    // const handlePrev = () => {
    //     setTargetRotation(prev => prev - (Math.PI) / numFrames)
    // }

    // const handleNext = () => {
    //     setTargetRotation(prev => prev + (Math.PI) / numFrames)
    //     onNext()
    // }
    const handleNext = () => {
        // TODO:FIXME: wrong going L to R the projects are in the wrong order
        setTargetRotation(prev => prev + (Math.PI) / numFrames)
        onNext?.()          // call parent callback if needed
        // start transition
        setTransition(0)    // reset transition to 0 → will animate to 1 in useFrame
    }

    const handlePrev = () => {
        setTargetRotation(prev => prev - (Math.PI) / numFrames)
        onPrev?.()
        setTransition(0)
    }

    // Center camera at origin
    const { camera } = useThree()
    camera.position.set(0, 0, 0)

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = targetRotation;
        }
    }, []); // run once on mount

    useFrame((state, frameDelta) => {
        if (!groupRef.current) return;


        const currentY = groupRef.current.rotation.y;
        const delta = targetRotation - currentY;

        // Smooth rotation
        groupRef.current.rotation.y += delta * 0.05;

        const isRotating = Math.abs(delta) > 0.001;
        const targetZ = isRotating
            ? -0.5 - 0.5 * Math.min(Math.abs(delta) * 20, 1)
            : 0;

        // Only increase transition while rotating
        // FIXME:
        // if (isRotating && Math.abs(frameDelta) > 0.001) {
        if (isRotating && Math.abs(frameDelta) > 0.001) {
            setTransition((prev) => Math.min(prev + frameDelta / 0.5, 1));
        } else {
            // Reset transition when rotation ends
            setTransition(0);
        }


        // Smooth camera zoom interpolation (lerp)
        // camera.position.z += (targetZ - camera.position.z) * 0.1;
    });



    return (
        <>
            <group ref={groupRef}>
                {projectsMainImages.map((img, i) => {
                    const angle = (i / numFrames) * Math.PI * 2
                    const x = Math.sin(angle) * radius
                    const z = Math.cos(angle) * radius
                    const y = 0

                    // Each frame faces inward to camera
                    const rotationY = angle + Math.PI

                    return (
                        <CustomFrame
                            key={i}
                            image={img}
                            position={[x, y, z]}
                            rotation={[0, rotationY, 0]}
                            onClick={handleNext}
                            envMap={envMap}
                        />
                    )
                })}
            </group>
        </>
    )
}

export default CarouselFrame
