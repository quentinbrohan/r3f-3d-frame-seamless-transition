import { useGLTF } from "@react-three/drei"

export function Model(props) {
  const { nodes, materials } = useGLTF("/frame.draco.glb")
  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Plane.geometry} material={nodes.Plane.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_50.geometry} material={nodes.Path_50.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_58.geometry} material={nodes.Path_58.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_6.geometry} material={nodes.Path_6.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_24.geometry} material={nodes.Path_24.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_33.geometry} material={nodes.Path_33.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_57.geometry} material={nodes.Path_57.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_61.geometry} material={nodes.Path_61.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_3.geometry} material={nodes.Path_3.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_5.geometry} material={nodes.Path_5.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_7.geometry} material={nodes.Path_7.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_4.geometry} material={nodes.Path_4.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_12.geometry} material={nodes.Path_12.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_14.geometry} material={nodes.Path_14.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_22.geometry} material={nodes.Path_22.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_23.geometry} material={nodes.Path_23.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_26.geometry} material={nodes.Path_26.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_27.geometry} material={nodes.Path_27.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_13.geometry} material={nodes.Path_13.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_28.geometry} material={nodes.Path_28.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_30.geometry} material={nodes.Path_30.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_31.geometry} material={nodes.Path_31.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_29.geometry} material={nodes.Path_29.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_32.geometry} material={nodes.Path_32.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_37.geometry} material={nodes.Path_37.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_48.geometry} material={nodes.Path_48.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_52.geometry} material={nodes.Path_52.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_53.geometry} material={nodes.Path_53.material} />
      <mesh castShadow receiveShadow geometry={nodes.Extrude.geometry} material={nodes.Extrude.material} />
      <mesh castShadow receiveShadow geometry={nodes.Path_39001.geometry} material={nodes.Path_39001.material} />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Path_16001_Path_16003.geometry}
        material={nodes.Path_16001_Path_16003.material}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Path_19001_Path_19003.geometry}
        material={nodes.Path_19001_Path_19003.material}
      />
    </group>
  )
}

useGLTF.preload("/frame.draco.glb")
