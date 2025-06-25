import { useEffect, useState } from "react";
import {
  Wrench,
  Clock,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Car,
  AlertCircle,
} from "lucide-react";

const MechanicServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Fetching service requests with token:", token);
    fetch("http://localhost:5555/service_requests", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setServiceRequests(data);
        console.log("Service Requests:", data);
      })
      .catch((error) => {
        console.error("Error fetching service requests:", error);
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  console.log("Service Requests:-----------------", serviceRequests);
  const filteredRequests = serviceRequests && serviceRequests.length > 0 && serviceRequests.filter(
    (request) =>
      (request.vehicle && request.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.customer && request.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.issue && request.issue.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  

  const updateRequestStatus = (id, newStatus) => {
    setServiceRequests(
      serviceRequests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Service Requests
        </h1>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests && filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                      {`${request.vehicle_details.make} ${request.vehicle_details.model}, ${request.vehicle_details.year_of_manufacture}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.createdAt}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.customer_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.issue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : request.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : request.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {request.status !== "Completed" && (
                          <button
                            onClick={() =>
                              updateRequestStatus(request.id, "Completed")
                            }
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Check className="h-4 w-4 mr-1" /> Complete
                          </button>
                        )}
                        <button
                          onClick={() => openDetails(request)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <ChevronDown className="h-4 w-4 mr-1" /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Service Request Details
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Car className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Vehicle Information
                      </h3>
                      <p className="text-gray-700">{selectedRequest.vehicle}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Customer Details
                      </h3>
                      <p className="text-gray-700">
                        {selectedRequest.customer}
                      </p>
                      <p className="text-gray-600">
                        {selectedRequest.customerPhone}
                      </p>
                      <p className="text-gray-600">
                        {selectedRequest.customerEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Reported Issue
                      </h3>
                      <p className="text-gray-700">{selectedRequest.issue}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Timing
                      </h3>
                      <p className="text-gray-700">
                        Created: {selectedRequest.createdAt}
                      </p>
                      <p className="text-gray-700">
                        Estimated Completion:{" "}
                        {selectedRequest.estimatedCompletion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Wrench className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Parts Required
                      </h3>
                      <ul className="list-disc pl-5 text-gray-700">
                        {selectedRequest.partsRequired.map((part, index) => (
                          <li key={index}>
                            {part.name} (PN: {part.partNumber}) - Qty:{" "}
                            {part.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Additional Notes
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">{selectedRequest.notes}</p>
                </div>
              </div>

              {/* Status Section */}
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : selectedRequest.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    Priority: {selectedRequest.priority}
                  </span>
                  <span
                    className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : selectedRequest.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Status: {selectedRequest.status}
                  </span>
                </div>
                {selectedRequest.status !== "Completed" && (
                  <button
                    onClick={() => {
                      updateRequestStatus(selectedRequest.id, "Completed");
                      closeDetails();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" /> Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicServiceRequests;
