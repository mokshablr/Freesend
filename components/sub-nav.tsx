"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface SubNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SubNav({navlist, className, ...props }: any, SubNavProps) {
  const pathname = usePathname()

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-1 flex items-center", className)} {...props}>
          {navlist.map((navitem, index) => (
            <Link
              href={navitem.href}
              key={navitem.href}
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                pathname == navitem.href ||
                  (index === 0 && pathname === "/")
                  ? "bg-violet-200 font-medium text-gray-700"
                  : "text-muted-foreground"
              )}
            >
              {navitem.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
