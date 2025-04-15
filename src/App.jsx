import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import AllEmployees from "./pages/AllEmployees";
import Login from "./pages/Login"; // Import the login page
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import Tasks from "./pages/Tasks";
import Reminders from "./pages/Reminders";
import ReminderAlertManager from "./Components/ReminderAlertManager";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Login route */}
        {/* Protected Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Other routes */}
        <Route
          path="/add-employee"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddEmployee />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-employees"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AllEmployees />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reminders />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Tasks />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </Router>
  );
};

export default App;
