// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import AllEmployees from "./pages/AllEmployees";
import Login from "./pages/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import Reminders from "./pages/Reminders";
import Inbox from "./pages/Inbox";
import AllTasks from "./pages/AllTasks";
import Departments from "./pages/Departments";
import Completed from "./pages/Completed";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import Leave from "./pages/Leave";
import LeaveManagement from "./pages/LeaveManagement";
import InvoiceForm from "./pages/InvoiceForm";
import Clients from "./pages/Clients";
import ViewInvoices from "./pages/ViewInvoices";
import ViewInvoiceWithOTP from "./pages/ViewInvoiceWithOTP";
import WhatsAppPage from "./pages/WhatsAppPage";
import MailCreation from "./pages/MailCreation";
import MailBox from "./pages/MailBox";
import { NotesProvider } from "./context/NotesContext";
import AddServicePage from "./pages/AddServicePage";
import MessageHistory from "./Components/history/MessageHistory";
import Support from "./pages/Support";
import DeveloperSupport from "./pages/DeveloperSupport";
import ShortcutHandler from "./Components/ShortcutHandler";
import Updates from "./pages/Updates";

// 🌟 Agent Pages Imports 🌟
import AgentPage from "./pages/Agent/AgentPage";
import CreateAgent from "./pages/Agent/CreateAgent";
import AgentList from "./pages/Agent/AgentList";
import Referrals from "./pages/Agent/Referrals";
import AgentProfile from "./pages/Agent/AgentProfile";


// 📝 Message Templates Import 👇 NEW
import MessageTemplatesManager from "./Components/Tasks/MessageTemplatesManager";

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
      <NotesProvider>
        <ShortcutHandler>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* ------------------- Protected Routes ------------------- */}

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

            {/* 🌟 Agent Routes 🌟 */}
            <Route
              path="/agent"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AgentPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/create"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreateAgent />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/list"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AgentList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/referrals"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Referrals />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/profile/:agentId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AgentProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* 🌟 Agent Routes End 🌟 */}

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

            {/* 📝 Message Templates Route 👇 NEW */}
            <Route
              path="/message-templates"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MessageTemplatesManager />
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

            <Route
              path="/viewinvoices"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ViewInvoices />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

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

            <Route
              path="/add-service/:clientId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AddServicePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/message-history/:clientId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MessageHistory />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Support />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/developer-support"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DeveloperSupport />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mailbox"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MailBoxEmbed />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-mailbox"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminMailBoxEmbed />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ShortcutHandler>
      </NotesProvider>
    </Router>
  );
};

export default App;
