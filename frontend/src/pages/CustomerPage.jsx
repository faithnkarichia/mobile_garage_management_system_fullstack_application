import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import {
  Car,
  Wrench,
  Calendar,
  MapPin,
  Plus,
  Clock,
  Check,
  X,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
const CustomerDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    issue: "",
    location: "",
    vehicle_details: {
      make: "",
      model: "",
      year_of_manufacture: "",
    },
  });
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year_of_manufacture: "",
  });

  const fetchServiceRequestsAndVehicles = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No token found.");
      return;
    }

    const decoded = jwtDecode(token);
    const { sub } = decoded;
    console.log("-----------", sub.id, sub.role, decoded);

   
    fetch(`${import.meta.env.VITE_API_URL}/service_requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch service requests");
        return res.json();
      })
      .then((serviceRequests) => {
        setServiceRequests(serviceRequests);
        console.log("Service Requests:", serviceRequests);

        
        if (sub.role === "customer" && sub.customer_id) {
          return fetch(
            `${import.meta.env.VITE_API_URL}/vehicles/customer/${sub.customer_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          return null; 
        }
      })
      .then((res) => {
        if (!res) return; 
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        return res.json();
      })
      .then((vehicles) => {
        if (vehicles) {
          setVehicles(vehicles);
          console.log("Vehicles:", vehicles);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

 
  useEffect(() => {
    fetchServiceRequestsAndVehicles();
  }, []);

  const handleRequestChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("vehicle_details.")) {
      const field = name.split(".")[1];
      setNewRequest((prev) => ({
        ...prev,
        vehicle_details: {
          ...prev.vehicle_details,
          [field]: value,
        },
      }));
    } else {
      setNewRequest((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  
  const submitServiceRequest = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

  
    const requestData = {
      issue: newRequest.issue,
      location: newRequest.location,
      vehicle_details: {
        make: newRequest.vehicle_details.make,
        model: newRequest.vehicle_details.model,
        year_of_manufacture: newRequest.vehicle_details.year_of_manufacture,
      },
    };

    fetch(`${import.meta.env.VITE_API_URL}/service_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create service request");
        }
        return response.json();
      })
      .then((data) => {
        
        setServiceRequests((prevRequests) => [...prevRequests, data]);

        
        setNewRequest({
          issue: "",
          location: "",
          vehicle_details: {
            make: "",
            model: "",
            year_of_manufacture: "",
          },
        });
        setShowRequestForm(false);

        
        fetchServiceRequestsAndVehicles();

        Swal.fire({
          title: 'Success!',
          text: 'Service request created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      
      .catch((error) => {
        console.error("Error creating service request:", error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to create service request',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  };

  const fetchVehicles = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const vehicles = fetch(`${import.meta.env.VITE_API_URL}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newVehicle),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create vehicle");
        }
        return response.json();
      })
      .then((data) => {
        setVehicles(vehicles);
        setNewVehicle({ make: "", model: "", year_of_manufacture: "" });
        setShowVehicleForm(false);
      })
      .catch((error) => {
        console.error("Error creating vehicle:", error);
      });
  };

  // Submit new vehicle to backend
  const submitVehicle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const decoded = jwtDecode(token);
  
   
    if (!newVehicle.make || !newVehicle.model || !newVehicle.year_of_manufacture) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill all required fields',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newVehicle,
          year_of_manufacture: parseInt(newVehicle.year_of_manufacture) || 0
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to process vehicle");
      }
  
      if (result.exists) {
        
        const vehiclesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/vehicles/customer/${decoded.customer_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updatedVehicles = await vehiclesResponse.json();
        setVehicles(updatedVehicles);
        Swal.fire({
          title: 'Vehicle Exists',
          text: 'This vehicle already exists in your garage',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        
        setVehicles([...vehicles, result.vehicle]);
        Swal.fire({
          title: 'Success!',
          text: 'Vehicle added successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
  
      setNewVehicle({ make: "", model: "", year_of_manufacture: "" });
      setShowVehicleForm(false);
    } catch (error) {
      console.error("Error processing vehicle:", error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to add vehicle',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  
  const updateServiceRequest = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

   
    const updateData = {
      issue: editingRequest.issue,
      location: editingRequest.location,
      vehicle_id: editingRequest.vehicle_id,
    };

    fetch(`${import.meta.env.VITE_API_URL}/service_requests/${editingRequest.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update service request");
        }
        return response.json();
      })
      .then((updatedRequest) => {
        setServiceRequests(
          serviceRequests.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request
          )
        );
        setEditingRequest(null);
        setShowRequestForm(false);
        Swal.fire({
          title: 'Success!',
          text: 'Service request updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      .catch((error) => {
        console.error("Error updating service request:", error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to update service request',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  };


  const getVehicleById = (id) => {
    return vehicles && vehicles.find((vehicle) => vehicle.id === id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Customer Dashboard
        </h1>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Requests Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-blue-500" />
                Service Requests
              </h2>
              <button
                onClick={() => {
                  setShowRequestForm(true);
                  setEditingRequest(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </button>
            </div>

            {serviceRequests.length > 0 ? (
              <div className="space-y-4">
                {serviceRequests.map((request) => {
                  const vehicle = getVehicleById(request.vehicle_id);
                  return (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {vehicle
                              ? `${vehicle.make} ${vehicle.model} (${vehicle.year_of_manufacture})`
                              : "Vehicle not found"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.issue}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {request.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            Requested: {formatDate(request.requested_at)}
                          </div>
                          {request.completed_at && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Check className="h-4 w-4 mr-1" />
                              Completed: {formatDate(request.completed_at)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingRequest(request);
                            setShowRequestForm(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You have no service requests yet.
              </div>
            )}
          </div>

          {/* Vehicles Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-500" />
                My Vehicles
              </h2>
              <button
                onClick={() => setShowVehicleForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </button>
            </div>

            {vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => {
                  const vehicleRequests = serviceRequests.filter(
                    (req) => req.vehicle_id === vehicle.id
                  );
                  return (
                    <div
                      key={vehicle.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {vehicle.make} {vehicle.model} (
                            {vehicle.year_of_manufacture})
                          </h3>
                          <div className="text-sm text-gray-500 mt-2">
                            Service requests: {vehicleRequests.length}
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You have no vehicles added yet.
              </div>
            )}
          </div>
        </div>

        {/* Service Request Form Modal */}
        {(showRequestForm || editingRequest) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRequest
                      ? "Edit Service Request"
                      : "New Service Request"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRequestForm(false);
                      setEditingRequest(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form
                  onSubmit={
                    editingRequest ? updateServiceRequest : submitServiceRequest
                  }
                >
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Vehicle Details
                    </h3>

                    <div>
                      <label
                        htmlFor="vehicle_details.make"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vehicle Make *
                      </label>
                      <input
                        type="text"
                        id="vehicle_details.make"
                        name="vehicle_details.make"
                        value={
                          editingRequest
                            ? getVehicleById(editingRequest.vehicle_id)?.make ||
                              ""
                            : newRequest.vehicle_details.make
                        }
                        onChange={
                          editingRequest
                            ? (e) =>
                                setEditingRequest({
                                  ...editingRequest,
                                  vehicle_details: {
                                    ...editingRequest.vehicle_details,
                                    make: e.target.value,
                                  },
                                })
                            : handleRequestChange
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="vehicle_details.model"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vehicle Model *
                      </label>
                      <input
                        type="text"
                        id="vehicle_details.model"
                        name="vehicle_details.model"
                        value={
                          editingRequest
                            ? getVehicleById(editingRequest.vehicle_id)
                                ?.model || ""
                            : newRequest.vehicle_details.model
                        }
                        onChange={
                          editingRequest
                            ? (e) =>
                                setEditingRequest({
                                  ...editingRequest,
                                  vehicle_details: {
                                    ...editingRequest.vehicle_details,
                                    model: e.target.value,
                                  },
                                })
                            : handleRequestChange
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="year_of_manufacture"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Year of Manufacture *
                      </label>
                      <input
                        type="number"
                        id="year_of_manufacture"
                        name="year_of_manufacture"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={
                          editingRequest
                            ? getVehicleById(editingRequest.vehicle_id)
                                ?.year_of_manufacture || ""
                            : newRequest.vehicle_details.year_of_manufacture ||
                              ""
                        }
                        onChange={(e) => {
                          const year = parseInt(e.target.value) || "";
                          if (editingRequest) {
                            setEditingRequest({
                              ...editingRequest,
                              vehicle_details: {
                                ...editingRequest.vehicle_details,
                                year_of_manufacture: year,
                              },
                            });
                          } else {
                            setNewRequest({
                              ...newRequest,
                              vehicle_details: {
                                ...newRequest.vehicle_details,
                                year_of_manufacture: year,
                              },
                            });
                          }
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <h3 className="font-medium text-gray-900 mt-6">
                      Service Details
                    </h3>

                    <div>
                      <label
                        htmlFor="issue"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Issue Description *
                      </label>
                      <textarea
                        id="issue"
                        name="issue"
                        rows="3"
                        value={
                          editingRequest
                            ? editingRequest.issue
                            : newRequest.issue
                        }
                        onChange={
                          editingRequest
                            ? (e) =>
                                setEditingRequest({
                                  ...editingRequest,
                                  issue: e.target.value,
                                })
                            : handleRequestChange
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Service Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={
                          editingRequest
                            ? editingRequest.location
                            : newRequest.location
                        }
                        onChange={
                          editingRequest
                            ? (e) =>
                                setEditingRequest({
                                  ...editingRequest,
                                  location: e.target.value,
                                })
                            : handleRequestChange
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestForm(false);
                        setEditingRequest(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingRequest ? "Update Request" : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Vehicle Form Modal */}
        {showVehicleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Add New Vehicle
                  </h2>
                  <button
                    onClick={() => setShowVehicleForm(false)}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={submitVehicle}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="make"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Make *
                      </label>
                      <input
                        type="text"
                        id="make"
                        name="make"
                        value={newVehicle.make}
                        onChange={handleVehicleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="model"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Model *
                      </label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={newVehicle.model}
                        onChange={handleVehicleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="year_of_manufacture"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Year of Manufacture *
                      </label>
                      <input
                        type="number"
                        id="year_of_manufacture"
                        name="year_of_manufacture"
                        value={newVehicle.year_of_manufacture}
                        onChange={handleVehicleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowVehicleForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Vehicle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
