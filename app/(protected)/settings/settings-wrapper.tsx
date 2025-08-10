"use client";

import { SharedNeonWrapper } from "@/components/shared/neon-wrapper";
import { Card } from "@/components/ui/card";

interface SettingsWrapperProps {
  children: React.ReactNode;
}

export function SettingsWrapper({ children }: SettingsWrapperProps) {
  return (
    <SharedNeonWrapper className="mx-auto max-w-7xl px-6 py-8">
      <Card className="relative overflow-hidden p-6">
        {children}
      </Card>
    </SharedNeonWrapper>
  );
}
