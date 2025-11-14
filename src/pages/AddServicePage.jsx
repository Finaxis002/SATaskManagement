import React, { useEffect, useState } from "react";
import axios from "../utils/secureAxios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const AddServicePage = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const services = [
    { name: "Project Report", icon: "📊", description: "Comprehensive project analysis and reporting" },
    { name: "MSME", icon: "🏢", description: "Micro, Small & Medium Enterprises registration" },
    { name: "GST Registration", icon: "📋", description: "Goods and Services Tax registration" },
    { name: "Income Tax Return", icon: "💰", description: "Annual income tax return filing" },
    { name: "Subsidy Services", icon: "🎯", description: "Government subsidy application assistance" },
    { name: "Trade Mark", icon: "®️", description: "Trademark registration and protection" },
    { name: "Income Tax Audit", icon: "🔍", description: "Professional tax audit services" },
    { name: "IEC Code", icon: "🌐", description: "Import Export Code registration" },
    { name: "GST Return", icon: "📄", description: "Monthly/Quarterly GST return filing" }
  ];

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await axios.get(`https://taskbe.sharda.co.in/api/clients/${clientId}`);
        setClient(res.data);

        const servicesRes = await axios.get(`https://taskbe.sharda.co.in/api/clients/${clientId}/services`);
        setSelectedServices(servicesRes.data.services);
      } catch (err) {
        // console.error("Error fetching client details", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load client details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleServiceChange = (event) => {
    const value = event.target.value;
    setSelectedServices((prevSelectedServices) =>
      prevSelectedServices.includes(value)
        ? prevSelectedServices.filter((service) => service !== value)
        : [...prevSelectedServices, value]
    );
  };

  const saveSelectedServices = async () => {
    try {
      await axios.put(
        `https://taskbe.sharda.co.in/api/clients/${clientId}/services`,
        { services: selectedServices }
      );
      Swal.fire({
        icon: "success",
        title: "Services Saved",
        text: "Your selected services have been saved successfully.",
      });
    } catch (err) {
      console.error("Error saving selected services", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save selected services. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Loading Client Details</h3>
              <p className="text-gray-500 text-sm">Please wait while we fetch the information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h3>
          <p className="text-gray-500">The requested client could not be located in our system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[90vh] bg-gray-50 overflow-y-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
          <p className="text-gray-600 text-lg">
            Configure services for <span className="font-semibold text-blue-600">{client.name}</span>
          </p>
          <div className="mt-4 w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Client Details Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100   top-8">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Client Information
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {[
                    { label: "Business Name", value: client.businessName, icon: "🏢" },
                    { label: "Contact Person", value: client.contactPerson, icon: "👤" },
                    { label: "Email Address", value: client.emailId, icon: "📧" },
                    { label: "Mobile Number", value: client.mobile, icon: "📱" },
                    { label: "GST Number", value: client.GSTIN, icon: "🆔" }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                          <p className="text-gray-900 font-medium break-words">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Services Selected</span>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                      <span className="font-semibold text-sm">{selectedServices.length} of {services.length}</span>
                    </div>
                  </div>
                  {selectedServices.length > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(selectedServices.length / services.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Services
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedServices(services.map(s => s.name))}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedServices([])}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {services.map((service, index) => {
                    const isSelected = selectedServices.includes(service.name);
                    return (
                      <div 
                        key={service.name} 
                        className={`relative group p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 pt-1">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id={service.name}
                                value={service.name}
                                checked={isSelected}
                                onChange={handleServiceChange}
                                className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer hover:border-gray-400"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xl">{service.icon}</span>
                              <label 
                                htmlFor={service.name} 
                                className="text-lg font-semibold text-gray-900 cursor-pointer"
                              >
                                {service.name}
                              </label>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                            
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Selected
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Button */}
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button
                    onClick={saveSelectedServices}
                    // disabled={selectedServices.length === 0}
                    // className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 ${
                    //   selectedServices.length > 0
                    //     ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                    //     : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-200'
                    // }`}
                    className="px-8 py-4 rounded-xl font-semibold text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Save Services ({selectedServices.length})</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServicePage;