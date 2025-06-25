import { useEffect, useState } from "react";
import { Search, Package, Minus, X } from "lucide-react";
import Swal from 'sweetalert2'; 

const MechanicInventory = () => {
  const [inventory, setInventory] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [useQuantity, setUseQuantity] = useState(1);
console.log(searchTerm)
  const filteredInventory = inventory.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm && searchTerm.length > 0 && searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm && searchTerm.length > 0 && searchTerm.toLowerCase())
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token:", token);

    fetch(`{process.env.VITE_API_URL}/inventories`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched inventory:", data);
        setInventory(data);
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
      });
  }, []);

  const openUseModal = (item) => {
    setCurrentItem(item);
    setUseQuantity(1);
    setIsUseModalOpen(true);
  };

  const handleUseInventory = () => {
    if (
      useQuantity > 0 &&
      useQuantity <= currentItem.quantity &&
      currentItem.serviceRequestId
    ) {
      const token = localStorage.getItem("access_token");
      const updatedQuantity = currentItem.quantity - useQuantity;
  
      
      fetch(`${process.env.VITE_API_URL}/inventories/${currentItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inventory: {
            quantity: updatedQuantity,
          },
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update inventory");
          }
          return response.json();
        })
        .then((updatedItem) => {
         
          return fetch(`${process.env.VITE_API_URL}/service_request_inventories`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              service_request_id: currentItem.serviceRequestId,
              inventory_id: currentItem.id,
              used_quantity: useQuantity, 
            }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to link inventory");
              return res.json();
            })
            .then(() => {
              setInventory(
                inventory.map((item) =>
                  item.id === currentItem.id ? updatedItem : item
                )
              );
              setIsUseModalOpen(false);
              setUseQuantity(1);
              setCurrentItem(null);
            });
        })
        .catch((error) => {
          console.error("Error processing inventory usage:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong. Please try again.',
            confirmButtonColor: '#3085d6',
          });
        });
        } else {
          console.error("Invalid quantity or missing service request ID");
          Swal.fire({
            icon: 'warning',
            title: 'Invalid Input',
            text: 'Please enter a valid quantity and service request ID.',
            confirmButtonColor: '#3085d6',
          });
        }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Inventory Management
        </h1>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
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
                    Item
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.id.toString().padStart(4, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          item.quantity <= 5 ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {item.quantity} {item.quantity <= 5 && "(Low stock)"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ksh {Number(item.price).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openUseModal(item)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        disabled={item.quantity <= 0}
                      >
                        <Minus className="h-4 w-4 mr-1" /> Use
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Use Inventory Modal */}
        {isUseModalOpen && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Use Inventory Item
                  </h2>
                  <button
                    onClick={() => setIsUseModalOpen(false)}
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
                      Available:{" "}
                      <span className="font-medium">
                        {currentItem.quantity}
                      </span>
                    </p>
                  </div>
                  <div>
                    <div>
                      <label
                        htmlFor="serviceRequestId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Service Request ID *
                      </label>
                      <input
                        type="number"
                        id="serviceRequestId"
                        name="serviceRequestId"
                        value={currentItem.serviceRequestId || ""}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            serviceRequestId: parseInt(e.target.value) || "",
                          })
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <label
                      htmlFor="useQuantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity to Use *
                    </label>
                    <input
                      type="number"
                      id="useQuantity"
                      name="useQuantity"
                      value={useQuantity}
                      onChange={(e) =>
                        setUseQuantity(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                      max={currentItem.quantity}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsUseModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUseInventory}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Confirm Usage
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

export default MechanicInventory;
