"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";

export function UserProfileSection() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="animate-pulse rounded-lg bg-muted/50 p-3">
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut({
      callbackUrl: `${window.location.origin}/`,
    });
  };

  return (
    <div className="rounded-lg bg-muted/50 p-3 border border-border/50">
      <div className="flex items-center gap-3 mb-3">
        <UserAvatar
          user={{ name: user.name || null, image: user.image || null }}
          className="h-8 w-8 border"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user.name || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
        >
          <Icons.user className="h-3.5 w-3.5" />
          Profile Settings
        </Link>
        
        <Link
          href="/settings/account"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
        >
          <Icons.settings className="h-3.5 w-3.5" />
          Account Settings
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="justify-start gap-2 px-2 py-1.5 h-auto text-xs text-muted-foreground hover:text-foreground"
        >
          <Icons.logOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
