import { useState } from 'react';
import { 
  Wrench, Users, ClipboardCheck, Car, 
  Calendar, ShieldCheck, ChevronDown, ChevronRight,
  LogOut, Menu, X, User
} from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: ClipboardCheck, path: "/admin" },
    { name: "Service Requests", icon: Car, path: "/admin/requests" },
    { name: "Mechanics", icon: Users, path: "/admin/mechanics" },
    { name: "Schedule", icon: Calendar, path: "/admin/schedule" },
    { name: "Admin Users", icon: ShieldCheck, path: "/admin/users" },
    { name: "Inventory", icon: ShieldCheck, path: "/admin/inventory" }
  ];

  const handleLogout = () => {
    // Implement logout logic
    navigate('/login');
  };

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
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold">AutoCare Admin</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block text-gray-400 hover:text-white"
          >
            <ChevronRight className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
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
              {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden md:inline">Admin User</span>
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