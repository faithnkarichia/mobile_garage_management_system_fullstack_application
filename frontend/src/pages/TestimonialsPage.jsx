import { Star, User } from "lucide-react";

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
  {
    text: "The transparency of the service process is amazing. I always know what's being done to my car and how much it will cost.",
    name: "David Wilson",
    role: "Customer for 2 years",
    rating: 5,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Hear from people who have used our services
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-sm">
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
              <blockquote className="text-lg text-gray-700 italic mb-6">
                "{testimonial.text}"
              </blockquote>
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-4">
                  <User className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
