import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { Mail, KeyRound, TrendingUp, Activity } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmailsByTenant } from "@/lib/emails";
import { getApiKeysByTenant } from "@/lib/api-key";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

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

  // Fetch data for dashboard
  const emails = await getEmailsByTenant();
  const apiKeys = await getApiKeysByTenant();

  // Calculate metrics
  const totalEmails = emails.length;
  const activeApiKeys = apiKeys.filter(key => key.status === "active").length;
  const totalApiKeys = apiKeys.length;

  // Get recent emails (last 10)
  const recentEmails = emails
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(email => ({
      id: email.id,
      to: email.to,
      createdAt: email.createdAt,
    }));

  // Prepare chart data: emails sent per day (last 7 days)
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return d;
  });

  const emailsByDay = days.map((day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const count = emails.filter(email => {
      const emailDate = new Date(email.createdAt);
      return emailDate >= dayStart && emailDate <= dayEnd;
    }).length;
    
    return {
      date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      emails: count,
      fullDate: day.toISOString().split('T')[0]
    };
  });

  // Prepare hourly data for today
  const today = new Date();
  const hoursData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(today);
    hour.setHours(i, 0, 0, 0);
    const nextHour = new Date(today);
    nextHour.setHours(i + 1, 0, 0, 0);
    
    const count = emails.filter(email => {
      const emailDate = new Date(email.createdAt);
      return emailDate >= hour && emailDate < nextHour && 
             emailDate.toDateString() === today.toDateString();
    }).length;
    
    return {
      hour: i,
      time: `${i.toString().padStart(2, '0')}:00`,
      emails: count
    };
  });

  // API Key status distribution
  const apiKeyStatusData = [
    { name: 'Active', value: activeApiKeys, color: 'hsl(var(--chart-1))' },
    { name: 'Inactive', value: totalApiKeys - activeApiKeys, color: 'hsl(var(--chart-2))' },
  ];

  // Monthly email trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(month);
    nextMonth.setMonth(month.getMonth() + 1);
    
    const count = emails.filter(email => {
      const emailDate = new Date(email.createdAt);
      return emailDate >= month && emailDate < nextMonth;
    }).length;
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      emails: count,
      apiKeys: Math.floor(Math.random() * 5) + 1 // Mock data for API keys created
    };
  });

  return (
    <div>
      {/* Page Header - match Emails page style and position exactly */}
      <div className="mx-auto max-w-7xl items-center justify-between px-6 pt-8 pb-5">
        <h1 className="text-slate-12 text-2xl font-semibold leading-tight tracking-tight">
          Overview
        </h1>
      </div>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmails}</div>
              <p className="text-xs text-muted-foreground">
                {emailsByDay[emailsByDay.length - 1]?.emails || 0} sent today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeApiKeys}</div>
              <p className="text-xs text-muted-foreground">
                {totalApiKeys} total keys
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emailsByDay.reduce((sum, day) => sum + day.emails, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                emails sent this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hoursData.reduce((sum, hour) => sum + hour.emails, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                emails sent today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <DashboardCharts 
          emailsByDay={emailsByDay}
          hoursData={hoursData}
          monthlyData={monthlyData}
          recentEmails={recentEmails}
        />
      </div>
    </div>
  );
}
