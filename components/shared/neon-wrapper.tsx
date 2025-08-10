"use client";

import { useNeonEffects } from "@/hooks/use-neon-effects";
import { Card } from "@/components/ui/card";

interface SharedNeonWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SharedNeonWrapper({ children, className = "mx-auto max-w-7xl px-6" }: SharedNeonWrapperProps) {
  const { containerRef, handlePointerMove, handlePointerLeave, getCardStyle } = useNeonEffects();

  return (
    <div ref={containerRef} className={className}>
      <Card 
        style={getCardStyle(0)} 
        onPointerMove={e => handlePointerMove(e, 0)} 
        onPointerLeave={handlePointerLeave} 
        className="relative overflow-hidden p-6"
      >
        {children}
      </Card>
    </div>
  );
}
