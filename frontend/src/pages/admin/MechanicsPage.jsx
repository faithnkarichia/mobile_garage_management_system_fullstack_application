import { useState } from 'react';
import { Wrench, Star, Phone, Mail, Search, Plus, X, Calendar, MapPin, User } from "lucide-react";

const initialMechanics = [
  {
    id: 1,
    name: "Mike Rodriguez",
    specialty: "Engine Specialist",
    rating: 4.8,
    phone: "(555) 123-4567",
    email: "mike@autocarepro.com",
    status: "Active",
    experience: "8 years",
    address: "123 Mechanic St, Garage City",
    hireDate: "2015-03-15",
    certifications: ["ASE Master Technician", "Engine Performance Specialist"],
    bio: "Mike specializes in engine diagnostics and performance tuning with over 8 years of experience working on all types of vehicles."
  },
  {
    id: 2,
    name: "Lisa Chen",
    specialty: "Transmission Expert",
    rating: 4.9,
    phone: "(555) 234-5678",
    email: "lisa@autocarepro.com",
    status: "Active",
    experience: "10 years",
    address: "456 Auto Ave, Repair Town",
    hireDate: "2013-06-22",
    certifications: ["Transmission Rebuild Specialist", "Drivetrain Expert"],
    bio: "Lisa is our transmission specialist with a decade of experience in automatic and manual transmission systems."
  },
  {
    id: 3,
    name: "John Smith",
    specialty: "Brake Systems",
    rating: 4.5,
    phone: "(555) 345-6789",
    email: "john@autocarepro.com",
    status: "On Leave",
    experience: "5 years",
    address: "789 Brake Blvd, Service City",
    hireDate: "2018-11-05",
    certifications: ["Brake System Specialist", "ABS Technician"],
    bio: "John is our brake system expert, certified in all modern braking technologies including ABS and regenerative systems."
  },
];

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState(initialMechanics);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentMechanic, setCurrentMechanic] = useState(null);
  const [newMechanic, setNewMechanic] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    status: "Active",
    experience: "",
    address: "",
    hireDate: "",
    certifications: [],
    bio: ""
  });

  // Filter mechanics based on search term
  const filteredMechanics = mechanics.filter((mechanic) =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMechanic = () => {
    const newId = Math.max(...mechanics.map(m => m.id), 0) + 1;
    const mechanicToAdd = {
      ...newMechanic,
      id: newId,
      rating: 4.0, // Default rating for new mechanics
      certifications: newMechanic.certifications.length > 0 
        ? newMechanic.certifications.split(',').map(c => c.trim()) 
        : []
    };
    
    setMechanics([...mechanics, mechanicToAdd]);
    setIsAddModalOpen(false);
    setNewMechanic({
      name: "",
      specialty: "",
      phone: "",
      email: "",
      status: "Active",
      experience: "",
      address: "",
      hireDate: "",
      certifications: [],
      bio: ""
    });
  };

  const handleEditMechanic = () => {
    setMechanics(mechanics.map(mechanic => 
      mechanic.id === currentMechanic.id ? currentMechanic : mechanic
    ));
    setIsEditModalOpen(false);
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
                    <span>{mechanic.experience} experience</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {mechanic.phone}
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newMechanic.phone}
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
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    id="experience"
                    name="experience"
                    value={newMechanic.experience}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="5 years"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newMechanic.address}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Mechanic St"
                  />
                </div>

                <div>
                  <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    id="hireDate"
                    name="hireDate"
                    value={newMechanic.hireDate}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications (comma separated)
                  </label>
                  <input
                    type="text"
                    id="certifications"
                    name="certifications"
                    value={newMechanic.certifications}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ASE Certified, Brake Specialist"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={newMechanic.bio}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description about the mechanic..."
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
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
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
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !newMechanic.name || !newMechanic.specialty || !newMechanic.phone || !newMechanic.email
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={!newMechanic.name || !newMechanic.specialty || !newMechanic.phone || !newMechanic.email}
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
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={currentMechanic.phone}
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
                  <label htmlFor="edit-experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    id="edit-experience"
                    name="experience"
                    value={currentMechanic.experience}
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
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
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
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !currentMechanic.name || !currentMechanic.specialty || !currentMechanic.phone || !currentMechanic.email
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={!currentMechanic.name || !currentMechanic.specialty || !currentMechanic.phone || !currentMechanic.email}
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
                      <span className="text-gray-700">{currentMechanic.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{currentMechanic.email}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{currentMechanic.address || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Professional Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-800 font-medium">{currentMechanic.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        currentMechanic.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {currentMechanic.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hire Date:</span>
                      <span className="text-gray-800 font-medium">
                        {currentMechanic.hireDate ? formatDate(currentMechanic.hireDate) : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {currentMechanic.certifications && currentMechanic.certifications.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentMechanic.certifications.map((cert, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentMechanic.bio && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Bio</h4>
                    <p className="text-gray-700 whitespace-pre-line">{currentMechanic.bio}</p>
                  </div>
                )}
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