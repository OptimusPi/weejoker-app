'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Sparkles, Float } from '@react-three/drei';
import { Suspense, useRef } from 'react';

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000, 128, 128]} />
      <meshStandardMaterial color="#808080" displacementScale={50} />
    </mesh>
  );
}

function Vehicle() {
  const vehicleRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (vehicleRef.current) {
      const t = clock.getElapsedTime();
      vehicleRef.current.position.z = (t * -5) % 200;
    }
  });

  return (
    <Float
      speed={1.4}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <group ref={vehicleRef}>
        {/* Chassis */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[2.2, 0.6, 4.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Body */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[2, 1, 4]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>

        {/* Wheels */}
        <mesh castShadow position={[-1.2, 0.5, 1.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh castShadow position={[1.2, 0.5, 1.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh castShadow position={[-1.2, 0.5, -1.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh castShadow position={[1.2, 0.5, -1.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        <pointLight color="#ff0000" intensity={10} distance={5} position={[0, 1, 0]} />
      </group>
    </Float>
  );
}

export default function Scene() {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.1} />
      <directionalLight
        castShadow
        position={[10, 20, 15]}
        intensity={0.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Sky />
      <Stars />
      <Sparkles count={1000} scale={15} size={3} speed={0.2} color="#ff69b4" />
      <Suspense fallback={null}>
        <Ground />
        <Vehicle />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
