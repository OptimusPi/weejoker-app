"use client";

import { useEffect, useRef, useCallback } from "react";
import { inputState } from "./Player";

export function MobileControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useRef(false);
  const joystickManagerRef = useRef<ReturnType<typeof import("nipplejs").create> | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const setupJoystick = useCallback(async () => {
    if (!joystickRef.current) return;
    const nipplejs = await import("nipplejs");

    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: "static",
      position: { left: "70px", bottom: "70px" },
      color: "rgba(255,255,255,0.5)",
      size: 120,
    });

    manager.on("move", (_evt, data) => {
      if (data.vector) {
        inputState.joystickX = data.vector.x;
        inputState.joystickY = data.vector.y;
      }
    });

    manager.on("end", () => {
      inputState.joystickX = 0;
      inputState.joystickY = 0;
    });

    joystickManagerRef.current = manager;
  }, []);

  useEffect(() => {
    isMobile.current = "ontouchstart" in window;
    if (!isMobile.current) return;

    setupJoystick();

    // Touch-to-look on right side
    const lookArea = lookAreaRef.current;
    if (!lookArea) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (lastTouchRef.current) {
        inputState.lookDeltaX = touch.clientX - lastTouchRef.current.x;
        inputState.lookDeltaY = touch.clientY - lastTouchRef.current.y;
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const onTouchEnd = () => {
      lastTouchRef.current = null;
    };

    lookArea.addEventListener("touchstart", onTouchStart, { passive: false });
    lookArea.addEventListener("touchmove", onTouchMove, { passive: false });
    lookArea.addEventListener("touchend", onTouchEnd);

    return () => {
      joystickManagerRef.current?.destroy();
      lookArea.removeEventListener("touchstart", onTouchStart);
      lookArea.removeEventListener("touchmove", onTouchMove);
      lookArea.removeEventListener("touchend", onTouchEnd);
    };
  }, [setupJoystick]);

  // Only render on touch devices (hidden on desktop via CSS)
  return (
    <>
      {/* Joystick zone - bottom left */}
      <div
        ref={joystickRef}
        className="fixed bottom-0 left-0 w-[180px] h-[180px] z-50 touch-none md:hidden"
      />

      {/* Look zone - right half of screen */}
      <div
        ref={lookAreaRef}
        className="fixed top-0 right-0 w-1/2 h-full z-40 touch-none md:hidden"
      />

      {/* Jump button */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-white/30 border-2 border-white/50 text-white font-bold text-xl z-50 touch-none md:hidden active:bg-white/50"
        onTouchStart={() => { inputState.jump = true; }}
        onTouchEnd={() => { inputState.jump = false; }}
      >
        Jump
      </button>
    </>
  );
}
