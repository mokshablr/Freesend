"use client";

import { SharedNeonWrapper } from "@/components/shared/neon-wrapper";
import { Card } from "@/components/ui/card";

interface ApiKeysWrapperProps {
  children: React.ReactNode;
}

export function ApiKeysWrapper({ children }: ApiKeysWrapperProps) {
  return (
    <SharedNeonWrapper>
      <Card className="relative overflow-hidden p-6">
        {children}
      </Card>
    </SharedNeonWrapper>
  );
}
