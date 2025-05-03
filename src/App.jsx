import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import AllEmployees from "./pages/AllEmployees";
import Login from "./pages/Login"; // Import the login page
import ProtectedRoute from "./Components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import Reminders from "./pages/Reminders";
import Inbox from "./pages/Inbox";
import AllTasks from "./pages/AllTasks";
import Departments from "./pages/Departments";

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
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Inbox />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-tasks"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AllTasks />
              </MainLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Departments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
