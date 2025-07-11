"use client";

import { useNeonEffects } from "@/hooks/use-neon-effects";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface NeonDialogProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  title: string;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function NeonDialog({ 
  children, 
  trigger, 
  title, 
  footer, 
  open, 
  onOpenChange, 
  className 
}: NeonDialogProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only initialize neon effects after component is mounted to avoid SSR issues
  const neonEffects = mounted ? useNeonEffects() : null;

  if (!mounted) {
    // Return a basic dialog during SSR to avoid hydration mismatches
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className={cn("relative overflow-hidden", className)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }

  const { containerRef, handlePointerMove, handlePointerLeave, getCardStyle } = neonEffects!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent 
        ref={containerRef}
        style={getCardStyle(0)}
        onPointerMove={e => handlePointerMove(e, 0)}
        onPointerLeave={handlePointerLeave}
        className={cn("relative overflow-hidden", className)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
