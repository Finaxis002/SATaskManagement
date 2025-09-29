import { useEffect } from "react";
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
import Completed from "./pages/Completed";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage"; // Adjust the path as per your structure
import Leave from "./pages/Leave";
import LeaveManagement from "./pages/LeaveManagement"; // Adjust the path as per your structure
import InvoiceForm from "./pages/InvoiceForm";
import Clients from "./pages/Clients";
import ViewInvoices from "./pages/ViewInvoices";
import ViewInvoiceWithOTP from "./pages/ViewInvoiceWithOTP";
import WhatsAppPage from "./pages/WhatsAppPage";
import MailCreation from "./pages/MailCreation";
import MailBox from "./pages/MailBox";
import { NotesProvider } from "./context/NotesContext";

import InvoiceTab from "./pages/InvoiceTab";

import ShortcutHandler from "./Components/ShortcutHandler";
import Updates from "./pages/Updates";


const App = () => {

  function MailBoxEmbed() {
    return (
      <iframe
        src="https://mailbox.sharda.co.in/"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="Mailbox"
      />
    );
  }

  function AdminMailBoxEmbed() {
    return (
      <iframe
        src="http://localhost:5235/admin"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="Mailbox"
      />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

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
          path="/clients"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Clients />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        


          <Route
            path="/whatsapp"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WhatsAppPage />
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

        <Route
          path="/completed"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Completed />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CalendarPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Leave />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leavemanagement"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LeaveManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <MainLayout>
                <InvoiceForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/viewinvoices"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ViewInvoices />
              </MainLayout>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/viewinvoicewithotp"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ViewInvoiceWithOTP />
              </MainLayout>
            </ProtectedRoute>
          }
        />

     

        <Route
          path="/mail-creation"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MailCreation />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* ⬇️ NEW: /updates route (Sidebar link will open this) */}
        <Route
          path="/updates"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Updates />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/updates" element={
        <ProtectedRoute>
          <MainLayout>
            <Updates />
          </MainLayout>
        </ProtectedRoute>
        }/>

        {/* <Route 
          path="/invoice-tab"
          element={
            <ProtectedRoute>
              <MainLayout>
                <InvoiceTab />
              </MainLayout>
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </Router>
  );
};


export default App;
