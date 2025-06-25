import { Wrench, ChevronRight, User, MapPin, Phone, Clock, LogOut } from "lucide-react";
import { useEffect,useState } from "react";

export default function PublicLayout({ children }) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/"; // Redirect to home page after logout
  };
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
            <a
              href="/testimonials"
              className="hover:text-primary-500 transition"
            >
              Testimonials
            </a>
            <a href="/contact" className="hover:text-primary-500 transition">
              Contact
            </a>
          </nav>
          <div className="flex space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </button>
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
