import { useEffect, useState } from "react";
import { Wrench, Clock } from "lucide-react";

const MechanicDashboard = () => {
  const [stats, setStats] = useState({ assigned_tasks: 0, hours_worked: 0 });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const mechanicId = localStorage.getItem("mechanic_id");

    fetch(`${import.meta.env.VITE_API_URL}/mechanic/dashboard/${mechanicId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load mechanic stats", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mechanic Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assigned Tasks</h3>
                <p className="text-2xl font-bold">{stats.assigned_tasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Hours Worked</h3>
                <p className="text-2xl font-bold">{stats.hours_worked}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
