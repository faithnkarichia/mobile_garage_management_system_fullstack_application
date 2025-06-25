import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Car,
  Users,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch(`${process.env.VITE_API_URL}/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats([
          {
            name: "Total Requests",
            value: data.total_requests,
            icon: ClipboardCheck,
            change: "+12%",
            changeType: "positive",
          },
          {
            name: "Active Requests",
            value: data.active_requests,
            icon: Car,
            change: "+5%",
            changeType: "positive",
          },
          {
            name: "Mechanics",
            value: data.total_mechanics,
            icon: Users,
            change: "+2",
            changeType: "positive",
          },
          {
            name: "Today's Appointments",
            value: data.today_appointments,
            icon: Calendar,
            change: "-3",
            changeType: "negative",
          },
        ]);
      })
      .catch((err) => console.error("Error fetching dashboard stats", err));
  }, []);

  if (!stats) return <p className="text-gray-600">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  stat.changeType === "positive"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p
                className={`text-sm ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change} from last week
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Overview Graph
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
