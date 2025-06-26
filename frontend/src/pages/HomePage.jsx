import { jwtDecode } from "jwt-decode";
import {
  Wrench,
  ChevronRight,
  Car,
  Users,
  ClipboardCheck,
  Star,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    console.log('odododododo', token)
    setIsLoggedIn(!!token);

    if (token) {
        try {
          const decoded = jwtDecode(token);
          setRole(decoded.sub.role);
        } catch (e) {
          console.log("token expired!", e.message);
        }
    }
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center min-h-screen">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1639927676452-984f8210befc?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Mechanic working on car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
              Professional Auto Care{" "}
              <span className="text-primary-500">Simplified</span>
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Streamline your vehicle service requests with our easy-to-use
              platform. Customers, mechanics, and admins all in one seamless
              system.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Requests</h3>
              <p className="text-gray-600">
                Easily create service requests with all necessary details and
                track progress in real-time.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mechanic Dashboard</h3>
              <p className="text-gray-600">
                Mechanics receive assigned jobs with complete details and can
                update status efficiently.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <ClipboardCheck className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Admin Control</h3>
              <p className="text-gray-600">
                Admins manage all requests, assign mechanics, and oversee shop
                operations seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-primary-500 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white text-gray-900 p-8 rounded-xl shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="italic mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="bg-primary-100 p-2 rounded-full mr-4">
                    <User className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Simplify Your Auto Care?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Join hundreds of satisfied customers and professional mechanics
            using our platform.
          </p>
          <button className="px-8 py-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition text-lg font-medium">
            Get Started Today <ChevronRight className="ml-2 h-5 w-5 inline" />
          </button>

          {isLoggedIn && role && (
            <button
              onClick={() => {
                if (role === "admin") {
                  window.location.href = "/admin";
                } else if (role === "mechanic") {
                  window.location.href = "/mechanic";
                } else if (role === "customer") {
                  window.location.href = "/customer";
                }
              }}
              className="mt-4 px-8 py-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition text-lg font-medium"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </section>
    </>
  );
}

const testimonials = [
  {
    text: "This platform made scheduling my car service so easy! I could track the progress every step of the way.",
    name: "Sarah Johnson",
    role: "Regular Customer",
    rating: 5,
  },
  {
    text: "As a mechanic, this system saves me so much time. All the job details are in one place and easy to access.",
    name: "Mike Rodriguez",
    role: "Master Mechanic",
    rating: 4,
  },
  {
    text: "Managing our shop has never been easier. The admin dashboard gives me complete control over all operations.",
    name: "Lisa Chen",
    role: "Shop Owner",
    rating: 5,
  },
];
