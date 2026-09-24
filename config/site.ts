import { SidebarNavItem, SiteConfig } from "types";
// Read at runtime (server only). Client components see the fallback; use relative links there.
const site_url = process.env.APP_URL ?? "http://localhost:5000";

export const siteConfig: SiteConfig = {
  name: "Freesend",
  description:
    "Freesend empowers you to send emails your way by allowing seamless integration with your own mail servers. Experience personalized and efficient communication with Freesend.",
  url: site_url,
  ogImage: `${site_url}/freesend-og-image.png`,
  links: {
    twitter: "",
    github: "https://www.github.com/mokshablr/freesend",
  },
  mailSupport: "",
};
