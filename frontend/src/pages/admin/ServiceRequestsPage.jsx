import { useState, useEffect } from 'react';
import { Car, Clock, ChevronDown, Check, X } from "lucide-react";

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [editingMechanicId, setEditingMechanicId] = useState(null);
  const [selectedMechanicId, setSelectedMechanicId] = useState("");
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [requestsRes, mechanicsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/service_requests`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/mechanics`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!requestsRes.ok) throw new Error('Failed to fetch requests');
        if (!mechanicsRes.ok) throw new Error('Failed to fetch mechanics');

        const [requestsData, mechanicsData] = await Promise.all([
          requestsRes.json(),
          mechanicsRes.json()
        ]);

        setRequests(requestsData);
        setMechanics(mechanicsData);
      } catch (err) {
        setError(err.message);
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (requestId, e) => {
    const newStatus = e.target.value;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/service_requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Status update failed');
      }

      const updatedRequest = await response.json();
      setRequests(requests.map(request => 
        request.id === requestId ? updatedRequest : request
      ));
    } catch (err) {
      setError(err.message);
      console.error("Status update error:", err);
    }
  };

  const startMechanicEdit = (requestId, currentMechanicId) => {
    setEditingMechanicId(requestId);
    setSelectedMechanicId(currentMechanicId || "");
    setError(null);
  };

  const saveMechanicAssignment = async (requestId) => {
    if (!selectedMechanicId) {
      setError("Please select a mechanic");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/service_requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ mechanic_id: Number(selectedMechanicId) })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign mechanic');
      }

      const updatedRequest = await response.json();
      setRequests(requests.map(request => 
        request.id === requestId ? updatedRequest : request
      ));
      setEditingMechanicId(null);
      setSelectedMechanicId("");
    } catch (err) {
      setError(err.message);
      console.error("Mechanic assignment error:", err);
    }
  };

  const cancelMechanicEdit = () => {
    setEditingMechanicId(null);
    setSelectedMechanicId("");
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return <div className="p-6 text-center">Loading service requests...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
      
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mechanic
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                {console.log(request,'reeeeq')}
                const { date, time } = formatDateTime(request.requested_at);
                const currentMechanic = mechanics.find(m => m.id === request.mechanic_id);
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{request.id}</div>
                      <div className="text-sm text-gray-500"> {request.customer_details.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {request.vehicle_details.make} {request.vehicle_details.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.vehicle_details.year_of_manufacture}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.issue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e)}
                        className={`px-3 py-1 text-sm rounded-full focus:ring-2 focus:ring-blue-500 ${
                          request.status === "Completed" ? "bg-green-100 text-green-800" :
                          request.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <div>
                          <div className="text-sm">{date}</div>
                          <div className="text-xs text-gray-500">{time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingMechanicId === request.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedMechanicId}
                            onChange={(e) => setSelectedMechanicId(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          >
                            <option value="">Select Mechanic</option>
                            {mechanics.map((mechanic) => (
                              <option key={mechanic.id} value={mechanic.id}>
                                {mechanic.name} ({mechanic.specialty})
                              </option>
                            ))}
                          </select>
                          <button 
                            onClick={() => saveMechanicAssignment(request.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={cancelMechanicEdit}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startMechanicEdit(request.id, request.mechanic_id)}
                          className="cursor-pointer flex items-center group"
                        >
                          <div className="mr-2">
                            <div className="text-sm font-medium">
                              {currentMechanic?.name || "Unassigned"}
                            </div>
                            {currentMechanic && (
                              <div className="text-xs text-gray-500">
                                {currentMechanic.specialty}
                              </div>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}