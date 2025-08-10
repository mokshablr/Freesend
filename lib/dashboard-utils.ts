import { getEmailsByTenant } from "@/lib/emails";
import { getApiKeysByTenant } from "@/lib/api-key";

export interface DashboardData {
  totalEmails: number;
  activeApiKeys: number;
  totalApiKeys: number;
  emailsByDay: Array<{
    date: string;
    emails: number;
    fullDate: string;
  }>;
  hoursData: Array<{
    hour: number;
    time: string;
    emails: number;
  }>;
  monthlyData: Array<{
    month: string;
    emails: number;
  }>;
  recentEmails: Array<{
    id: string;
    to: string;
    createdAt: string | Date;
  }>;
  emailsLastHour: number;
}

export async function getDashboardData(): Promise<DashboardData> {
  // Fetch data for dashboard
  const emails = await getEmailsByTenant();
  const apiKeys = await getApiKeysByTenant();

  // Filter out deleted API keys - only count active and inactive ones
  const nonDeletedApiKeys = apiKeys.filter(key => key.status !== "deleted");
  
  // Calculate metrics
  const totalEmails = emails.length;
  const activeApiKeys = nonDeletedApiKeys.filter(key => key.status === "active").length;
  const totalApiKeys = nonDeletedApiKeys.length; // Only non-deleted keys

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

  // Calculate emails sent in the last hour
  const nowTime = new Date();
  const oneHourAgo = new Date(nowTime.getTime() - 60 * 60 * 1000);
  const emailsLastHour = emails.filter(email => {
    const emailDate = new Date(email.createdAt);
    return emailDate >= oneHourAgo && emailDate <= nowTime;
  }).length;

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
    };
  });

  return {
    totalEmails,
    activeApiKeys,
    totalApiKeys,
    emailsByDay,
    hoursData,
    monthlyData,
    recentEmails,
    emailsLastHour,
  };
}
