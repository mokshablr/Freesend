"use client";

import { SharedNeonWrapper } from "@/components/shared/neon-wrapper";
import { Card } from "@/components/ui/card";

interface EmailsWrapperProps {
  children: React.ReactNode;
}

export function EmailsWrapper({ children }: EmailsWrapperProps) {
  return (
    <SharedNeonWrapper>
      <Card className="relative overflow-hidden p-6">
        {children}
      </Card>
    </SharedNeonWrapper>
  );
}
