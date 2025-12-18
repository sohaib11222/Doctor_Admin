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
          <img src="/assets_admin/img/logo.png" alt="Logo" />
        </Link>
        <Link to="/dashboard" className="logo logo-small">
          <img src="/assets_admin/img/logo-small.png" alt="Logo" width="30" height="30" />
        </Link>
      </div>
      
      <a href="javascript:void(0);" id="toggle_btn">
        <i className="fe fe-text-align-left"></i>
      </a>
      
      <div className="top-nav-search">
        <form>
          <input type="text" className="form-control" placeholder="Search here" />
          <button className="btn" type="submit"><i className="fa fa-search"></i></button>
        </form>
      </div>
      
      <a className="mobile_btn" id="mobile_btn">
        <i className="fa fa-bars"></i>
      </a>
      
      <ul className="nav user-menu">
        <li className="nav-item dropdown noti-dropdown">
          <a href="javascript:;" className="dropdown-toggle nav-link" data-bs-toggle="dropdown">
            <i className="fe fe-bell"></i> <span className="badge rounded-pill">3</span>
          </a>
          <div className="dropdown-menu notifications">
            <div className="topnav-dropdown-header">
              <span className="notification-title">Notifications</span>
              <a href="javascript:void(0)" className="clear-noti"> Clear All </a>
            </div>
            <div className="noti-content">
              <ul className="notification-list">
                <li className="notification-message">
                  <a href="javascript:;">
                    <div className="notify-block d-flex">
                      <span className="avatar avatar-sm flex-shrink-0">
                        <img className="avatar-img rounded-circle" alt="User Image" src="/assets_admin/img/doctors/doctor-thumb-01.jpg" />
                      </span>
                      <div className="media-body flex-grow-1">
                        <p className="noti-details"><span className="noti-title">Dr. Ruby Perrin</span> Schedule <span className="noti-title">her appointment</span></p>
                        <p className="noti-time"><span className="notification-time">4 mins ago</span></p>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="notification-message">
                  <a href="javascript:;">
                    <div className="notify-block d-flex">
                      <span className="avatar avatar-sm flex-shrink-0">
                        <img className="avatar-img rounded-circle" alt="User Image" src="/assets_admin/img/patients/patient1.jpg" />
                      </span>
                      <div className="media-body flex-grow-1">
                        <p className="noti-details"><span className="noti-title">Charlene Reed</span> has booked her appointment to <span className="noti-title">Dr. Ruby Perrin</span></p>
                        <p className="noti-time"><span className="notification-time">6 mins ago</span></p>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className="topnav-dropdown-footer">
              <a href="javascript:;">View all Notifications</a>
            </div>
          </div>
        </li>
        
        <li className="nav-item dropdown has-arrow">
          <a href="javascript:;" className="dropdown-toggle nav-link" data-bs-toggle="dropdown">
            <span className="user-img"><img className="rounded-circle" src="/assets_admin/img/profiles/avatar-01.jpg" width="31" alt="Admin" /></span>
          </a>
          <div className="dropdown-menu">
            <div className="user-header">
              <div className="avatar avatar-sm">
                <img src="/assets_admin/img/profiles/avatar-01.jpg" alt="User Image" className="avatar-img rounded-circle" />
              </div>
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

