import { useState } from 'react';
import { Car, Wrench, Clock, ChevronDown, Check, X } from "lucide-react";

// Sample mechanics data
const mechanics = [
  { id: 1, name: "Mike Rodriguez", specialty: "Engine Specialist" },
  { id: 2, name: "Lisa Chen", specialty: "Transmission Expert" },
  { id: 3, name: "John Smith", specialty: "Brake Systems" },
];

// Initial requests data
const initialRequests = [
  {
    id: "#AC-1001",
    customer: "Sarah Johnson",
    vehicle: "2018 Honda Accord",
    service: "Oil Change & Tire Rotation",
    status: "In Progress",
    date: "2023-06-15",
    time: "10:00 AM",
    mechanic: "",
  },
  {
    id: "#AC-1002",
    customer: "David Wilson",
    vehicle: "2020 Toyota Camry",
    service: "Brake Inspection",
    status: "Completed",
    date: "2023-06-14",
    time: "2:30 PM",
    mechanic: "Lisa Chen",
  },
  {
    id: "#AC-1003",
    customer: "Emily Parker",
    vehicle: "2019 Ford F-150",
    service: "Engine Diagnostic",
    status: "Pending",
    date: "2023-06-16",
    time: "9:00 AM",
    mechanic: "",
  },
];

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [editingMechanicId, setEditingMechanicId] = useState(null);
  const [selectedMechanic, setSelectedMechanic] = useState("");

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId ? { ...request, status: newStatus } : request
    ));
  };

  const startMechanicEdit = (requestId, currentMechanic) => {
    setEditingMechanicId(requestId);
    setSelectedMechanic(currentMechanic);
  };

  const handleMechanicChange = (requestId, mechanicName) => {
    setSelectedMechanic(mechanicName);
  };

  const saveMechanicAssignment = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId ? { ...request, mechanic: selectedMechanic } : request
    ));
    setEditingMechanicId(null);
    setSelectedMechanic("");
  };

  const cancelMechanicEdit = () => {
    setEditingMechanicId(null);
    setSelectedMechanic("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition">
          + New Request
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mechanic
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.vehicle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${
                        request.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : request.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <option value="Pending" className="bg-yellow-100 text-yellow-800">Pending</option>
                      <option value="In Progress" className="bg-blue-100 text-blue-800">In Progress</option>
                      <option value="Completed" className="bg-green-100 text-green-800">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {request.date} at {request.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingMechanicId === request.id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedMechanic}
                          onChange={(e) => handleMechanicChange(request.id, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value="">Select Mechanic</option>
                          {mechanics.map((mechanic) => (
                            <option key={mechanic.id} value={mechanic.name}>
                              {mechanic.name} ({mechanic.specialty})
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => saveMechanicAssignment(request.id)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={cancelMechanicEdit}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => startMechanicEdit(request.id, request.mechanic)}
                        className="cursor-pointer flex items-center hover:bg-gray-50 p-1 rounded"
                      >
                        {request.mechanic || "Assign Mechanic"}
                        <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}