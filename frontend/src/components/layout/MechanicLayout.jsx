import { useState, useEffect } from "react";
import {
  Wrench,
  ClipboardCheck,
  Car,
  Calendar,
  Package,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  User,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function MechanicLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set sidebarOpen based on screen width
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setMobileSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // call it on mount
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
      setUserData(decoded);
    } catch (error) {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [navigate]);

  const navItems = [
    { name: "Dashboard", icon: ClipboardCheck, path: "/mechanic" },
    { name: "Service Requests", icon: Car, path: "/mechanic/requests" },
    { name: "Inventory", icon: Package, path: "/mechanic/inventory" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
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
      {/* <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}> */}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition-transform duration-300 transform
  ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 lg:relative lg:block`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">AutoCare Mechanic</span>
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
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden md:inline">
                    {userData.name || "Mechanic"}
                  </span>
                  <ChevronDown className="h-4 w-4 hidden md:inline" />
                </button>
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
