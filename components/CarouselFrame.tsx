import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { CustomFrame } from "./CustomFrame"

function CarouselFrame({ projectsMainImages,
    // targetRotation, setTargetRotation,
    onNext,

}) {
    const numFrames = projectsMainImages.length
    const radius = 2.5 * 2

    const initialRotationOffset = Math.PI // 180°

    // Start with targetRotation so frame 0 is in front
    const [targetRotation, setTargetRotation] = useState(-initialRotationOffset)
    const groupRef = useRef()

    const handlePrev = () => {
        setTargetRotation(prev => prev - (Math.PI) / numFrames)
    }

    const handleNext = () => {
        setTargetRotation(prev => prev + (Math.PI) / numFrames)
        onNext()
    }

    // Center camera at origin
    const { camera } = useThree()
    camera.position.set(0, 0, 0)

    useFrame(() => {
        if (!groupRef.current) return
        const currentY = groupRef.current.rotation.y
        // Animate rotation smoothly, but add initial offset for correct start position
        // groupRef.current.rotation.y += (targetRotation - currentY) * 0.1
        groupRef.current.rotation.y += (targetRotation - currentY) * 0.05
    })

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
                        />
                    )
                })}
            </group>
        </>
    )
}

export default CarouselFrame
