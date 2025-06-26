import { Wrench, ChevronRight, User, MapPin, Phone, Clock, LogOut, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function PublicLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    
    if (token) {
      // Fetch user data when logged in
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUserData(null);
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  // const handleDeleteAccount = async () => {
  //   if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
  //     try {
  //       const token = localStorage.getItem("access_token");
  //       await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       handleLogout();
  //     } catch (error) {
  //       console.error("Failed to delete account:", error);
  //     }
  //   }
  // };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold">AutoCare Pro</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="hover:text-primary-500 transition">
              Home
            </a>
            <a href="/services" className="hover:text-primary-500 transition">
              Services
            </a>
            <a href="/testimonials" className="hover:text-primary-500 transition">
              Testimonials
            </a>
            <a href="/contact" className="hover:text-primary-500 transition">
              Contact
            </a>
          </nav>
          <div className="flex space-x-4 items-center">
            {isLoggedIn ? (
              <>
              <div className="relative">
                <button
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                  className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-500">{userData?.name || "Profile"}</span>
                </button>
                
                {showProfilePopup && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                    {/* Popup Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Account</h3>
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
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userData?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{userData?.email || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-gray-500">Role</span>
                          <span className="font-medium text-gray-700 capitalize">{userData?.role || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="px-2 py-2 border-t border-gray-100 bg-gray-50">
                      
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition mt-1"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-gray-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition flex items-center"
                >
                  Register <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-8 w-8 text-primary-500" />
                <span className="text-2xl font-bold">AutoCare Pro</span>
              </div>
              <p className="text-gray-400">
                Streamlining auto repair services for customers, mechanics, and
                shop owners.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="home"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="services"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="testimonials"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="contact"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" /> Nairobi
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" /> (+254)768692489
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" /> Mon-Fri: 8AM-6PM
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Subscribe for updates and offers
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-lg w-full text-gray-900 focus:outline-none"
                />
                <button className="px-4 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} AutoCare Pro. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
