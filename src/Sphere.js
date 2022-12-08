import { COLOR_HEX } from "./constants/shapedata";

export const Sphere = ({ position, blockID, color }) => (
  <mesh position={[...position]}>
    <sphereGeometry attach="geometry" />
    <meshLambertMaterial
      attach="material"
      color={COLOR_HEX[color]}
      transparent={blockID === 0}
      opacity={blockID === 0 ? 0.5 : 1}
    />
  </mesh>
)
