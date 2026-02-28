import { useQuery } from "@tanstack/react-query";
import {
  Users,
  PawPrint,
  ShieldCheck,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "@/api/api";

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load analytics.</div>;
  }

  const {
    totalUsers,
    totalPets,
    totalPolicies,
    totalRevenue,
    expiringPolicies,
    monthlyRevenue,
  } = data;

  return (
    <div className="space-y-8">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of platform analytics
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h2 className="text-2xl font-bold">{totalUsers}</h2>
            </div>
            <Users className="text-emerald-600" size={28} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pets</p>
              <h2 className="text-2xl font-bold">{totalPets}</h2>
            </div>
            <PawPrint className="text-emerald-600" size={28} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Policies</p>
              <h2 className="text-2xl font-bold">{totalPolicies}</h2>
            </div>
            <ShieldCheck className="text-emerald-600" size={28} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h2 className="text-2xl font-bold">
                ₹ {totalRevenue.toLocaleString()}
              </h2>
            </div>
            <IndianRupee className="text-emerald-600" size={28} />
          </CardContent>
        </Card>

      </div>

      {/* ALERT CARD */}
      <Card className="rounded-2xl border-yellow-400">
        <CardContent className="p-6 flex items-center gap-4">
          <AlertTriangle className="text-yellow-500" size={28} />
          <div>
            <p className="font-semibold">
              Policies Expiring in Next 7 Days
            </p>
            <p className="text-2xl font-bold">
              {expiringPolicies}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* REVENUE CHART */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}