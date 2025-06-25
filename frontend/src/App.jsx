// import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
// import PublicLayout from "./components/layout/PublicLayout";
// import AdminLayout from "./components/layout/AdminLayout";
// import MechanicLayout from "./components/layout/MechanicLayout";
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import ServicesPage from "./pages/ServicesPage";
// import TestimonialsPage from "./pages/TestimonialsPage";
// import ContactPage from "./pages/ContactPage";
// import DashboardPage from "./pages/admin/DashboardPage";
// import ServiceRequestsPage from "./pages/admin/ServiceRequestsPage";
// import MechanicsPage from "./pages/admin/MechanicsPage";
// import SchedulePage from "./pages/admin/SchedulePage";
// import AdminUsersPage from "./pages/admin/AdminUsersPage";
// import CustomerPage from "./pages/CustomerPage";
// import Inventory from "./pages/admin/InventoryPage";

// // Mechanic Pages
// import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
// import MechanicServiceRequests from "./pages/mechanic/MechanicServiceRequests";
// import MechanicInventory from "./pages/mechanic/MechanicInventory";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public routes */}
//         <Route element={<PublicLayout><Outlet /></PublicLayout>}>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/services" element={<ServicesPage />} />
//           <Route path="/testimonials" element={<TestimonialsPage />} />
//           <Route path="/contact" element={<ContactPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/customer" element={<CustomerPage />} />
//         </Route>

//         {/* Admin routes */}
//         <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
//           <Route index element={<DashboardPage />} />
//           <Route path="requests" element={<ServiceRequestsPage />} />
//           <Route path="mechanics" element={<MechanicsPage />} />
//           <Route path="schedule" element={<SchedulePage />} />
//           <Route path="users" element={<AdminUsersPage />} />
//           <Route path="inventory" element={<Inventory />} />
//         </Route>

//         {/* Mechanic routes */}
//         <Route path="/mechanic" element={<MechanicLayout><Outlet /></MechanicLayout>}>
//           <Route index element={<MechanicDashboard />} />
//           <Route path="requests" element={<MechanicServiceRequests />} />
//           <Route path="inventory" element={<MechanicInventory />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import MechanicLayout from "./components/layout/MechanicLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesPage from "./pages/ServicesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ServiceRequestsPage from "./pages/admin/ServiceRequestsPage";
import MechanicsPage from "./pages/admin/MechanicsPage";
import SchedulePage from "./pages/admin/SchedulePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import CustomerPage from "./pages/CustomerPage";
import Inventory from "./pages/admin/InventoryPage";

// Mechanic Pages
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import MechanicServiceRequests from "./pages/mechanic/MechanicServiceRequests";
import MechanicInventory from "./pages/mechanic/MechanicInventory";
import UnauthorizedPage from "./components/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout><Outlet /></PublicLayout>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Admin routes - protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="requests" element={<ServiceRequestsPage />} />
          <Route path="mechanics" element={<MechanicsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* Mechanic routes - protected */}
        <Route
          path="/mechanic"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicLayout>
                <Outlet />
              </MechanicLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<MechanicDashboard />} />
          <Route path="requests" element={<MechanicServiceRequests />} />
          <Route path="inventory" element={<MechanicInventory />} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;