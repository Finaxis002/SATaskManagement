import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaUsers,
  FaCode,
  FaChartBar,
  FaGolfBall,
  FaEnvelope,
  FaUniversity,
  FaChevronRight,
} from "react-icons/fa";

const SettingsPage = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      path: "/completed",
      label: "Completed Tasks",
      icon: <FaCheckCircle className="text-blue-600" />,
    },
    {
      path: "/departments",
      label: "Department Overview",
      icon: <FaUsers className="text-blue-600" />,
      state: { activeTab: "department" },
    },
    {
      path: "/departments",
      label: "Leave Management",
      icon: <FaGolfBall className="text-blue-600" />,
      state: { activeTab: "Manage Leave" },
    },
    {
      path: "/departments",
      label: "Mail User Creation",
      icon: <FaEnvelope className="text-blue-600" />,
      state: { activeTab: "mail" },
    },
    {
      path: "/departments",
      label: "Code Overview",
      icon: <FaCode className="text-blue-600" />,
      state: { activeTab: "code" },
    },
    {
      path: "/departments",
      label: "Report Generation",
      icon: <FaChartBar className="text-blue-600" />,
      state: { activeTab: "report" },
    },
    {
      path: "/departments",
      label: "Bank Details",
      icon: <FaUniversity className="text-blue-600" />,
      state: { activeTab: "bank" },
    },
  ];

  const handleNavigation = (option) => {
    if (option.state) {
      navigate(option.path, { state: option.state });
    } else {
      navigate(option.path);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header with centered title only */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Application Settings
        </h1>
      </div>

      {/* Settings list */}
      <div className="space-y-4">
        {settingsOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleNavigation(option)}
            className="w-full flex items-center space-x-4 bg-white rounded-xl py-3 px-4 shadow-sm hover:bg-blue-50 transition-colors"
          >
            <div className="text-blue-600 text-xl flex-shrink-0">
              {option.icon}
            </div>
            <span className="flex-grow text-gray-900 text-base text-left font-medium">
              {option.label}
            </span>
            <FaChevronRight className="text-blue-600 text-sm" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
