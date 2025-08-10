"use client";

import { SharedNeonWrapper } from "@/components/shared/neon-wrapper";
import { Card } from "@/components/ui/card";

interface MailServersWrapperProps {
  children: React.ReactNode;
}

export function MailServersWrapper({ children }: MailServersWrapperProps) {
  return (
    <SharedNeonWrapper>
      <Card className="relative overflow-hidden p-6">
        {children}
      </Card>
    </SharedNeonWrapper>
  );
}
