import { useEffect, useState } from 'react';
import { Wrench, Star, Phone, Mail, Search, Plus, X, Calendar, MapPin, User } from "lucide-react";
import Swal from 'sweetalert2'; 

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentMechanic, setCurrentMechanic] = useState(null);
  const [newMechanic, setNewMechanic] = useState({
    name: "",
    specialty: "",
    phone_number: "",
    email: "",
    password: "mechpass", 
    status: "Available",
    experience_years: "",
    location: "",
    rating: 4.0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const fetchMechanics = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mechanics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch mechanics');
        }

        const data = await response.json();
        setMechanics(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching mechanics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMechanics();
  }, []);


  const filteredMechanics = mechanics.filter((mechanic) =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleAddMechanic = () => {
    const token = localStorage.getItem('access_token');
    const mechanicData={
      ...newMechanic,experience_years: parseInt(newMechanic.experience_years, 10) || 0
    }
    
    fetch(`${import.meta.env.VITE_API_URL}/mechanics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mechanicData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Failed to add mechanic');
        });
      }
      return response.json();
    })
    .then(addedMechanic => {
      setMechanics([...mechanics, addedMechanic]);
      setIsAddModalOpen(false);
      setNewMechanic({
        name: "",
        specialty: "",
        phone_number: "",
        email: "",
        password:"mechpass",
        status: "Available",
        experience_years: "",
        location: "",
        rating: 4.0
      });
    })
    .catch(error => {
      setError(error.message);
      console.error('Error adding mechanic:', error);
    });
  };

  
  const handleEditMechanic = () => {
    const token = localStorage.getItem('access_token');
    
    fetch(`${import.meta.env.VITE_API_URL}/mechanics/${currentMechanic.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(currentMechanic)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Failed to update mechanic');
        });
      }
      return response.json();
    })
    .then(updatedMechanic => {
      setMechanics(mechanics.map(m => 
        m.id === updatedMechanic.id ? updatedMechanic : m
      ));
      setIsEditModalOpen(false);
    })
    .catch(error => {
      setError(error.message);
      console.error('Error updating mechanic:', error);
    });
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMechanic(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMechanic(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const openEditModal = (mechanic) => {
    setCurrentMechanic({...mechanic});
    setIsEditModalOpen(true);
  };

  
  const openViewModal = (mechanic) => {
    setCurrentMechanic({...mechanic});
    setIsViewModalOpen(true);
  };

  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mechanics</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, specialty, or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Add Mechanic Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-medium">Add Mechanic</span>
          </button>
        </div>
      </div>

      {/* Mechanics Grid */}
      {filteredMechanics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMechanics.map((mechanic) => (
            <div
              key={mechanic.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wrench className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {mechanic.name}
                    </h3>
                    <p className="text-sm text-gray-600">{mechanic.specialty}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{mechanic.rating} rating</span>
                    <span className="mx-2">•</span>
                    <span>{mechanic.experience_years} years experience</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {mechanic.phone_number}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {mechanic.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    mechanic.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {mechanic.status}
                </span>
                <div className="space-x-3">
                  <button 
                    onClick={() => openEditModal(mechanic)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => openViewModal(mechanic)}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium px-2 py-1 rounded hover:bg-gray-100"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No mechanics found matching your search.</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Add Mechanic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Mechanic</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newMechanic.name}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={newMechanic.specialty}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Engine Specialist"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={newMechanic.phone_number}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newMechanic.email}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="john@example.com"
                  />
                </div>
              


                <div>
                  <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="experience_years"
                    name="experience_years"
                    value={newMechanic.experience_years}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="5"
                  />
                </div>

                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newMechanic.location}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Mechanic St"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newMechanic.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMechanic}
                  disabled={!newMechanic.name || !newMechanic.specialty || !newMechanic.phone_number || !newMechanic.email || !newMechanic.password}

                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !newMechanic.name || !newMechanic.specialty || !newMechanic.phone_number || !newMechanic.email
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Add Mechanic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mechanic Modal */}
      {isEditModalOpen && currentMechanic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Mechanic</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={currentMechanic.name}
                    onChange={handleEditInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    id="edit-specialty"
                    name="specialty"
                    value={currentMechanic.specialty}
                    onChange={handleEditInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="edit-phone_number"
                    name="phone_number"
                    value={currentMechanic.phone_number}
                    onChange={handleEditInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={currentMechanic.email}
                    onChange={handleEditInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-experience_years" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    id="edit-experience_years"
                    name="experience_years"
                    value={currentMechanic.experience_years}
                    onChange={handleEditInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    name="status"
                    value={currentMechanic.status}
                    onChange={handleEditInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditMechanic}
                  disabled={!currentMechanic.name || !currentMechanic.specialty || !currentMechanic.phone_number || !currentMechanic.email}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !currentMechanic.name || !currentMechanic.specialty || !currentMechanic.phone_number || !currentMechanic.email
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mechanic Modal */}
      {isViewModalOpen && currentMechanic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mechanic Details</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">{currentMechanic.name}</h3>
                  <p className="text-gray-600">{currentMechanic.specialty}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{currentMechanic.rating} rating</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{currentMechanic.phone_number}</span>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{currentMechanic.email}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{currentMechanic.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Professional Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-800 font-medium">{currentMechanic.experience_years} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        currentMechanic.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {currentMechanic.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}