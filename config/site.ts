import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Freesend",
  description:
    "Freesend empowers you to send emails your way by allowing seamless integration with your own mail servers. Experience personalized and efficient communication with Freesend.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "",
    github: "https://www.github.com/mokshablr/freesend",
  },
  mailSupport: "",
};
