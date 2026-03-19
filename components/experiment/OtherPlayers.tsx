"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerData {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  lastSeen: number;
}

const SYNC_INTERVAL = 100; // ms
const STALE_THRESHOLD = 10_000; // Remove players not seen in 10s

export function OtherPlayers() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const localId = useRef(Math.random().toString(36).slice(2, 10));
  const lastSync = useRef(0);

  // Generate a consistent color from our ID
  const myColor = useRef(
    `hsl(${parseInt(localId.current, 36) % 360}, 70%, 55%)`
  );

  useFrame((state) => {
    const now = Date.now();
    if (now - lastSync.current < SYNC_INTERVAL) return;
    lastSync.current = now;

    const pos = state.camera.position;

    // Send our position
    fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: localId.current,
        x: pos.x,
        y: pos.y - 1.5, // offset camera height
        z: pos.z,
        color: myColor.current,
      }),
    }).catch(() => {}); // silent fail

    // Fetch other players
    fetch("/api/players")
      .then((r) => r.json() as Promise<PlayerData[]>)
      .then((data) => {
        setPlayers(
          data.filter(
            (p) =>
              p.id !== localId.current &&
              now - p.lastSeen < STALE_THRESHOLD
          )
        );
      })
      .catch(() => {});
  });

  return (
    <>
      {players.map((p) => (
        <OtherPlayerMesh key={p.id} player={p} />
      ))}
    </>
  );
}

function OtherPlayerMesh({ player }: { player: PlayerData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(player.x, player.y, player.z));

  useEffect(() => {
    targetPos.current.set(player.x, player.y, player.z);
  }, [player.x, player.y, player.z]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 0.15);
    }
  });

  return (
    <mesh ref={meshRef} position={[player.x, player.y + 0.8, player.z]} castShadow>
      <capsuleGeometry args={[0.3, 1, 8, 16]} />
      <meshStandardMaterial color={player.color} />
    </mesh>
  );
}
