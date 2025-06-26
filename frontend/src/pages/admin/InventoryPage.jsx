import { useEffect, useState } from "react";
// import { Search, Plus, RefreshCw, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const InventoryPage = () => {
  
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [newItem, setNewItem] = useState({
    name: "",

    quantity: 0,
    price: 0,
    threshold: 0,
  });
  const [error, setError] = useState(null);

  // get inventory from the db
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token:", token); 

    fetch(`${import.meta.env.VITE_API_URL}/inventories`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setInventory(data);
        console.log("Inventory data fetched successfully:", data);
      });
  }, []);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  // Sort inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  // Handle sort request
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => ({ ...prev, [name]: value }));
  };

  // Add new inventory item
  const addInventoryItem = () => {
    const token = localStorage.getItem("access_token");

    fetch(`${import.meta.env.VITE_API_URL}/inventories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inventory: {
          // Wrap in inventory object if your API expects it
          name: newItem.name,
          quantity: parseInt(newItem.quantity),
          price: parseFloat(newItem.price),
          threshold: parseInt(newItem.threshold),
          // Add other required fields here
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            throw new Error(errData.message || "Failed to add inventory item");
          });
        }
        return response.json();
      })
      .then((data) => {
        // Update local state with the new item from server response
        setInventory([...inventory, data]);
        setIsAddModalOpen(false);
        // Reset form
        setNewItem({
          name: "",
          quantity: 0,
          price: 0,
          threshold: 0,
        });
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error adding inventory item:", error);
        // Optionally show error to user
      });
  };

  // Update inventory item
  const updateInventoryItem = () => {
    const token = localStorage.getItem("access_token");

    fetch(`${import.meta.env.VITE_API_URL}/inventories/${currentItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inventory: {
          name: currentItem.name,
          quantity: parseInt(currentItem.quantity),
          price: parseFloat(currentItem.price),
          threshold: parseInt(currentItem.threshold),
        }
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update inventory item");
        }
        return response.json();
      })
      .then((updatedItem) => {
        setInventory(
          inventory.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
        setIsEditModalOpen(false);
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error updating inventory item:", error);
        // Optionally show error to user
      });
  };

  // Restock inventory item
  const restockInventoryItem = () => {
    const token = localStorage.getItem("access_token");

    fetch(`${import.meta.env.VITE_API_URL}/inventories/${currentItem.id}/restock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: parseInt(currentItem.restockAmount),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to restock inventory item");
        }
        return response.json();
      })
      .then((updatedItem) => {
        setInventory(
          inventory.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
        setIsRestockModalOpen(false);
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error restocking inventory item:", error);
        // Optionally show error to user
      });
  };

  // Delete inventory item
  const deleteInventoryItem = (id) => {
    const token = localStorage.getItem("access_token");

    fetch(`${import.meta.env.VITE_API_URL}/inventories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete inventory item");
        }
        setInventory(inventory.filter((item) => item.id !== id));
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error deleting inventory item:", error);
        // Optionally show error to user
      });
  };

  // Open edit modal
  const openEditModal = (item) => {
    setCurrentItem({ ...item });
    setIsEditModalOpen(true);
  };

  // Open restock modal
  const openRestockModal = (item) => {
    setCurrentItem({ ...item, restockAmount: 0 });
    setIsRestockModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Inventory Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, category or supplier..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add New Item Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Add Item</span>
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("category")}
                  ></th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("quantity")}
                  >
                    <div className="flex items-center">
                      Quantity
                      {sortConfig.key === "quantity" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {sortConfig.key === "price" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>

                  {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInventory.length > 0 ? (
                  sortedInventory.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        item.quantity <= item.threshold ? "bg-red-50" : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            item.quantity <= item.threshold
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {item.quantity}
                          {item.quantity <= item.threshold && (
                            <span className="ml-2 text-xs text-red-500">
                              (Low stock)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ksh {Number(item.price).toFixed(2)}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.supplier}</div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openRestockModal(item)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Restock"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteInventoryItem(item.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No inventory items found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Inventory Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Add New Inventory Item
                  </h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Item Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newItem.name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  {/* <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={newItem.category}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div> */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Initial Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Price *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newItem.price}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="threshold"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Low Stock Threshold *
                    </label>
                    <input
                      type="number"
                      id="threshold"
                      name="threshold"
                      value={newItem.threshold}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                  
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addInventoryItem}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Inventory Modal */}
        {isEditModalOpen && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Inventory Item
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Item Name *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={currentItem.name}
                      onChange={handleEditInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity *
                    </label>
                    <input
                      type="number"
                      id="edit-quantity"
                      name="quantity"
                      value={currentItem.quantity}
                      onChange={handleEditInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Price *
                    </label>
                    <input
                      type="number"
                      id="edit-price"
                      name="price"
                      value={currentItem.price}
                      onChange={handleEditInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-threshold"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Low Stock Threshold *
                    </label>
                    <input
                      type="number"
                      id="edit-threshold"
                      name="threshold"
                      value={currentItem.threshold}
                      onChange={handleEditInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={updateInventoryItem}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restock Inventory Modal */}
        {isRestockModalOpen && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Restock Inventory Item
                  </h2>
                  <button
                    onClick={() => setIsRestockModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      Item:{" "}
                      <span className="font-medium">{currentItem.name}</span>
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      Current Stock:{" "}
                      <span className="font-medium">
                        {currentItem.quantity}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="restockAmount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount to Restock *
                    </label>
                    <input
                      type="number"
                      id="restockAmount"
                      name="restockAmount"
                      value={currentItem.restockAmount}
                      onChange={handleEditInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsRestockModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={restockInventoryItem}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Confirm Restock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
