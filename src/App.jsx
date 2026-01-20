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
import ManageSubscriptions from './pages/admin/ManageSubscriptions'
import SubscriptionPlans from './pages/admin/SubscriptionPlans'
import AnnouncementsManagement from './pages/admin/AnnouncementsManagement'
import NotificationsManagement from './pages/admin/NotificationsManagement'
import Pharmacies from './pages/admin/Pharmacies'
import Products from './pages/admin/Products'
import AdminDoctorChat from './pages/admin/AdminDoctorChat'
import SystemActivity from './pages/admin/SystemActivity'
import Orders from './pages/admin/Orders'
import WithdrawalRequests from './pages/admin/WithdrawalRequests'
import InsuranceCompanies from './pages/admin/InsuranceCompanies'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
            {/* Admin Dashboard Routes */}
            <Route path="/dashboard" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Dashboard", li2: "Dashboard" }}><AdminDashboard /></AdminLayout>} />
            <Route path="/" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Dashboard", li2: "Dashboard" }}><AdminDashboard /></AdminLayout>} />
            
            {/* Admin Management Routes */}
            <Route path="/appointment-list" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Appointments", li2: "Appointments" }}><AppointmentList /></AdminLayout>} />
            <Route path="/specialities" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Specialities", li2: "Specialities" }}><Specialities /></AdminLayout>} />
            <Route path="/insurance-companies" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Insurance Companies", li2: "Insurance Companies" }}><InsuranceCompanies /></AdminLayout>} />
            <Route path="/doctor-list" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Users", li2: "Doctor" }}><DoctorList /></AdminLayout>} />
            <Route path="/patient-list" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Users", li2: "Patient" }}><PatientList /></AdminLayout>} />
            <Route path="/reviews" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Reviews", li2: "Reviews" }}><AdminReviews /></AdminLayout>} />
            <Route path="/transactions-list" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Transactions", li2: "Transactions" }}><TransactionsList /></AdminLayout>} />
            <Route path="/settings" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Settings", li2: "General Settings" }}><Settings /></AdminLayout>} />
            <Route path="/invoice-report" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Invoice Report", li2: "Invoice Report" }}><InvoiceReport /></AdminLayout>} />
            <Route path="/profile" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Profile", li2: "Profile" }}><Profile /></AdminLayout>} />
            <Route path="/invoice" element={<AdminLayout><Invoice /></AdminLayout>} />
            <Route path="/doctor-verification" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Doctor Verification", li2: "Doctor Verification" }}><DoctorVerificationApproval /></AdminLayout>} />
            <Route path="/manage-subscriptions" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Subscriptions", li2: "Manage Subscriptions" }}><ManageSubscriptions /></AdminLayout>} />
            <Route path="/subscription-plans" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Subscriptions", li2: "Subscription Plans" }}><SubscriptionPlans /></AdminLayout>} />
            <Route path="/announcements-management" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Announcements", li2: "Announcements Management" }}><AnnouncementsManagement /></AdminLayout>} />
            <Route path="/notifications-management" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Notifications", li2: "Notifications Management" }}><NotificationsManagement /></AdminLayout>} />
            <Route path="/pharmacies" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Pharmacies", li2: "Pharmacies" }}><Pharmacies /></AdminLayout>} />
            <Route path="/products" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Products", li2: "Products" }}><Products /></AdminLayout>} />
            <Route path="/orders" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Orders", li2: "Orders" }}><Orders /></AdminLayout>} />
            <Route path="/withdrawal-requests" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Withdrawals", li2: "Withdrawal Requests" }}><WithdrawalRequests /></AdminLayout>} />
            <Route path="/admin-doctor-chat" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Messages", li2: "Doctor Chat" }}><AdminDoctorChat /></AdminLayout>} />
            <Route path="/system-activity" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "System Activity", li2: "System Activity" }}><SystemActivity /></AdminLayout>} />
            <Route path="/calendar" element={<AdminLayout breadcrumb={{ title: "Admin", li1: "Calendar", li2: "Calendar" }}><Calendar /></AdminLayout>} />
            
            {/* Admin Auth Routes */}
            <Route path="/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><AdminRegister /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><AdminForgotPassword /></AuthLayout>} />
            <Route path="/lock-screen" element={<AuthLayout><LockScreen /></AuthLayout>} />
            
            {/* Admin Error Pages */}
            <Route path="/error-404" element={<AdminError404 />} />
            <Route path="/error-500" element={<AdminError500 />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<AdminLayout><AdminError404 /></AdminLayout>} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

