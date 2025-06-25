import { useEffect, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  List,
  Package,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

const MechanicDashboard = () => {
  const [mechanicInfo, setMechanicInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [inventoryUsed, setInventoryUsed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
  
    const decoded = jwtDecode(token);
    const { sub } = decoded;
  
    fetch(`${import.meta.env.VITE_API_URL}/mechanics/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setMechanicInfo(data.mechanic_info);
        setStats(data.stats);
        setRecentTasks(data.recent_tasks);
        setInventoryUsed(data.inventory_used);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load mechanic stats", err);
        setLoading(false);
      });
  }, []);
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl font-medium">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mechanic Dashboard
            </h1>
            {mechanicInfo && (
              <p className="text-gray-600">
                {mechanicInfo.name} • {mechanicInfo.specialty} •{" "}
                {mechanicInfo.experience_years} years experience
              </p>
            )}
          </div>
          {mechanicInfo && (
            <div className="bg-white px-4 py-2 rounded-lg shadow flex items-center">
              <span className="text-gray-700 mr-2">Status:</span>
              <span
                className={`font-medium ${
                  mechanicInfo.status === "Available"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {mechanicInfo.status}
              </span>
              {mechanicInfo.rating && (
                <div className="ml-4 flex items-center">
                  <span className="text-gray-700 mr-2">Rating:</span>
                  <span className="font-medium text-yellow-600">
                    {mechanicInfo.rating.toFixed(1)}/5.0
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Total Tasks
                </h3>
                <p className="text-2xl font-bold">{stats?.total_tasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Completed Tasks
                </h3>
                <p className="text-2xl font-bold">
                  {stats?.completed_tasks || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Hours Worked
                </h3>
                <p className="text-2xl font-bold">
                  {stats?.hours_worked?.toFixed(1) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Completion Rate
                </h3>
                <p className="text-2xl font-bold">
                  {stats?.completion_rate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <List className="h-5 w-5 mr-2" /> Recent Tasks
              </h2>
              <span className="text-sm text-gray-500">
                Showing {recentTasks.length} most recent
              </span>
            </div>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {task.issue}
                        </h3>
                        <p className="text-sm text-gray-500">{task.vehicle}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Requested: {new Date(task.requested_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent tasks found</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
              <Package className="h-5 w-5 mr-2" /> Inventory Used
            </h2>
            {inventoryUsed.length > 0 ? (
              <div className="space-y-3">
                {inventoryUsed.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {item.total_used} used
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No inventory items used recently</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
