import { useEffect, useState, useMemo, useCallback, lazy, Suspense, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  resetPassword,
  updateUser,
} from "../redux/userSlice";
import {
  FaTrash,
  FaSyncAlt,
  FaEdit,
  FaUsers,
  FaUserShield,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { showAlert } from "../utils/alert";
import Swal from "sweetalert2";

// Lazy load with preload capability
const AddEmployee = lazy(() => import("./AddEmployee"));

// Preload modal on hover/interaction
const preloadAddEmployee = () => {
  const component = import("./AddEmployee");
  return component;
};

// --- Memoized Components ---

const StatsCard = memo(({ title, value, icon: Icon, gradient, shadowColor }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg ${shadowColor}`}>
        <Icon className="text-white text-2xl" />
      </div>
    </div>
  </div>
));

const UserRow = memo(({ user, onEdit, onResetPassword, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(user), [user, onEdit]);
  const handleReset = useCallback(() => onResetPassword(user._id, user.name), [user._id, user.name, onResetPassword]);
  const handleDeleteClick = useCallback(() => onDelete(user._id), [user._id, onDelete]);

  return (
    <tr className="hover:bg-slate-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-slate-600">{user.userId}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-semibold text-slate-800">{user.name}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-slate-600">{user.email}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-slate-600">{user.position}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {Array.isArray(user.department) ? (
            user.department.map((dept, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {dept}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {user.department}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            user.role?.toLowerCase() === "admin"
              ? "bg-violet-100 text-violet-700 border border-violet-200"
              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150"
            title="Edit"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors duration-150"
            title="Reset Password"
          >
            <FaSyncAlt className="text-sm" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150"
            title="Delete"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </td>
    </tr>
  );
});

const MobileUserCard = memo(({ user, onEdit, onResetPassword, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(user), [user, onEdit]);
  const handleReset = useCallback(() => onResetPassword(user._id, user.name), [user._id, user.name, onResetPassword]);
  const handleDeleteClick = useCallback(() => onDelete(user._id), [user._id, onDelete]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{user.name}</h3>
          <p className="text-sm text-slate-600">{user.position}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            user.role?.toLowerCase() === "admin"
              ? "bg-violet-100 text-violet-700 border border-violet-200"
              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}
        >
          {user.role}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm">
          <span className="font-medium text-slate-700 w-24">Emp ID:</span>
          <span className="text-slate-600">{user.userId}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-slate-700 w-24">Email:</span>
          <span className="text-slate-600 truncate">{user.email}</span>
        </div>
        <div className="flex items-start text-sm">
          <span className="font-medium text-slate-700 w-24">Departments:</span>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(user.department) ? (
              user.department.map((dept, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {dept}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {user.department}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={handleEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm transition-colors duration-150"
        >
          <FaEdit />
          Edit
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium text-sm transition-colors duration-150"
        >
          <FaSyncAlt />
          Reset
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
});

const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <svg
        className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      <p className="text-lg text-slate-600 font-medium">Loading Users...</p>
    </div>
  </div>
));

// Skeleton loader for faster perceived loading
const SkeletonLoader = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8 mb-8">
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-200 rounded mb-4"></div>
        ))}
      </div>
    </div>
  </div>
));

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-12">
    <svg
      className="w-16 h-16 text-slate-300 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
    <p className="text-slate-500 font-medium">No employees found on this page.</p>
  </div>
));

// --- Main Component ---
const AllEmployees = () => {
  const dispatch = useDispatch();
  const { list: users, loading: reduxLoading } = useSelector((state) => state.users);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [department, setDepartment] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // --- Memoized Calculations ---
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  
  const currentEmployees = useMemo(
    () => users.slice(indexOfFirstEmployee, indexOfLastEmployee),
    [users, indexOfFirstEmployee, indexOfLastEmployee]
  );

  const totalPages = useMemo(
    () => Math.ceil(users.length / employeesPerPage),
    [users.length, employeesPerPage]
  );

  const stats = useMemo(() => {
    const totalAdmins = users.filter((user) => user.role?.toLowerCase() === "admin").length;
    const departments = [...new Set(users.flatMap((user) => Array.isArray(user.department) ? user.department : (user.department ? [user.department] : [])))];
    return {
      totalUsers: users.length,
      totalAdmins,
      totalDepartments: departments.length,
    };
  }, [users]);

  // --- Effects ---
  useEffect(() => {
    // Preload modal component after initial render
    const timer = setTimeout(() => {
      preloadAddEmployee();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUsers()).unwrap();
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // --- Memoized Handlers ---
  const handleNextPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  }, [totalPages]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This user will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          await dispatch(deleteUser(id)).unwrap();
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete user.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    },
    [dispatch]
  );

  // const handleResetPassword = useCallback(
  //   async (id, name) => {
  //     const { value: newPassword } = await Swal.fire({
  //       title: `Enter new password for ${name}:`,
  //       input: "password",
  //       inputPlaceholder: "Enter new password",
  //       inputAttributes: {
  //         maxlength: "50",
  //         autocapitalize: "off",
  //         autocorrect: "off"
  //       },
  //       showCancelButton: true,
  //       confirmButtonText: 'Reset',
  //       cancelButtonText: 'Cancel',
  //       confirmButtonColor: '#4332d2',
  //       inputValidator: (value) => {
  //         if (!value || value.trim().length < 4) {
  //           return 'Password must be at least 4 characters.'
  //         }
  //       }
  //     });
      
  //     if (newPassword) {
  //       try {
  //         await resetPassword(id, newPassword);
  //         showAlert("Password reset successfully.");
  //       } catch (error) {
  //         showAlert(`Failed to reset password: ${error.message || "Unknown error"}`);
  //       }
  //     }
  //   },
  //   [dispatch]
  // );

const handleResetPassword = useCallback(
  async (id, name) => {
    const { value: newPassword } = await Swal.fire({
      title: `Enter new password for ${name}:`,
      input: "password",
      inputPlaceholder: "Enter new password",
      inputAttributes: {
        maxlength: "50",
        autocapitalize: "off",
        autocorrect: "off"
      },
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4332d2',
      inputValidator: (value) => {
        if (!value || value.trim().length < 4) {
          return 'Password must be at least 4 characters.'
        }
      }
    });
    
    if (newPassword) {
      try {
        // Dispatch the resetPassword action
        await dispatch(resetPassword({ id, newPassword })).unwrap();
        showAlert("Password reset successfully.");
      } catch (error) {
        showAlert(`Failed to reset password: ${error.message || "Unknown error"}`);
      }
    }
  },
  [dispatch]
);


  const handleEdit = useCallback((user) => {
    setSelectedUser(user);
    setDepartment(
      Array.isArray(user.department) ? user.department : (user.department ? [user.department] : [])
    );
    setShowEditModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedUser(null);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // Show skeleton loader only on initial load
  if (isInitialLoad && reduxLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8 mb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                User Directory
              </h1>
              <p className="text-slate-600">
                Manage your team members and their information
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              onMouseEnter={preloadAddEmployee}
              className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              style={{
                backgroundColor: "#4332d2",
                boxShadow: "0 10px 15px -3px rgba(67, 50, 210, 0.3), 0 4px 6px -2px rgba(67, 50, 210, 0.05)",
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#4332d2";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(67, 50, 210, 0.3), 0 4px 6px -2px rgba(67, 50, 210, 0.05)";
              }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total User"
            value={stats.totalUsers}
            icon={FaUsers}
            gradient="from-blue-500 to-blue-600"
            shadowColor="shadow-blue-500/30"
          />
          <StatsCard
            title="Administrators"
            value={stats.totalAdmins}
            icon={FaUserShield}
            gradient="from-violet-500 to-violet-600"
            shadowColor="shadow-violet-500/30"
          />
          <StatsCard
            title="Departments"
            value={stats.totalDepartments}
            icon={FaBuilding}
            gradient="from-emerald-500 to-emerald-600"
            shadowColor="shadow-emerald-500/30"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Emp ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      onEdit={handleEdit}
                      onResetPassword={handleResetPassword}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{indexOfFirstEmployee + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastEmployee, users.length)}</span> of{" "}
                <span className="font-medium">{users.length}</span> employees
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <FaChevronLeft className="h-3 w-3" />
                  Previous
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Next
                  <FaChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden space-y-4">
          {currentEmployees.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <EmptyState />
            </div>
          ) : (
            currentEmployees.map((user) => (
              <MobileUserCard
                key={user._id}
                user={user}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
                onDelete={handleDelete}
              />
            ))
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{indexOfFirstEmployee + 1}</span>-
                <span className="font-medium">{Math.min(indexOfLastEmployee, users.length)}</span> of{" "}
                <span className="font-medium">{users.length}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <FaChevronLeft className="h-3 w-3" />
                  Prev
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Next
                  <FaChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <Suspense fallback={<LoadingSpinner />}>
            <AddEmployee
              showEditModal={true}
              setShowEditModal={setShowEditModal}
              employeeToEdit={selectedUser}
              handleCloseModal={handleCloseModal}
            />
          </Suspense>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <Suspense fallback={<LoadingSpinner />}>
            <AddEmployee
              showEditModal={false}
              setShowEditModal={setShowAddModal}
              employeeToEdit={null}
              handleCloseModal={handleCloseAddModal}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default AllEmployees;