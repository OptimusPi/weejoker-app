"use client";

import { useEffect, useRef } from "react";
import { inputState } from "./Player";

export function MobileControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const joystickOrigin = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!("ontouchstart" in window)) return;

    const joystick = joystickRef.current;
    const knob = knobRef.current;
    const lookArea = lookAreaRef.current;
    if (!joystick || !knob || !lookArea) return;

    const RADIUS = 50;

    // --- Joystick ---
    const onJoystickStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = joystick.getBoundingClientRect();
      joystickOrigin.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const onJoystickMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!joystickOrigin.current) return;
      const touch = e.touches[0];
      let dx = touch.clientX - joystickOrigin.current.x;
      let dy = touch.clientY - joystickOrigin.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > RADIUS) {
        dx = (dx / dist) * RADIUS;
        dy = (dy / dist) * RADIUS;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      inputState.joystickX = dx / RADIUS;
      inputState.joystickY = dy / RADIUS;
    };

    const onJoystickEnd = () => {
      joystickOrigin.current = null;
      knob.style.transform = "translate(0px, 0px)";
      inputState.joystickX = 0;
      inputState.joystickY = 0;
    };

    // --- Look ---
    const onLookStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onLookMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (lastTouchRef.current) {
        inputState.lookDeltaX = touch.clientX - lastTouchRef.current.x;
        inputState.lookDeltaY = touch.clientY - lastTouchRef.current.y;
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const onLookEnd = () => {
      lastTouchRef.current = null;
    };

    joystick.addEventListener("touchstart", onJoystickStart, { passive: false });
    joystick.addEventListener("touchmove", onJoystickMove, { passive: false });
    joystick.addEventListener("touchend", onJoystickEnd);

    lookArea.addEventListener("touchstart", onLookStart, { passive: false });
    lookArea.addEventListener("touchmove", onLookMove, { passive: false });
    lookArea.addEventListener("touchend", onLookEnd);

    return () => {
      joystick.removeEventListener("touchstart", onJoystickStart);
      joystick.removeEventListener("touchmove", onJoystickMove);
      joystick.removeEventListener("touchend", onJoystickEnd);
      lookArea.removeEventListener("touchstart", onLookStart);
      lookArea.removeEventListener("touchmove", onLookMove);
      lookArea.removeEventListener("touchend", onLookEnd);
    };
  }, []);

  return (
    <>
      {/* Joystick - bottom left */}
      <div
        ref={joystickRef}
        className="fixed bottom-4 left-4 w-[120px] h-[120px] rounded-full bg-white/20 border-2 border-white/30 z-50 touch-none md:hidden flex items-center justify-center"
      >
        <div
          ref={knobRef}
          className="w-12 h-12 rounded-full bg-white/50 transition-none"
        />
      </div>

      {/* Look zone - right half */}
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
