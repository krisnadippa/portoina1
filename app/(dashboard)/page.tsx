import {
  getDashboardStats,
  getRecentActivities,
} from "@/lib/actions/payroll";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, activities] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(),
  ]);

  return <DashboardContent stats={serialize(stats)} activities={serialize(activities)} />;
}

