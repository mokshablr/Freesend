"use client";

import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { sidebarLinks } from "@/config/dashboard";

interface PageHeaderProps {
  className?: string;
}

interface PageInfo {
  title: string;
  icon: string;
}

export function PageHeader({ className }: PageHeaderProps) {
  const pathname = usePathname();

  // Find the current page info from sidebar links
  const getCurrentPageInfo = (): PageInfo => {
    // Special case for dashboard
    if (pathname === "/dashboard") {
      return {
        title: "Overview",
        icon: "dashboard",
      };
    }

    for (const section of sidebarLinks) {
      for (const item of section.items) {
        if (item.href && pathname === item.href) {
          return {
            title: item.title,
            icon: item.icon || "dashboard",
          };
        }
        // Handle nested routes like /settings/profile
        if (item.href && pathname.startsWith(item.href) && item.href !== "/" && item.href !== "/settings") {
          return {
            title: item.title,
            icon: item.icon || "dashboard",
          };
        }
      }
    }

    // Handle settings sub-routes specifically
    if (pathname.startsWith("/settings/")) {
      const subRoute = pathname.split("/settings/")[1];
      if (subRoute === "profile") {
        return { title: "Profile", icon: "user" };
      }
      if (subRoute === "account") {
        return { title: "Account", icon: "settings" };
      }
    }

    // Default fallback
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Convert URL segment to title case
    const title = lastSegment
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Dashboard';

    return {
      title,
      icon: "dashboard",
    };
  };

  const pageInfo = getCurrentPageInfo();
  const Icon = Icons[pageInfo.icon as keyof typeof Icons] as LucideIcon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
        {pageInfo.title}
      </h1>
    </div>
  );
}
