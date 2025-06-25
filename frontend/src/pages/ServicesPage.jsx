import { Wrench, Clock, ShieldCheck, Car } from "lucide-react";

const services = [
  {
    name: "Basic Maintenance",
    description: "Oil changes, filter replacements, fluid checks and top-offs, tire rotations, and basic inspections.",
    icon: Wrench,
    duration: "30-60 mins",
    price: "ksh5000-ksh10000"
  },
  {
    name: "Diagnostic Services",
    description: "Comprehensive vehicle diagnostics to identify issues with engine, transmission, and other systems.",
    icon: ShieldCheck,
    duration: "1-2 hours",
    price: "ksh8000-ksh15000"
  },
  {
    name: "Brake Services",
    description: "Brake pad replacements, rotor resurfacing or replacement, brake fluid flush, and caliper service.",
    icon: Clock,
    duration: "1-3 hours",
    price: "ksh12000-ksh30000"
  },
  {
    name: "Engine Repair",
    description: "From minor tune-ups to major overhauls, including belt replacements and engine component repairs.",
    icon: Car,
    duration: "2-6 hours",
    price: "ksh20000-ksh80000"
  }
];

export default function ServicesPage() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Professional auto care services tailored to your vehicle's needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service.name} className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <service.icon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    {service.name}
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    {service.description}
                  </p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      {service.duration}
                    </span>
                    <span className="text-sm font-semibold text-primary-500">
                      {service.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
  <div className="inline-flex rounded-md shadow">
    <a
      href="/contact"
      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
    >
      Schedule Service
    </a>
  </div>
</div>
      </div>
    </div>
  );
}