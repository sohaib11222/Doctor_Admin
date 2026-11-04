import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { useAdminSidebarCounts } from '../../queries/adminQueries'

const displayCount = (count) => (count > 99 ? '99+' : count)

const AdminSidebar = () => {
  const location = useLocation()
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  const { data: unreadResponse } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => api.get('/chat/unread-count'),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  })
  const { data: countsResponse } = useAdminSidebarCounts()

  const unreadPayload = unreadResponse?.data ?? unreadResponse
  const sidebarPayload = countsResponse?.data ?? countsResponse
  const supportUnreadCount = Number(unreadPayload?.unreadCount || 0)
  const counts = sidebarPayload || {}

  const groups = [
    {
      title: 'Main',
      items: [{ path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' }],
    },
    {
      title: 'Healthcare management',
      items: [
        { path: '/appointment-list', label: 'Appointments', icon: 'fa-calendar-check', count: counts.pendingAppointments },
        { path: '/specialities', label: 'Specialities', icon: 'fa-stethoscope' },
        { path: '/insurance-companies', label: 'Insurance Companies', icon: 'fa-shield-heart' },
      ],
    },
    {
      title: 'Users & verification',
      items: [
        { path: '/doctor-list', label: 'Doctors', icon: 'fa-user-doctor', count: counts.pendingDoctorVerifications },
        { path: '/patient-list', label: 'Patients', icon: 'fa-user-group' },
        { path: '/pharmacy-users', label: 'Pharmacy Users', icon: 'fa-user-gear' },
        { path: '/pharmacies', label: 'Pharmacies', icon: 'fa-store' },
        { path: '/pharmacy-verification', label: 'Pharmacy Verification', icon: 'fa-file-circle-check', count: counts.pendingPharmacyVerifications },
      ],
    },
    {
      title: 'Messages & support',
      items: [
        { path: '/admin-doctor-chat', label: 'Doctor Messages', icon: 'fa-comments' },
        { path: '/admin-support-inbox', label: 'Support Inbox', icon: 'fa-headset', count: supportUnreadCount },
        { path: '/patient-support-tickets', label: 'Patient Tickets', icon: 'fa-ticket', count: counts.unreadPatientTickets },
        { path: '/contact-queries', label: 'Contact Inquiries', icon: 'fa-envelope-open-text', count: counts.newContactInquiries },
      ],
    },
    {
      title: 'Products & orders',
      items: [
        { path: '/products', label: 'Products', icon: 'fa-box-open' },
        { path: '/orders', label: 'Orders', icon: 'fa-cart-shopping', count: counts.pendingOrders },
      ],
    },
    {
      title: 'Payments & finance',
      items: [
        { path: '/transactions-list', label: 'Payments', icon: 'fa-credit-card', count: counts.pendingPayments },
        { path: '/withdrawal-requests', label: 'Withdrawal Requests', icon: 'fa-money-bill-transfer', count: counts.pendingWithdrawals },
        { path: '/manage-subscriptions', label: 'Subscriptions', icon: 'fa-repeat' },
        { path: '/subscription-plans', label: 'Subscription Plans', icon: 'fa-tags' },
      ],
    },
    {
      title: 'Platform',
      items: [
        { path: '/announcements-management', label: 'Announcements', icon: 'fa-bullhorn' },
        { path: '/notifications-management', label: 'Notifications', icon: 'fa-bell' },
        { path: '/reviews', label: 'Reviews', icon: 'fa-star' },
        { path: '/settings', label: 'Contact Details', icon: 'fa-address-card' },
      ],
    },
  ]

  return (
    <div className="sidebar" id="sidebar">
      <div
        className="sidebar-inner slimscroll"
        style={{
          maxHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '20px',
        }}
      >
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            {groups.map((group) => (
              <Fragment key={group.title}>
                <li className="menu-title"><span>{group.title}</span></li>
                {group.items.map((item) => {
                    const count = Number(item.count || 0)
                    return (
                      <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
                        <Link to={item.path}>
                          <i className={`fa-solid ${item.icon} admin-sidebar-icon`} aria-hidden="true"></i>
                          <span>{item.label}</span>
                          {count > 0 && <span className="sidebar-count">{displayCount(count)}</span>}
                        </Link>
                      </li>
                    )
                })}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
