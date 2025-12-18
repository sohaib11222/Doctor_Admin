import { useLocation } from 'react-router-dom'
import AdminHeader from '../components/common/AdminHeader'
import AdminSidebar from '../components/common/AdminSidebar'
import Breadcrumb from '../components/common/Breadcrumb'

const AdminLayout = ({ children, breadcrumb }) => {
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password', '/lock-screen', '/error-404', '/error-500'].includes(location.pathname)

  if (isAuthPage) {
    return <>{children}</>
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

