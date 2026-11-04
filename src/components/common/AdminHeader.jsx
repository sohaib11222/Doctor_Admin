import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AdminHeader = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    // Initialize sidebar toggle
    if (typeof window !== 'undefined' && window.$) {
      $('#toggle_btn').on('click', function() {
        if ($('body').hasClass('mini-sidebar')) {
          $('body').removeClass('mini-sidebar')
          $('.subdrop + ul').slideDown()
        } else {
          $('body').addClass('mini-sidebar')
          $('.subdrop + ul').slideUp()
        }
        setTimeout(function() {
          $(window).trigger('resize')
        }, 100)
        return false
      })

      $('#mobile_btn').on('click', function() {
        $('body').toggleClass('slide-nav')
        $('.sidebar-overlay').toggleClass('opened')
        $('html').toggleClass('menu-opened')
        return false
      })

      $('.sidebar-overlay').on('click', function() {
        $('body').removeClass('slide-nav')
        $('.sidebar-overlay').removeClass('opened')
        $('html').removeClass('menu-opened')
        return false
      })
    }
  }, [])

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/dashboard" className="logo">
          <img 
            src="/assets_admin/img/doctor_final.png" 
            alt="Logo" 
            className="img-fluid" 
            style={{ maxHeight: '55px', height: 'auto', width: 'auto' }}
          />
        </Link>
        <Link to="/dashboard" className="logo logo-small">
          <img 
            src="/assets_admin/img/doctor_final.png" 
            alt="Logo" 
            className="img-fluid" 
            style={{ maxHeight: '40px', height: 'auto', width: 'auto' }}
          />
        </Link>
      </div>
      
      <a href="javascript:void(0);" id="toggle_btn">
        <i className="fe fe-text-align-left"></i>
      </a>
      
      <a className="mobile_btn" id="mobile_btn">
        <i className="fa fa-bars"></i>
      </a>
      
      <ul className="nav user-menu">
        <li className="nav-item dropdown has-arrow">
          <a href="javascript:;" className="dropdown-toggle nav-link" data-bs-toggle="dropdown">
            <span className="admin-initial-avatar" aria-label="Administrator">A</span>
          </a>
          <div className="dropdown-menu">
            <div className="user-header">
              <span className="admin-initial-avatar admin-initial-avatar--large" aria-hidden="true">A</span>
              <div className="user-text">
                <h6>{user?.name || 'Admin'}</h6>
                <p className="text-muted mb-0">Administrator</p>
              </div>
            </div>
            <Link className="dropdown-item" to="/profile">My Profile</Link>
            <Link className="dropdown-item" to="/settings">Settings</Link>
            <a className="dropdown-item" href="javascript:void(0);" onClick={handleLogout}>Logout</a>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default AdminHeader

