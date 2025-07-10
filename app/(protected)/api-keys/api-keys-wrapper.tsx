"use client";

import { useNeonEffects } from "@/hooks/use-neon-effects";
import { Card } from "@/components/ui/card";

interface ApiKeysWrapperProps {
  children: React.ReactNode;
}

export function ApiKeysWrapper({ children }: ApiKeysWrapperProps) {
  const { containerRef, handlePointerMove, handlePointerLeave, getCardStyle } = useNeonEffects();

  return (
    <div ref={containerRef} className="mx-auto max-w-7xl px-6">
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
