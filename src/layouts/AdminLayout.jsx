import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminHeader from '../components/common/AdminHeader'
import AdminSidebar from '../components/common/AdminSidebar'
import Breadcrumb from '../components/common/Breadcrumb'

const AdminLayout = ({ children, breadcrumb }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const isAuthPage = ['/login', '/register', '/forgot-password', '/lock-screen', '/error-404', '/error-500'].includes(location.pathname)

  useEffect(() => {
    // Check authentication for protected pages
    if (!isAuthPage && !loading) {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
      if (!token || !user) {
        navigate('/login')
      } else if (user && user.role !== 'ADMIN') {
        // If user is not admin, redirect to login
        navigate('/login')
      }
    }
  }, [user, loading, isAuthPage, navigate, location.pathname])

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

  // If no user after loading, don't render (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="main-wrapper">
      <AdminHeader />
      <AdminSidebar />
      <div className="page-wrapper">
        {breadcrumb && <Breadcrumb {...breadcrumb} />}
        <div className="content">
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout

