import { DocsConfig } from "types";

export const docsConfig: DocsConfig = {
  mainNav: [
    // {
    //   title: "Documentation",
    //   href: "/docs",
    // },
    // {
    //   title: "Guides",
    //   href: "/guides",
    // },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
        },
        {
          title: "Installation",
          href: "/docs/getting-started",
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Setup Mail Servers",
          href: "/docs/configuration/mail-server",
        },
        {
          title: "Setup API Keys",
          href: "/docs/configuration/api-keys",
        },
      ],
    },
    {
      title: "API",
      items: [
        {
          title: "Sending Email",
          href: "/docs/api/send-email",
        },
      ],
    },
  ],
};
