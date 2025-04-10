// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import AllEmployees from "./pages/AllEmployees";
import Tasks from "./pages/Tasks";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import Reporting from "./pages/Reporting";
import Goals from "./pages/Goals";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/add-employee"
          element={
            <MainLayout>
              <AddEmployee />
            </MainLayout>
          }
        />
        <Route
          path="/all-employees"
          element={
            <MainLayout>
              <AllEmployees />
            </MainLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <MainLayout>
              <Tasks />
            </MainLayout>
          }
        />
        <Route
          path="/inbox"
          element={
            <MainLayout>
              <Inbox />
            </MainLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <MainLayout>
              <Notifications />
            </MainLayout>
          }
        />
        <Route
          path="/reporting"
          element={
            <MainLayout>
              <Reporting />
            </MainLayout>
          }
        />
       
        <Route
          path="/goals"
          element={
            <MainLayout>
              <Goals />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
