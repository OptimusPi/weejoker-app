"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

const MOVE_SPEED = 5;
const LOOK_SPEED = 0.002;
const JUMP_FORCE = 5;

// Shared input state - written by keyboard and mobile controls
export const inputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  // Mobile joystick
  joystickX: 0,
  joystickY: 0,
  // Mobile look
  lookDeltaX: 0,
  lookDeltaY: 0,
};

export function Player() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.2);
  const isPointerLocked = useRef(false);
  const grounded = useRef(true);

  // Pointer lock for desktop
  const onPointerLockChange = useCallback(() => {
    isPointerLocked.current = document.pointerLockElement === gl.domElement;
  }, [gl]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPointerLocked.current) return;
    yaw.current -= e.movementX * LOOK_SPEED;
    pitch.current -= e.movementY * LOOK_SPEED;
    pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    // Only pointer-lock on desktop (no touch)
    const onClick = () => {
      if (!("ontouchstart" in window)) {
        canvas.requestPointerLock();
      }
    };

    canvas.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove", onMouseMove);

    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": case "ArrowUp": inputState.forward = true; break;
        case "KeyS": case "ArrowDown": inputState.backward = true; break;
        case "KeyA": case "ArrowLeft": inputState.left = true; break;
        case "KeyD": case "ArrowRight": inputState.right = true; break;
        case "Space": inputState.jump = true; break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": case "ArrowUp": inputState.forward = false; break;
        case "KeyS": case "ArrowDown": inputState.backward = false; break;
        case "KeyA": case "ArrowLeft": inputState.left = false; break;
        case "KeyD": case "ArrowRight": inputState.right = false; break;
        case "Space": inputState.jump = false; break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [gl, onPointerLockChange, onMouseMove]);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    // Apply mobile look deltas
    if (inputState.lookDeltaX !== 0 || inputState.lookDeltaY !== 0) {
      yaw.current -= inputState.lookDeltaX * LOOK_SPEED;
      pitch.current -= inputState.lookDeltaY * LOOK_SPEED;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
      inputState.lookDeltaX = 0;
      inputState.lookDeltaY = 0;
    }

    // Movement direction
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);

    const moveDir = new THREE.Vector3(0, 0, 0);

    // Keyboard input
    if (inputState.forward) moveDir.add(forward);
    if (inputState.backward) moveDir.sub(forward);
    if (inputState.left) moveDir.sub(right);
    if (inputState.right) moveDir.add(right);

    // Joystick input
    if (inputState.joystickX !== 0 || inputState.joystickY !== 0) {
      moveDir.add(right.clone().multiplyScalar(inputState.joystickX));
      moveDir.add(forward.clone().multiplyScalar(-inputState.joystickY));
    }

    if (moveDir.length() > 0) moveDir.normalize();

    const currentVel = body.linvel();
    body.setLinvel(
      { x: moveDir.x * MOVE_SPEED, y: currentVel.y, z: moveDir.z * MOVE_SPEED },
      true
    );

    // Jump
    const pos = body.translation();
    grounded.current = pos.y < 1.1;
    if (inputState.jump && grounded.current) {
      body.setLinvel({ x: currentVel.x, y: JUMP_FORCE, z: currentVel.z }, true);
    }

    // Camera follow
    camera.position.set(pos.x, pos.y + 1.5, pos.z);
    const lookQuat = new THREE.Quaternion();
    lookQuat.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"));
    camera.quaternion.copy(lookQuat);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={[0, 2, 5]}
      enabledRotations={[false, false, false]}
      colliders={false}
      mass={1}
      lockRotations
    >
      <CapsuleCollider args={[0.5, 0.3]} position={[0, 0.8, 0]} />
      <mesh ref={meshRef} castShadow visible={false}>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
    </RigidBody>
  );
}
