import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getDashboardData } from "@/lib/dashboard-utils";
import { DashboardClient } from "./dashboard-client";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Dashboard",
  description: "Comprehensive dashboard with analytics and charts",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.isActive) {
    redirect("/inactive");
  }

  const dashboardData = await getDashboardData();

  return (
    <div>
      <div className="mx-auto max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Icons.dashboard className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
            Overview
          </h1>
        </div>
        <div className="mt-2 h-px bg-border"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <DashboardClient
          totalEmails={dashboardData.totalEmails}
          activeApiKeys={dashboardData.activeApiKeys}
          totalApiKeys={dashboardData.totalApiKeys}
          emailsByDay={dashboardData.emailsByDay}
          hoursData={dashboardData.hoursData}
          monthlyData={dashboardData.monthlyData}
          recentEmails={dashboardData.recentEmails}
          emailsLastHour={dashboardData.emailsLastHour}
        />
      </div>
    </div>
  );
}
