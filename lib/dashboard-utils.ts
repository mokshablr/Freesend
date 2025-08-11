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

// Temporary dummy data generator for appealing dashboard
function generateDummyData(): DashboardData {
  // Generate realistic but appealing daily data (last 7 days)
  const emailsByDay = [
    { date: 'Mon', emails: 45, fullDate: '2024-01-15' },
    { date: 'Tue', emails: 67, fullDate: '2024-01-16' },
    { date: 'Wed', emails: 89, fullDate: '2024-01-17' },
    { date: 'Thu', emails: 123, fullDate: '2024-01-18' },
    { date: 'Fri', emails: 156, fullDate: '2024-01-19' },
    { date: 'Sat', emails: 98, fullDate: '2024-01-20' },
    { date: 'Sun', emails: 134, fullDate: '2024-01-21' },
  ];

  // Generate hourly data with realistic patterns (more activity during business hours)
  const hoursData = Array.from({ length: 24 }, (_, i) => {
    let emails = 0;
    if (i >= 9 && i <= 17) { // Business hours: 9 AM - 6 PM
      emails = Math.floor(Math.random() * 20) + 15; // 15-35 emails
    } else if (i >= 18 && i <= 22) { // Evening: 6 PM - 10 PM
      emails = Math.floor(Math.random() * 15) + 8; // 8-23 emails
    } else if (i >= 7 && i <= 8) { // Early morning: 7 AM - 8 AM
      emails = Math.floor(Math.random() * 10) + 5; // 5-15 emails
    } else { // Late night: 11 PM - 6 AM
      emails = Math.floor(Math.random() * 8) + 2; // 2-10 emails
    }
    
    return {
      hour: i,
      time: `${i.toString().padStart(2, '0')}:00`,
      emails
    };
  });

  // Generate monthly data with growth trend
  const monthlyData = [
    { month: 'Aug', emails: 1240 },
    { month: 'Sep', emails: 1580 },
    { month: 'Oct', emails: 1890 },
    { month: 'Nov', emails: 2340 },
    { month: 'Dec', emails: 2870 },
    { month: 'Jan', emails: 3450 },
  ];

  // Generate recent emails with realistic data
  const recentEmails = [
    { id: '1', to: 'john.doe@company.com', createdAt: new Date(Date.now() - 5 * 60 * 1000) }, // 5 min ago
    { id: '2', to: 'sarah.wilson@startup.io', createdAt: new Date(Date.now() - 15 * 60 * 1000) }, // 15 min ago
    { id: '3', to: 'mike.chen@enterprise.com', createdAt: new Date(Date.now() - 45 * 60 * 1000) }, // 45 min ago
    { id: '4', to: 'emma.rodriguez@tech.co', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
    { id: '5', to: 'alex.kumar@business.net', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }, // 3 hours ago
    { id: '6', to: 'lisa.park@corporate.org', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) }, // 4 hours ago
    { id: '7', to: 'david.lee@startup.io', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) }, // 5 hours ago
    { id: '8', to: 'anna.smith@company.com', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours ago
    { id: '9', to: 'tom.brown@enterprise.com', createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000) }, // 7 hours ago
    { id: '10', to: 'jessica.garcia@tech.co', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) }, // 8 hours ago
  ];

  return {
    totalEmails: 3450,
    activeApiKeys: 8,
    totalApiKeys: 12,
    emailsByDay,
    hoursData,
    monthlyData,
    recentEmails,
    emailsLastHour: 23,
  };
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
  today.setHours(0, 0, 0, 0); // Start of today
  
  const hoursData = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(today);
    hourStart.setHours(i, 0, 0, 0);
    const hourEnd = new Date(today);
    hourEnd.setHours(i + 1, 0, 0, 0);

    const count = emails.filter(email => {
      const emailDate = new Date(email.createdAt);
      // Ensure email is from today and within this specific hour
      return emailDate >= hourStart && emailDate < hourEnd;
    }).length;

    return {
      hour: i,
      time: `${i.toString().padStart(2, '0')}:00`,
      emails: count
    };
  });

  // Calculate emails sent in the last hour (more precise)
  const nowTime = new Date();
  const oneHourAgo = new Date(nowTime.getTime() - 60 * 60 * 1000);
  const emailsLastHour = emails.filter(email => {
    const emailDate = new Date(email.createdAt);
    // Use inclusive start, exclusive end to avoid double-counting boundary emails
    return emailDate >= oneHourAgo && emailDate < nowTime;
  }).length;

  // Monthly email trend (last 6 months) - more reliable date handling
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (5 - i));
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1);

    const count = emails.filter(email => {
      const emailDate = new Date(email.createdAt);
      // Use inclusive start, exclusive end for month boundaries
      return emailDate >= monthStart && emailDate < monthEnd;
    }).length;

    return {
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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

  // Uncomment to return dummy data
  // return generateDummyData();
}