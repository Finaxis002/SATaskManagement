import AddEmployee from "../pages/AddEmployee";

const AddEmployeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        <AddEmployee />
      </div>
    </div>
  );
};

export default AddEmployeeModal;
