"use client";

import { useState, useRef } from "react";

export function useNeonEffects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState<{ 
    x: number; 
    y: number; 
    active: boolean; 
    idx: number 
  }>({ x: 0, y: 0, active: false, idx: -1 });
  
  const NEON_COLOR = "#ffffff"; // Monochrome white for all effects

  // UI Interaction Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPointer({ x, y, active: true, idx });
  };

  const handlePointerLeave = () => {
    setPointer({ ...pointer, active: false, idx: -1 });
  };

  const getCardStyle = (idx: number) => {
    const isHovered = pointer.active && pointer.idx === idx;
    if (isHovered) {
      return {
        boxShadow: `0 0 10px 1.5px ${NEON_COLOR}22`,
        border: `1px solid ${NEON_COLOR}44`,
        background: `radial-gradient(180px at ${pointer.x}px ${pointer.y}px, ${NEON_COLOR}0C, transparent 80%), #0a0a0a`,
        transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
      };
    }
    return {
      transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
      border: '1px solid #ffffff1a',
      background: '#0a0a0a',
    };
  };

  return {
    containerRef,
    handlePointerMove,
    handlePointerLeave,
    getCardStyle,
    NEON_COLOR,
  };
}
