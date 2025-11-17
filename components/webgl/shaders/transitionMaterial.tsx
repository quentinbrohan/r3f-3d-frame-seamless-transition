import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

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

declare module '@react-three/fiber' {
  interface ThreeElements {
    transitionMaterial: typeof TransitionMaterial
  }
}