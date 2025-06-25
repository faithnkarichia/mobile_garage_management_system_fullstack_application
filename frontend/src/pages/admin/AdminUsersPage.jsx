import { useState, useEffect } from "react";
import { Shield, Mail, Phone, UserPlus, X } from "lucide-react";
import Swal from 'sweetalert2'; 

export default function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone_number: "",
    role: "Admin",
    password: "adminpass",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = () => {
    const token = localStorage.getItem("access_token");
    fetch(`${import.meta.env.VITE_API_URL}/admins`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(setAdminUsers)
      .catch((err) => console.error("Error fetching admins:", err));
  };
  const handleAddAdmin = () => {
    const token = localStorage.getItem("access_token");
  
    const requestData = {
      name: newAdmin.name,
      phone_number: newAdmin.phone_number,
      users: [{
        email: newAdmin.email,
        password: newAdmin.password,
        role: newAdmin.role,
      }],
    };
  
    // Show loading alert
    Swal.fire({
      title: 'Adding Admin...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  
    fetch(`${import.meta.env.VITE_API_URL}/admins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to add admin");
      return res.json();
    })
    .then(() => {
      Swal.fire('Success!', 'Admin added successfully', 'success');
      fetchAdmins();
      setIsAddModalOpen(false);
      setNewAdmin({
        name: "",
        email: "",
        phone_number: "",
        role: "Admin",
        password: "adminpass",
      });
    })
    .catch((err) => {
      console.error("Error adding admin:", err);
      Swal.fire('Error', err.message || 'Failed to add admin', 'error');
    });
  };

  const handleEditAdmin = () => {
    const token = localStorage.getItem("access_token");

    const requestData = {
      name: currentAdmin.name,
      phone_number: currentAdmin.phone_number,
      email: currentAdmin.email,
      role: currentAdmin.role,
      password: currentAdmin.password,
    };

    fetch(`${import.meta.env.VITE_API_URL}/admins/${currentAdmin.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update admin");
        return res.json();
      })
      .then(() => {
        fetchAdmins();
        setIsEditModalOpen(false);
      })
      .catch((err) => console.error("Error updating admin:", err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (admin) => {
    if (!admin.users || admin.users.length === 0) return;

    setCurrentAdmin({
      ...admin,
      email: admin.users[0].email,
      role: admin.users[0].role,
    });

    setIsEditModalOpen(true);
  };

  const deleteAdmin = (adminId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("access_token");
  
        
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
  
        fetch(`${import.meta.env.VITE_API_URL}/admins/${adminId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error || "Failed to delete admin.");
            });
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: data.message || 'Admin deleted successfully',
            timer: 2000,
            showConfirmButton: false
          });
          setAdminUsers((prev) => prev.filter((a) => a.id !== adminId));
        })
        .catch((error) => {
          console.error("Delete error:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            confirmButtonColor: '#3085d6'
          });
        });
      }
    });
  };
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-md"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Admin
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminUsers.map((user) => (

                
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.users?.[0]?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {user.phone_number}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        user.users?.[0]?.role === "Super Admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.users?.[0]?.role || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                    onClick={() => deleteAdmin(user.id)}
                    className="text-gray-600 hover:text-gray-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <Modal title="Add Admin" onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddAdmin}>
          <Input name="name" label="Full Name" value={newAdmin.name} onChange={handleInputChange} />
          <Input name="email" label="Email" value={newAdmin.email} onChange={handleInputChange} />
          <Input
            name="phone_number"
            label="Phone"
            value={newAdmin.phone_number}
            onChange={handleInputChange}
          />
          <Input
            name="password"
            label="Password"
            value={newAdmin.password}
            onChange={handleInputChange}
            type="password"
          />
        </Modal>
      )}

      {/* Edit Admin Modal */}
      {isEditModalOpen && currentAdmin && (
        <Modal
          title="Edit Admin"
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditAdmin}
        >
          <Input name="name" label="Full Name" value={currentAdmin.name} onChange={handleEditInputChange} />
          <Input name="email" label="Email" value={currentAdmin.email} onChange={handleEditInputChange} />
          <Input
            name="phone_number"
            label="Phone"
            value={currentAdmin.phone_number}
            onChange={handleEditInputChange}
          />
          <Input
            name="role"
            label="Role"
            value={currentAdmin.role}
            onChange={handleEditInputChange}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">{children}</div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ name, label, value, onChange, type = "text" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
