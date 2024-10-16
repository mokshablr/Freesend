import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


export function ReportNav({ tab }: { tab: string }) {

  return (
    <Tabs defaultValue={tab} className="w-[200px]">
      <TabsList className="grid w-full grid-cols-1">

        <TabsTrigger value="1">
          <Link
            href={"/reports/"}
            className={tab == "1" ? "text-sm font-medium transition-colors hover:text-primary" : "text-sm font-medium transition-colors hover:text-primary text-muted-foreground"}
          >
            Revenue This Year
          </Link>
        </TabsTrigger>

      </TabsList>
    </Tabs>
  )
}