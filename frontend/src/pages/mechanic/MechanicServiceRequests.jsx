import { useEffect, useState } from "react";
import Swal from 'sweetalert2'; 
import {
  Wrench,
  Check,
  X,
  Search,
  ChevronDown,
  User,
  Car,
  AlertCircle,
} from "lucide-react";

const MechanicServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchRequests = () => {
    const token = localStorage.getItem("access_token");
  
    fetch(`${import.meta.env.VITE_API_URL}/service_requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setServiceRequests(data))
      .catch((error) => {
        console.error("Error fetching service requests:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load service requests',
          confirmButtonColor: '#3085d6',
        });
      });
  };
  

  useEffect(() => {
    fetchRequests();
    
  
  }, []);
  console.log(serviceRequests);
  const filteredRequests =
    (serviceRequests && serviceRequests.length > 0 &&
      serviceRequests?.filter(
        (request) =>
          request.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.issue?.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
    [];

    const updateRequestStatus = (id, newStatus) => {
      const token = localStorage.getItem("access_token");
    
      fetch(`${import.meta.env.VITE_API_URL}/service_requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to update status");
          }
          return res.json();
        })
        .then(() => {
          

          fetchRequests()
        
          Swal.fire({
            icon: "success",
            title: "Success",
            text: `Status updated to "${newStatus}"`,
            timer: 2000,
            showConfirmButton: false,
          });
        })
        .catch((err) => {
          console.error("Error updating status:", err);
          Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Failed to update the status. Please try again.",
          });
        });
    };
    

  const openDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
    setIsDetailsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Service Requests
        </h1>

        {/* Search */}
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

        {/* Requests Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Service ID
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Vehicle
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Customer
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Issue
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Status
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Actions
    </th>
  </tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {filteredRequests.length > 0 ? (
    filteredRequests.map((request) => (
      <tr key={request.id}>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {request.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {`${request.vehicle_details?.make || ""} ${
              request.vehicle_details?.model || ""
            }, ${request.vehicle_details?.year_of_manufacture || ""}`}
          </div>
          <div className="text-sm text-gray-500">{request.createdAt}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {request.customer_details.name}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {request.issue}
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
                onClick={() => updateRequestStatus(request.id, "Completed")}
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
    ))
  ) : (
    <tr>
      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
        No service requests found.
      </td>
    </tr>
  )}
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
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Car className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Vehicle Information
                      </h3>
                      <p className="text-gray-700">
                        {`${selectedRequest.vehicle_details?.make || ""} ${
                          selectedRequest.vehicle_details?.model || ""
                        }, ${
                          selectedRequest.vehicle_details
                            ?.year_of_manufacture || ""
                        }`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Customer Name
                      </h3>
                      <p className="text-gray-700">
                        {selectedRequest.customer_details?.name}
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

                {/* Inventory Section */}
                <div className="space-y-4">
                  {selectedRequest.inventories?.length > 0 && (
                    <div className="flex items-start">
                      <Wrench className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div className="w-full">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Used Inventories
                        </h3>

                        {(() => {
                          const grouped = {};
                          selectedRequest.inventories.forEach((inv) => {
                            if (!grouped[inv.name]) {
                              grouped[inv.name] = {
                                name: inv.name,
                                totalQuantity: 0,
                                totalCost: 0,
                                price: inv.price,
                              };
                            }
                            grouped[inv.name].totalQuantity += Number(
                              inv.used_quantity || 0
                            );
                            grouped[inv.name].totalCost +=
                              Number(inv.used_quantity || 0) *
                              Number(inv.price || 0);
                          });

                          const groupedItems = Object.values(grouped);
                          const totalSpent = groupedItems.reduce(
                            (sum, item) => sum + item.totalCost,
                            0
                          );

                          return (
                            <>
                              <ul className="list-disc pl-5 text-gray-700">
                                {groupedItems.map((item, idx) => (
                                  <li key={idx}>
                                    {item.name} – {item.totalQuantity} pcs × Ksh{" "}
                                    {Number(item.price).toLocaleString()} = Ksh{" "}
                                    {Number(item.totalCost).toLocaleString()}
                                  </li>
                                ))}
                              </ul>

                              <p className="text-right mt-3 font-semibold text-gray-800">
                                Total Spent:{" "}
                                <span className="text-blue-600">
                                  Ksh{" "}
                                  {totalSpent.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {selectedRequest.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Additional Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 flex justify-between items-center">
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
