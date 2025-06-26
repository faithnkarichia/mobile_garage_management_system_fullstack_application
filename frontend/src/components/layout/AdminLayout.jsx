import { useState, useEffect } from "react";
import {
  Wrench,
  Users,
  ClipboardCheck,
  Car,
  Calendar,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  User,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setMobileSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log(decoded);

      fetchUserData(token, decoded.sub.id);
      console.log(token);
      console.log(decoded.sub.id);
    } catch (error) {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async (token, userId) => {
    console.log(token);
    console.log(userId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: ClipboardCheck, path: "/admin" },
    { name: "Service Requests", icon: Car, path: "/admin/requests" },
    { name: "Mechanics", icon: Users, path: "/admin/mechanics" },
    // { name: "Schedule", icon: Calendar, path: "/admin/schedule" },
    { name: "Admin Users", icon: ShieldCheck, path: "/admin/users" },
    { name: "Inventory", icon: ShieldCheck, path: "/admin/inventory" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("access_token");
        await fetch(
          `${import.meta.env.VITE_API_URL}/admin/users/${userData.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        handleLogout();
      } catch (error) {
        console.error("Failed to delete account:", error);
      }
    }
  };

  if (!userData) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition-transform duration-300 transform
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:relative lg:block`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold">AutoCare Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block text-gray-400 hover:text-white"
          >
            <ChevronRight
              className={`h-5 w-5 transition-transform ${
                sidebarOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800 transition text-red-400 hover:text-red-300"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              {mobileSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                  className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 px-3 py-1 rounded-lg transition"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline font-medium text-gray-700">
                    {userData.name || "Admin"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 hidden md:inline transition-transform ${
                      showProfilePopup ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {showProfilePopup && (
  <div className="fixed right-4 lg:absolute lg:right-0 lg:left-[calc(14%)] mt-2 w-64 bg-white rounded-xl shadow-xl z-[60] border border-gray-200 overflow-hidden">
    
    <div 
      className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[-1]" 
      onClick={() => setShowProfilePopup(false)}
    />
    
    
    <div className="absolute right-0 lg:static w-full h-full lg:h-auto max-w-md ml-auto lg:max-w-none bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Admin Profile</h3>
        <button
          onClick={() => setShowProfilePopup(false)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{userData.name || "N/A"}</p>
            <p className="text-xs text-gray-500">{userData.email || "N/A"}</p>
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-gray-100">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-700 capitalize">
              {userData.role || "admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-2 border-t border-gray-100 bg-gray-50">
        

        

        <button
          onClick={handleLogout}
          className="w-full mt-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-medium transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
)}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
