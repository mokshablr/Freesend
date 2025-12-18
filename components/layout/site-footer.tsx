import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "../shared/icons";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-slate-900/95 py-8 px-6 text-sm text-muted-foreground md:py-12", className)}>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <Image
                alt="Freesend"
                src="/freesend-logo-black.png"
                width={110}
                height={38}
                className="block dark:hidden"
              />
              <Image
                alt="Freesend"
                src="/freesend-logo-white.png"
                width={110}
                height={38}
                className="hidden dark:block"
              />
            </Link>
            <p className="text-sm">
              Open source email sending platform. Bring your own SMTP server and send emails with a simple API.
            </p>
            <p className="text-xs">
              <span className="text-foreground">MIT licensed</span>
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-semibold text-foreground">Product</div>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/#features"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <div className="font-semibold text-foreground">Resources</div>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/docs"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Documentation
              </Link>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub
              </Link>
              <a
                href={`${siteConfig.links.github}/issues`}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Support
              </a>
            </nav>
          </div>

          {/* Legal & Info */}
          <div className="space-y-3">
            <div className="font-semibold text-foreground">Legal</div>
            <nav className="flex flex-col space-y-2">
              <a
                href={`${siteConfig.links.github}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                License
              </a>
              <a
                href={`${siteConfig.links.github}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Contributing
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-900/95 pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Freesend. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Icons.gitHub className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
