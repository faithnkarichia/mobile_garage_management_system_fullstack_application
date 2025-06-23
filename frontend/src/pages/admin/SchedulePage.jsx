  import React, { useState } from 'react';
  import { Car, Calendar, Clock, AlertCircle, User, Phone, Mail, Wrench } from "lucide-react";

  export default function SchedulePage() {
    const [formData, setFormData] = useState({
      customerName: '',
      phone: '',
      email: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleMileage: '',
      serviceType: 'routine',
      issueDescription: '',
      preferredDate: '',
      preferredTime: '',
      urgency: 'medium'
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      // Here you would typically send the data to your backend
    };

    const serviceTypes = [
      { value: 'routine', label: 'Routine Maintenance' },
      { value: 'diagnostic', label: 'Diagnostic Service' },
      { value: 'brakes', label: 'Brake Service' },
      { value: 'engine', label: 'Engine Repair' },
      { value: 'transmission', label: 'Transmission Service' },
      { value: 'electrical', label: 'Electrical System' },
      { value: 'other', label: 'Other' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Service</h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4 border-b pb-6 md:border-b-0 md:border-r md:pr-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-500" />
                  Customer Information
                </h2>
                
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="customerName"
                      id="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="(555) 123-4567"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="john@example.com"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-primary-500" />
                  Vehicle Information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700">
                      Make
                    </label>
                    <input
                      type="text"
                      name="vehicleMake"
                      id="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Toyota"
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Camry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <input
                      type="number"
                      name="vehicleYear"
                      id="vehicleYear"
                      min="1980"
                      max={new Date().getFullYear() + 1}
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicleMileage" className="block text-sm font-medium text-gray-700">
                      Mileage
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="vehicleMileage"
                        id="vehicleMileage"
                        min="0"
                        value={formData.vehicleMileage}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="45000"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">mi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-primary-500" />
                Service Details
              </h2>

              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700">
                  Issue Description
                </label>
                <textarea
                  name="issueDescription"
                  id="issueDescription"
                  rows="3"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the issue you're experiencing..."
                ></textarea>
              </div>
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary-500" />
                  Preferred Date & Time
                </h2>

                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    id="preferredDate"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <select
                    name="preferredTime"
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-primary-500" />
                  Urgency Level
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="low"
                      name="urgency"
                      value="low"
                      checked={formData.urgency === 'low'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300"
                    />
                    <label htmlFor="low" className="ml-2 block text-sm text-gray-900">
                      Low - Routine maintenance or non-urgent issues
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="medium"
                      name="urgency"
                      value="medium"
                      checked={formData.urgency === 'medium'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300"
                    />
                    <label htmlFor="medium" className="ml-2 block text-sm text-gray-900">
                      Medium - Needs attention soon but not critical
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="high"
                      name="urgency"
                      value="high"
                      checked={formData.urgency === 'high'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300"
                    />
                    <label htmlFor="high" className="ml-2 block text-sm text-gray-900">
                      High - Vehicle not drivable or safety concern
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Schedule Service
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }