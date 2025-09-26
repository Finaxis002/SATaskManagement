import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import AllEmployees from "./pages/AllEmployees";
import Login from "./pages/Login";
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
// ⬇️ NEW: import the Updates page
import Updates from "./pages/Updates";

import InvoicesPage from "./pages/InvoicesPage";
import SettingsPage from "./pages/SettingsPage";
import Support from "./pages/Support";
import DeveloperSupport from "./pages/DeveloperSupport";
import AddServicePage from "./pages/AddServicePage";
import MessageHistory from "./Components/history/MessageHistory";

// Context & Components
import { NotesProvider } from "./context/NotesContext";

import InvoiceTab from "./pages/InvoiceTab";

import ShortcutHandler from "./Components/ShortcutHandler";
import ProtectedRoute from "./Components/ProtectedRoute";



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
      <ShortcutHandler>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
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


           {/* Add the new route for AddServicePage */}
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
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SettingsPage />
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


        
          {/* <Route
          path="/viewinvoices"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ViewInvoices />

        {/* <Route
          path="/invoice"

          element={
            <ProtectedRoute>
              <MainLayout>
                <InvoiceForm />

              </MainLayout>
            </ProtectedRoute>
          }

        {/* Add the new InvoicesPage route for mobile view*/}

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <MainLayout>
                <InvoicesPage />
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
           


        {/* <Route 
          path="/invoice-tab"

          element={
            <ProtectedRoute>
              <MainLayout>
                <InvoiceTab />
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

      </Routes>
    </ShortcutHandler>

    </Router>
  );
};


export default App;
