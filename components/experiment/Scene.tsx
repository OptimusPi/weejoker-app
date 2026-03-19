"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { Player } from "./Player";
import { MobileControls } from "./MobileControls";
import { OtherPlayers } from "./OtherPlayers";

export function Scene() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Canvas shadows camera={{ fov: 65, near: 0.1, far: 1000 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="sunset" />
          <ambientLight intensity={0.3} />
          <directionalLight
            castShadow
            position={[10, 20, 10]}
            intensity={1.5}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <Physics debug={false} timeStep="vary">
            <Player />

            {/* Ground plane */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color="#4a7c59" />
            </mesh>

            {/* Some boxes to interact with */}
            {[[-3, 0.5, -5], [4, 0.5, -8], [-6, 0.5, -3], [2, 0.5, -12]].map(
              ([x, y, z], i) => (
                <mesh key={i} castShadow position={[x, y, z]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color={`hsl(${i * 90}, 60%, 50%)`} />
                </mesh>
              )
            )}
          </Physics>

          <OtherPlayers />
        </Suspense>
      </Canvas>

      <MobileControls />
    </div>
  );
}
