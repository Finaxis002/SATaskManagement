// src/pages/InvoicesPage.jsx
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBill,
  FaDochub,
  FaArrowLeft,
  FaChevronRight,
} from "react-icons/fa";

const InvoicesPage = () => {
  const navigate = useNavigate();

  const invoiceOptions = [
    {
      path: "/invoice",
      label: "Create Invoice",
      description: "Generate new invoices for clients",
      icon: <FaMoneyBill className="text-blue-600" />,
      color: "bg-blue-100",
    },
    {
      path: "/viewinvoicewithotp",
      label: "View Invoices",
      description: "Access and manage existing invoices",
      icon: <FaDochub className="text-green-600" />,
      color: "bg-green-100",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header with back button and title */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
      </div>

      {/* Invoices list */}
      <div className="space-y-4">
        {invoiceOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleNavigation(option.path)}
            className="w-full flex items-center space-x-4 bg-white rounded-xl py-4 px-4 shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className={`p-3 rounded-full ${option.color} flex-shrink-0`}>
              <div className="text-blue-600 text-xl">{option.icon}</div>
            </div>
            <div className="flex-grow text-left">
              <h3 className="text-gray-900 text-base font-medium">
                {option.label}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{option.description}</p>
            </div>
            <FaChevronRight className="text-gray-400 text-sm" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvoicesPage;