import { Wrench, Clock } from 'lucide-react';

const MechanicDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mechanic Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assigned Tasks</h3>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Hours Worked</h3>
                <p className="text-2xl font-bold">32.5</p>
              </div>
            </div>
          </div>

          {/* Add more dashboard widgets as needed */}
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;