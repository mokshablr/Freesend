import { getCurrentUser } from "@/lib/session";
import { getDashboardData } from "@/lib/dashboard-utils";

export const GET = async (req: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (!user.isActive) {
      return new Response(
        JSON.stringify({ error: "Account inactive" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const dashboardData = await getDashboardData();

    return new Response(
      JSON.stringify(dashboardData),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch dashboard data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
