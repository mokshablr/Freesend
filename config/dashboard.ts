import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      { href: "/emails", icon: "mail", title: "Emails" },
      { href: "/mail-servers", icon: "server", title: "Mail Servers" },
      { href: "/api-keys", icon: "lock", title: "API Keys" },
    ],
  },
  {
    title: "SETUP",
    items: [
      // {
      //   href: "/users",
      //   icon: "user",
      //   title: "Users",
      //   authorizeOnly: UserRole.ADMIN,
      // },
      { href: "/settings", icon: "settings", title: "Settings" },
    ],
  },
];
