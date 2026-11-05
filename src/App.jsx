import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './contexts/AuthContext'
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AppointmentList from './pages/admin/AppointmentList'
import Specialities from './pages/admin/Specialities'
import DoctorList from './pages/admin/DoctorList'
import PatientList from './pages/admin/PatientList'
import PharmacyUsers from './pages/admin/PharmacyUsers'
import AdminReviews from './pages/admin/Reviews'
import TransactionsList from './pages/admin/TransactionsList'
import Settings from './pages/admin/Settings'
import InvoiceReport from './pages/admin/InvoiceReport'
import Profile from './pages/admin/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminForgotPassword from './pages/admin/ForgotPassword'
import LockScreen from './pages/admin/LockScreen'
import AdminError404 from './pages/admin/AdminError404'
import AdminError500 from './pages/admin/AdminError500'
import Invoice from './pages/admin/Invoice'
import Calendar from './pages/admin/Calendar'
import DoctorVerificationApproval from './pages/admin/DoctorVerificationApproval'
import PharmacyVerificationApproval from './pages/admin/PharmacyVerificationApproval'
import ManageSubscriptions from './pages/admin/ManageSubscriptions'
import SubscriptionPlans from './pages/admin/SubscriptionPlans'
import AnnouncementsManagement from './pages/admin/AnnouncementsManagement'
import NotificationsManagement from './pages/admin/NotificationsManagement'
import Pharmacies from './pages/admin/Pharmacies'
import Products from './pages/admin/Products'
import AdminDoctorChat from './pages/admin/AdminDoctorChat'
import AdminSupportInbox from './pages/admin/AdminSupportInbox'
import PatientSupportTickets from './pages/admin/PatientSupportTickets'
import SystemActivity from './pages/admin/SystemActivity'
import Orders from './pages/admin/Orders'
import OrderDetails from './pages/admin/OrderDetails'
import WithdrawalRequests from './pages/admin/WithdrawalRequests'
import InsuranceCompanies from './pages/admin/InsuranceCompanies'
import ContactQueries from './pages/admin/ContactQueries'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
      refetchInterval: 15000,
      refetchIntervalInBackground: true,
      retry: 1,
      staleTime: 10 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin Auth Routes */}
            <Route path="/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><AdminRegister /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><AdminForgotPassword /></AuthLayout>} />
            <Route path="/lock-screen" element={<AuthLayout><LockScreen /></AuthLayout>} />
            
            {/* Admin Error Pages */}
            <Route path="/error-404" element={<AdminError404 />} />
            <Route path="/error-500" element={<AdminError500 />} />
            
            {/* Keep the dashboard chrome mounted while sidebar navigation changes pages. */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/appointment-list" element={<AppointmentList />} />
              <Route path="/specialities" element={<Specialities />} />
              <Route path="/insurance-companies" element={<InsuranceCompanies />} />
              <Route path="/doctor-list" element={<DoctorList />} />
              <Route path="/patient-list" element={<PatientList />} />
              <Route path="/pharmacy-users" element={<PharmacyUsers />} />
              <Route path="/reviews" element={<AdminReviews />} />
              <Route path="/transactions-list" element={<TransactionsList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invoice-report" element={<InvoiceReport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/doctor-verification" element={<DoctorVerificationApproval />} />
              <Route path="/pharmacy-verification" element={<PharmacyVerificationApproval />} />
              <Route path="/manage-subscriptions" element={<ManageSubscriptions />} />
              <Route path="/subscription-plans" element={<SubscriptionPlans />} />
              <Route path="/announcements-management" element={<AnnouncementsManagement />} />
              <Route path="/notifications-management" element={<NotificationsManagement />} />
              <Route path="/pharmacies" element={<Pharmacies />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/withdrawal-requests" element={<WithdrawalRequests />} />
              <Route path="/admin-doctor-chat" element={<AdminDoctorChat />} />
              <Route path="/admin-support-inbox" element={<AdminSupportInbox />} />
              <Route path="/patient-support-tickets" element={<PatientSupportTickets />} />
              <Route path="/contact-queries" element={<ContactQueries />} />
              <Route path="/system-activity" element={<SystemActivity />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="*" element={<AdminError404 />} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

