import { Link, useLocation } from 'react-router-dom'

const AdminSidebar = () => {
  const location = useLocation()
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="sidebar" id="sidebar">
      <div
        className="sidebar-inner slimscroll"
        style={{
          maxHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '20px'
        }}
      >
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li className="menu-title">
              <span>Main</span>
            </li>
            <li className={isActive('/dashboard') ? 'active' : ''}>
              <Link to="/dashboard"><i className="fe fe-home"></i> <span>Dashboard</span></Link>
            </li>
            <li className={isActive('/appointment-list') ? 'active' : ''}>
              <Link to="/appointment-list"><i className="fe fe-layout"></i> <span>Appointments</span></Link>
            </li>
            <li className={isActive('/specialities') ? 'active' : ''}>
              <Link to="/specialities"><i className="fe fe-users"></i> <span>Specialities</span></Link>
            </li>
            <li className={isActive('/doctor-list') ? 'active' : ''}>
              <Link to="/doctor-list"><i className="fe fe-user-plus"></i> <span>Doctors</span></Link>
            </li>
            <li className={isActive('/admin-doctor-chat') ? 'active' : ''}>
              <Link to="/admin-doctor-chat"><i className="fe fe-messanger"></i> <span>Doctor Messages</span></Link>
            </li>
            {/* <li className={isActive('/doctor-verification') ? 'active' : ''}>
              <Link to="/doctor-verification"><i className="fe fe-check-circle"></i> <span>Doctor Verification</span></Link>
            </li> */}
            <li className={isActive('/patient-list') ? 'active' : ''}>
              <Link to="/patient-list"><i className="fe fe-user"></i> <span>Patients</span></Link>
            </li>

            <li className={isActive('/pharmacies') ? 'active' : ''}>
              <Link to="/pharmacies"><i className="fe fe-building"></i> <span>Pharmacies</span></Link>
            </li>
            <li className={isActive('/products') ? 'active' : ''}>
              <Link to="/products"><i className="fe fe-shopping-bag"></i> <span>Products</span></Link>
            </li>
            <li className={isActive('/transactions-list') ? 'active' : ''}>
              <Link to="/transactions-list"><i className="fe fe-activity"></i> <span>Transactions</span></Link>
            </li>
            <li className={isActive('/orders') ? 'active' : ''}>
              <Link to="/orders"><i className="fe fe-shopping-cart"></i> <span>Orders</span></Link>
            </li>
            <li className={isActive('/manage-subscriptions') ? 'active' : ''}>
              <Link to="/manage-subscriptions"><i className="fe fe-credit-card"></i> <span>Subscriptions</span></Link>
            </li>
            <li className={isActive('/subscription-plans') ? 'active' : ''}>
              <Link to="/subscription-plans"><i className="fe fe-ticket"></i> <span>Subscription Plans</span></Link>
            </li>
          
            <li className={isActive('/announcements-management') ? 'active' : ''}>
              <Link to="/announcements-management"><i className="fe fe-bell"></i> <span>Announcements</span></Link>
            </li>
            <li className={isActive('/notifications-management') ? 'active' : ''}>
              <Link to="/notifications-management"><i className="fe fe-bolt"></i> <span>Notifications</span></Link>
            </li>
            <li className={isActive('/reviews') ? 'active' : ''}>
              <Link to="/reviews"><i className="fe fe-star-o"></i> <span>Reviews</span></Link>
            </li>

            {/* <li className={isActive('/system-activity') ? 'active' : ''}>
              <Link to="/system-activity"><i className="fe fe-timeline"></i> <span>System Activity</span></Link>
            </li> */}
            {/* <li className={isActive('/settings') ? 'active' : ''}>
              <Link to="/settings"><i className="fe fe-vector"></i> <span>Settings</span></Link>
            <./li> */}
            {/* <li className="submenu">
              <a href="javascript:;"><i className="fe fe-document"></i> <span> Reports</span> <span className="menu-arrow"></span></a>
              <ul style={{ display: isActive('/invoice-report') || isActive('/invoice') ? 'block' : 'none' }}>
                <li>
                  <Link className={isActive('/invoice-report') || isActive('/invoice') ? 'active' : ''} to="/invoice-report">Invoice Reports</Link>
                </li>
              </ul>
            </li> */}
            {/* <li className="menu-title">
              <span>Pages</span>
            </li>
            <li className={isActive('/profile') ? 'active' : ''}>
              <Link to="/profile"><i className="fe fe-user-plus"></i> <span>Profile</span></Link>
            </li>
            <li className="submenu">
              <a href="javascript:;"><i className="fe fe-document"></i> <span> Authentication </span> <span className="menu-arrow"></span></a>
              <ul style={{ display: isActive('/login') || isActive('/register') || isActive('/forgot-password') || isActive('/lock-screen') ? 'block' : 'none' }}>
                <li><Link className={isActive('/login') ? 'active' : ''} to="/login"> Login </Link></li>
                <li><Link className={isActive('/register') ? 'active' : ''} to="/register"> Register </Link></li>
                <li><Link className={isActive('/forgot-password') ? 'active' : ''} to="/forgot-password"> Forgot Password </Link></li>
                <li><Link className={isActive('/lock-screen') ? 'active' : ''} to="/lock-screen"> Lock Screen </Link></li>
              </ul>
            </li>
            <li className="submenu">
              <a href="javascript:;"><i className="fe fe-warning"></i> <span> Error Pages </span> <span className="menu-arrow"></span></a>
              <ul style={{ display: isActive('/error-404') || isActive('/error-500') ? 'block' : 'none' }}>
                <li><Link className={isActive('/error-404') ? 'active' : ''} to="/error-404">404 Error </Link></li>
                <li><Link className={isActive('/error-500') ? 'active' : ''} to="/error-500">500 Error </Link></li>
              </ul>
            </li>
            <li className={isActive('/calendar') ? 'active' : ''}>
              <Link to="/calendar"><i className="fe fe-calendar"></i> <span>Calendar</span></Link>
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar

