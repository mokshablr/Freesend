"use client";

import { Mail, KeyRound, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { NeonWrapper } from "@/components/shared/neon-wrapper";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

interface DashboardData {
  totalEmails: number;
  activeApiKeys: number;
  totalApiKeys: number;
  emailsByDay: any[];
  hoursData: any[];
  monthlyData: any[];
  recentEmails: any[];
}

interface DashboardClientProps extends DashboardData {
  emailsLastHour: number;
}

export function DashboardClient({
  totalEmails: initialTotalEmails,
  activeApiKeys: initialActiveApiKeys,
  totalApiKeys: initialTotalApiKeys,
  emailsByDay: initialEmailsByDay,
  hoursData: initialHoursData,
  monthlyData: initialMonthlyData,
  recentEmails: initialRecentEmails,
  emailsLastHour,
}: DashboardClientProps) {
  const { toast } = useToast();
  
  // State for dashboard data
  const [data, setData] = useState<DashboardData>({
    totalEmails: initialTotalEmails,
    activeApiKeys: initialActiveApiKeys,
    totalApiKeys: initialTotalApiKeys,
    emailsByDay: initialEmailsByDay,
    hoursData: initialHoursData,
    monthlyData: initialMonthlyData,
    recentEmails: initialRecentEmails,
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard-data');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const newData = await response.json();
      setData(newData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Dashboard Update Failed",
        description: "Unable to refresh dashboard data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const {
    totalEmails,
    activeApiKeys,
    totalApiKeys,
    emailsByDay,
    hoursData,
    monthlyData,
    recentEmails,
  } = data;

  return (
    <NeonWrapper className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Emails Card */}
        <Card className="relative overflow-hidden">
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
        {/* Today's Emails Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Emails</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hoursData.reduce((sum, hour) => sum + hour.emails, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {emailsLastHour} sent last hour
            </p>
          </CardContent>
        </Card>
        {/* This Week Card */}
        <Card className="relative overflow-hidden">
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
        {/* Active API Keys Card (moved to last position) */}
        <Card className="relative overflow-hidden">
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
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <DashboardCharts 
          emailsByDay={emailsByDay}
          hoursData={hoursData}
          monthlyData={monthlyData}
          recentEmails={recentEmails}
        />
      </div>
    </NeonWrapper>
  );
}
