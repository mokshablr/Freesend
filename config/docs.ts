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
    {
      title: "SDKs",
      items: [
        {
          title: "Overview",
          href: "/docs/sdk",
          description: "All available SDKs and language options",
        },
        {
          title: "JavaScript/TypeScript",
          href: "/docs/sdk/javascript",
          description: "Official SDK for Node.js and browsers",
        },
        {
          title: "Python",
          href: "/docs/sdk/python",
          description: "Official SDK for Python",
        },
        {
          title: "Go",
          href: "/docs/sdk/go",
          description: "Go SDK (Coming Soon)",
          disabled: true,
        },
        {
          title: "PHP",
          href: "/docs/sdk/php",
          description: "PHP SDK (Coming Soon)",
          disabled: true,
        },
        {
          title: "Ruby",
          href: "/docs/sdk/ruby",
          description: "Ruby SDK (Coming Soon)",
          disabled: true,
        },
      ],
    },
  ],
};
