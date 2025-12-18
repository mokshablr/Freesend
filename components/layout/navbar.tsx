"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";

import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DocsSearch } from "@/components/docs/search";
import { ModalContext } from "@/components/modals/providers";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
}

export function NavBar({ scroll = false }: NavBarProps) {
  const scrolled = useScroll(50);
  const { data: session, status } = useSession();
  const { setShowSignInModal } = useContext(ModalContext);

  const selectedLayout = useSelectedLayoutSegment();
  const documentation = selectedLayout === "docs";

  const configMap = {
    docs: docsConfig.mainNav,
  };

  const links =
    (selectedLayout && configMap[selectedLayout]) || marketingConfig.mainNav;

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b border-slate-900/85 bg-gradient-to-b from-slate-950/95 to-transparent" : "bg-transparent border-b border-slate-900/85") : "border-b border-slate-900/85 bg-gradient-to-b from-slate-950/95 to-transparent"
      }`}
    >
      <MaxWidthWrapper
        className="flex h-14 items-center justify-between gap-6 py-4"
        large={documentation}
      >
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-1.5">
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

          {links && links.length > 0 ? (
            <nav className="hidden gap-5 md:flex">
              {links.map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-full px-1 py-1 text-sm font-medium transition-colors hover:text-foreground sm:text-sm",
                    item.href.startsWith(`/${selectedLayout}`)
                      ? "text-foreground"
                      : "text-muted-foreground",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          ) : (
            <nav className="hidden gap-5 text-sm text-muted-foreground md:flex">
              <Link href="#features" className="transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
              <Link href="/docs" className="transition-colors hover:text-foreground">
                Docs
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* right header for docs */}
          {documentation ? (
            <div className="hidden flex-1 items-center space-x-4 sm:justify-end lg:flex">
              <div className="hidden lg:flex lg:grow-0">
                <DocsSearch />
              </div>
              <div className="flex lg:hidden">
                <Icons.search className="size-6 text-muted-foreground" />
              </div>
              <div className="flex space-x-4">
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icons.gitHub className="size-7" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-2 rounded-full border-gray-700 bg-black px-4 text-xs font-medium md:inline-flex"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.25)]"></span>
                Live status
              </Button>
              {session ? (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="gap-2 rounded-full px-5 text-xs font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 transition-shadow"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : status === "unauthenticated" ? (
                <Link href="/login">
                  <Button
                    size="sm"
                    className="gap-2 rounded-full px-5 text-xs font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 transition-shadow"
                  >
                    Get started
                  </Button>
                </Link>
              ) : (
                <Skeleton className="h-9 w-28 rounded-full" />
              )}
            </>
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
