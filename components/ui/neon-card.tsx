"use client";

import { useNeonEffects } from "@/hooks/use-neon-effects";
import { Card } from "@/components/ui/card";

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  cardIndex?: number;
}

export function NeonCard({ children, className = "", cardIndex = 0 }: NeonCardProps) {
  const { containerRef, handlePointerMove, handlePointerLeave, getCardStyle } = useNeonEffects();

  return (
    <div ref={containerRef}>
      <Card 
        style={getCardStyle(cardIndex)} 
        onPointerMove={e => handlePointerMove(e, cardIndex)} 
        onPointerLeave={handlePointerLeave} 
        className={`relative overflow-hidden ${className}`}
      >
        {children}
      </Card>
    </div>
  );
}
