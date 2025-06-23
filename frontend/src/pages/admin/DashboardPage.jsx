import { ClipboardCheck, Car, Users, Calendar, User } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      name: "Total Requests",
      value: "124",
      icon: ClipboardCheck,
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Active Requests",
      value: "24",
      icon: Car,
      change: "+5%",
      changeType: "positive",
    },
    {
      name: "Mechanics",
      value: "8",
      icon: Users,
      change: "+2",
      changeType: "positive",
    },
    {
      name: "Today's Appointments",
      value: "14",
      icon: Calendar,
      change: "-3",
      changeType: "negative",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
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

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        {/* Activity items would go here */}
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500">
              New service request #1234 created
            </p>
            <p className="text-xs text-gray-400">2 hours ago</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500">
              Mechanic John Doe completed service #1229
            </p>
            <p className="text-xs text-gray-400">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
