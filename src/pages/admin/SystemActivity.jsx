import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSystemActivity } from '../../queries/adminQueries'

const SystemActivity = () => {
  const [page, setPage] = useState(1)
  const [activityType, setActivityType] = useState('all') // 'all', 'appointments', 'transactions'

  const { data: activityResponse, isLoading } = useSystemActivity({ page, limit: 20 })

  // Extract activity data
  const activities = useMemo(() => {
    if (!activityResponse) return []
    const responseData = activityResponse.data || activityResponse
    
    let appointments = responseData.appointments || []
    let transactions = responseData.transactions || []
    
    // Combine and sort by date
    let allActivities = []
    
    if (activityType === 'all' || activityType === 'appointments') {
      appointments.forEach(apt => {
        allActivities.push({
          type: 'appointment',
          id: apt._id,
          title: 'New Appointment',
          description: `Appointment between ${apt.doctorId?.fullName || 'Doctor'} and ${apt.patientId?.fullName || 'Patient'}`,
          date: apt.createdAt,
          status: apt.status,
          data: apt
        })
      })
    }
    
    if (activityType === 'all' || activityType === 'transactions') {
      transactions.forEach(trans => {
        allActivities.push({
          type: 'transaction',
          id: trans._id,
          title: 'New Transaction',
          description: `Transaction by ${trans.userId?.fullName || trans.userId?.email || 'User'} - Amount: $${trans.amount || 0}`,
          date: trans.createdAt,
          status: trans.status,
          data: trans
        })
      })
    }
    
    // Sort by date (newest first)
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    return allActivities
  }, [activityResponse, activityType])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment':
        return 'fe fe-calendar'
      case 'transaction':
        return 'fe fe-credit-card'
      default:
        return 'fe fe-activity'
    }
  }

  // Get activity badge color
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary-light'
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'CONFIRMED':
        return 'bg-success-light'
      case 'PENDING':
        return 'bg-warning-light'
      case 'FAILED':
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-danger-light'
      case 'REFUNDED':
        return 'bg-info-light'
      default:
        return 'bg-secondary-light'
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">System Activity</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">System Activity</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                  >
                    <option value="all">All Activities</option>
                    <option value="appointments">Appointments</option>
                    <option value="transactions">Transactions</option>
                  </select>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="activity-feed">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 mb-0 small text-muted">Loading system activity...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No system activity found</p>
                  </div>
                ) : (
                  <ul className="list-unstyled">
                    {activities.map((activity, idx) => (
                      <li key={activity.id || idx} className="activity-item mb-3 pb-3 border-bottom">
                        <div className="d-flex">
                          <div className="activity-icon me-3">
                            <i className={`${getActivityIcon(activity.type)} text-primary`} style={{ fontSize: '20px' }}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{activity.title}</h6>
                                <p className="text-muted small mb-1">{activity.description}</p>
                                <span className={`badge me-2 ${getStatusBadgeClass(activity.status)}`}>
                                  {activity.status || 'N/A'}
                                </span>
                                <span className="text-muted small">{formatDate(activity.date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SystemActivity

