"use client";

import { SharedNeonWrapper } from "@/components/shared/neon-wrapper";
import { Card } from "@/components/ui/card";

interface BillingWrapperProps {
  children: React.ReactNode;
}

export function BillingWrapper({ children }: BillingWrapperProps) {
  return (
    <SharedNeonWrapper className="mx-auto max-w-7xl px-6 py-8">
      <Card className="relative overflow-hidden p-6">
        {children}
      </Card>
    </SharedNeonWrapper>
  );
}
