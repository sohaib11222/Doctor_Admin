import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminHeader from '../components/common/AdminHeader'
import AdminSidebar from '../components/common/AdminSidebar'
import Breadcrumb from '../components/common/Breadcrumb'
import AdminPageErrorBoundary from '../components/common/AdminPageErrorBoundary'

const breadcrumbsByPath = {
  '/': { title: 'Admin', li1: 'Dashboard', li2: 'Dashboard' },
  '/dashboard': { title: 'Admin', li1: 'Dashboard', li2: 'Dashboard' },
  '/appointment-list': { title: 'Admin', li1: 'Appointments', li2: 'Appointments' },
  '/specialities': { title: 'Admin', li1: 'Specialities', li2: 'Specialities' },
  '/insurance-companies': { title: 'Admin', li1: 'Insurance Companies', li2: 'Insurance Companies' },
  '/doctor-list': { title: 'Admin', li1: 'Users', li2: 'Doctors' },
  '/patient-list': { title: 'Admin', li1: 'Users', li2: 'Patients' },
  '/pharmacy-users': { title: 'Admin', li1: 'Users', li2: 'Pharmacy' },
  '/reviews': { title: 'Admin', li1: 'Reviews', li2: 'Reviews' },
  '/transactions-list': { title: 'Admin', li1: 'Transactions', li2: 'Transactions' },
  '/settings': { title: 'Admin', li1: 'Settings', li2: 'General Settings' },
  '/invoice-report': { title: 'Admin', li1: 'Invoice Report', li2: 'Invoice Report' },
  '/profile': { title: 'Admin', li1: 'Profile', li2: 'Profile' },
  '/doctor-verification': { title: 'Admin', li1: 'Doctor Verification', li2: 'Doctor Verification' },
  '/pharmacy-verification': { title: 'Admin', li1: 'Pharmacy Verification', li2: 'Pharmacy Verification' },
  '/manage-subscriptions': { title: 'Admin', li1: 'Subscriptions', li2: 'Manage Subscriptions' },
  '/subscription-plans': { title: 'Admin', li1: 'Subscriptions', li2: 'Subscription Plans' },
  '/announcements-management': { title: 'Admin', li1: 'Announcements', li2: 'Announcements Management' },
  '/notifications-management': { title: 'Admin', li1: 'Notifications', li2: 'Notifications Management' },
  '/pharmacies': { title: 'Admin', li1: 'Pharmacies', li2: 'Pharmacies' },
  '/products': { title: 'Admin', li1: 'Products', li2: 'Products' },
  '/orders': { title: 'Admin', li1: 'Orders', li2: 'Orders' },
  '/withdrawal-requests': { title: 'Admin', li1: 'Withdrawals', li2: 'Withdrawal Requests' },
  '/admin-doctor-chat': { title: 'Admin', li1: 'Messages', li2: 'Doctor Chat' },
  '/admin-support-inbox': { title: 'Admin', li1: 'Messages', li2: 'Support Inbox' },
  '/patient-support-tickets': { title: 'Admin', li1: 'Support', li2: 'Patient Tickets' },
  '/contact-queries': { title: 'Contact', li1: 'Contact Us', li2: 'Inquiries' },
  '/system-activity': { title: 'Admin', li1: 'System Activity', li2: 'System Activity' },
  '/calendar': { title: 'Admin', li1: 'Calendar', li2: 'Calendar' },
}

const AdminLayout = ({ children, breadcrumb }) => {
  const location = useLocation()
  const { user, loading } = useAuth()
  const isAuthPage = ['/login', '/register', '/forgot-password', '/lock-screen', '/error-404', '/error-500'].includes(location.pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="main-wrapper">
        <div className="page-wrapper">
          <div className="content">
            <div className="container-fluid">
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <Navigate to="/login" replace />

  const resolvedBreadcrumb = breadcrumb || (location.pathname.startsWith('/order/')
    ? { title: 'Admin', li1: 'Orders', li2: 'Order Details' }
    : breadcrumbsByPath[location.pathname])

  return (
    <div className="main-wrapper">
      <AdminHeader />
      <AdminSidebar />
      <div className="page-wrapper">
        {resolvedBreadcrumb && <Breadcrumb {...resolvedBreadcrumb} />}
        <div className="content">
          <div className="container-fluid">
            <AdminPageErrorBoundary resetKey={`${location.pathname}-${location.key}`}>
              {children || <Outlet />}
            </AdminPageErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout

