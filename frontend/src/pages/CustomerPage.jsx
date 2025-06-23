import { useState } from 'react';
import { Car, Wrench, Calendar, MapPin, Plus, Clock, Check, X } from 'lucide-react';

const CustomerDashboard = () => {
  // get and display the customer requests and vehicles
  // enable customer to add new service requests and vehicles
  // State for service requests
  const [serviceRequests, setServiceRequests] = useState([
    {
      id: 1,
      make: 'Toyota',
      model: 'Camry',
      year: '2020',
      issue: 'Engine knocking sound',
      location: '123 Main St, Anytown',
      status: 'Pending',
      createdAt: '2023-06-15 10:30 AM',
      vehicleId: 1, // Link to vehicle
    },
    {
      id: 2,
      make: 'Honda',
      model: 'Civic',
      year: '2018',
      issue: 'Brake pads replacement',
      location: '456 Oak Ave, Somewhere',
      status: 'In Progress',
      createdAt: '2023-06-10 02:15 PM',
      vehicleId: 2, // Link to vehicle
    },
  ]);

  // State for vehicles
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      make: 'Toyota',
      model: 'Camry',
      year: '2020',
      licensePlate: 'ABC123',
      lastServiceDate: '2023-05-20',
    },
    {
      id: 2,
      make: 'Honda',
      model: 'Civic',
      year: '2018',
      licensePlate: 'XYZ789',
      lastServiceDate: '2023-04-15',
    },
  ]);

  // State for forms
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    make: '',
    model: '',
    year: '',
    issue: '',
    location: '',
    licensePlate: '', // Added license plate to request form
  });
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
  });

  // Check if a vehicle exists based on make, model, year, and license plate
  const vehicleExists = (make, model, year, licensePlate) => {
    return vehicles.some(vehicle => 
      vehicle.make.toLowerCase() === make.toLowerCase() &&
      vehicle.model.toLowerCase() === model.toLowerCase() &&
      vehicle.year === year &&
      (licensePlate ? vehicle.licensePlate.toLowerCase() === licensePlate.toLowerCase() : true)
    );
  };

  // Find vehicle ID by details
  const findVehicleId = (make, model, year, licensePlate) => {
    const vehicle = vehicles.find(vehicle => 
      vehicle.make.toLowerCase() === make.toLowerCase() &&
      vehicle.model.toLowerCase() === model.toLowerCase() &&
      vehicle.year === year &&
      (licensePlate ? vehicle.licensePlate.toLowerCase() === licensePlate.toLowerCase() : true)
    );
    return vehicle ? vehicle.id : null;
  };

  // Handle service request form changes
  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  // Handle vehicle form changes
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));
  };

  // Submit new service request
  const submitServiceRequest = (e) => {
    e.preventDefault();
    const { make, model, year, licensePlate, issue, location } = newRequest;
    
    let vehicleId = findVehicleId(make, model, year, licensePlate);
    let updatedVehicles = [...vehicles];
    
    // If vehicle doesn't exist, create it
    if (!vehicleId) {
      const newVehicleId = Math.max(...vehicles.map(v => v.id), 0) + 1;
      const newVehicleToAdd = {
        id: newVehicleId,
        make,
        model,
        year,
        licensePlate: licensePlate || 'N/A',
        lastServiceDate: 'Never',
      };
      
      updatedVehicles = [...vehicles, newVehicleToAdd];
      vehicleId = newVehicleId;
    }
    
    const newId = Math.max(...serviceRequests.map(r => r.id), 0) + 1;
    const requestToAdd = {
      ...newRequest,
      id: newId,
      vehicleId,
      status: 'Pending',
      createdAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    
    setVehicles(updatedVehicles);
    setServiceRequests([...serviceRequests, requestToAdd]);
    setNewRequest({ make: '', model: '', year: '', issue: '', location: '', licensePlate: '' });
    setShowRequestForm(false);
  };

  // Submit new vehicle
  const submitVehicle = (e) => {
    e.preventDefault();
    const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
    const vehicleToAdd = {
      ...newVehicle,
      id: newId,
      lastServiceDate: 'Never',
    };
    setVehicles([...vehicles, vehicleToAdd]);
    setNewVehicle({ make: '', model: '', year: '', licensePlate: '' });
    setShowVehicleForm(false);
  };

  // Update service request
  const updateServiceRequest = (e) => {
    e.preventDefault();
    setServiceRequests(serviceRequests.map(request => 
      request.id === editingRequest.id ? { ...editingRequest } : request
    ));
    setEditingRequest(null);
  };

  // Get vehicle details by ID
  const getVehicleById = (id) => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Dashboard</h1>
        
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
                {serviceRequests.map(request => {
                  const vehicle = getVehicleById(request.vehicleId);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.make} {request.model} ({request.year})</h3>
                          {vehicle && (
                            <div className="text-sm text-gray-600 mt-1">
                              License: {vehicle.licensePlate}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{request.issue}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {request.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {request.createdAt}
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
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
                {vehicles.map(vehicle => {
                  const vehicleRequests = serviceRequests.filter(req => req.vehicleId === vehicle.id);
                  return (
                    <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-medium text-gray-900">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                      <div className="text-sm text-gray-600 mt-1">License: {vehicle.licensePlate}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        Last serviced: {vehicle.lastServiceDate}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Service requests: {vehicleRequests.length}
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
                    {editingRequest ? 'Edit Service Request' : 'New Service Request'}
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

                <form onSubmit={editingRequest ? updateServiceRequest : submitServiceRequest}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Make *
                      </label>
                      <input
                        type="text"
                        id="make"
                        name="make"
                        value={editingRequest ? editingRequest.make : newRequest.make}
                        onChange={editingRequest ? 
                          (e) => setEditingRequest({...editingRequest, make: e.target.value}) : 
                          handleRequestChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Model *
                      </label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={editingRequest ? editingRequest.model : newRequest.model}
                        onChange={editingRequest ? 
                          (e) => setEditingRequest({...editingRequest, model: e.target.value}) : 
                          handleRequestChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                        Year of Manufacture *
                      </label>
                      <input
                        type="text"
                        id="year"
                        name="year"
                        value={editingRequest ? editingRequest.year : newRequest.year}
                        onChange={editingRequest ? 
                          (e) => setEditingRequest({...editingRequest, year: e.target.value}) : 
                          handleRequestChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                        License Plate
                      </label>
                      <input
                        type="text"
                        id="licensePlate"
                        name="licensePlate"
                        value={editingRequest ? (getVehicleById(editingRequest.vehicleId)?.licensePlate || '') : newRequest.licensePlate}
                        onChange={editingRequest ? 
                          (e) => setEditingRequest({...editingRequest, licensePlate: e.target.value}) : 
                          handleRequestChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Description *
                      </label>
                      <textarea
                        id="issue"
                        name="issue"
                        rows="3"
                        value={editingRequest ? editingRequest.issue : newRequest.issue}
                        onChange={editingRequest ? 
                          (e) => setEditingRequest({...editingRequest, issue: e.target.value}) : 
                          handleRequestChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Service Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={editingRequest ? editingRequest.location : newRequest.location}
                        onChange={editingRequest ? 
                          (e) => setEditingRequest({...editingRequest, location: e.target.value}) : 
                          handleRequestChange}
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
                      {editingRequest ? 'Update Request' : 'Submit Request'}
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
                  <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
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
                      <label htmlFor="vMake" className="block text-sm font-medium text-gray-700 mb-1">
                        Make *
                      </label>
                      <input
                        type="text"
                        id="vMake"
                        name="make"
                        value={newVehicle.make}
                        onChange={handleVehicleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vModel" className="block text-sm font-medium text-gray-700 mb-1">
                        Model *
                      </label>
                      <input
                        type="text"
                        id="vModel"
                        name="model"
                        value={newVehicle.model}
                        onChange={handleVehicleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vYear" className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="text"
                        id="vYear"
                        name="year"
                        value={newVehicle.year}
                        onChange={handleVehicleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                        License Plate *
                      </label>
                      <input
                        type="text"
                        id="licensePlate"
                        name="licensePlate"
                        value={newVehicle.licensePlate}
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