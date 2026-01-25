import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminDoctors, useAdminSubscriptionPlans } from '../../queries/adminQueries'
import { useAssignSubscription } from '../../mutations/adminMutations'

const ManageSubscriptions = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')

  // Fetch doctors
  const { data: doctorsResponse, isLoading: doctorsLoading, error: doctorsError, refetch: refetchDoctors } = useAdminDoctors()

  // Fetch subscription plans (only active ones for assignment)
  const { data: plansResponse, isLoading: plansLoading } = useAdminSubscriptionPlans({ status: 'ACTIVE' })

  // Extract doctors data
  const doctors = useMemo(() => {
    if (!doctorsResponse) return []
    const responseData = doctorsResponse.data || doctorsResponse
    return Array.isArray(responseData) ? responseData : (responseData.doctors || [])
  }, [doctorsResponse])

  // Extract plans data
  const plans = useMemo(() => {
    if (!plansResponse) return []
    const responseData = plansResponse.data || plansResponse
    return Array.isArray(responseData) ? responseData : (responseData.plans || [])
  }, [plansResponse])

  // Assign subscription mutation
  const assignMutation = useAssignSubscription()

  // Calculate statistics
  const stats = useMemo(() => {
    const total = doctors.length
    const active = doctors.filter(d => {
      if (!d.subscriptionPlan) return false
      if (!d.subscriptionExpiresAt) return false
      return new Date(d.subscriptionExpiresAt) > new Date()
    }).length
    const expired = total - active
    
    // Calculate monthly revenue (sum of active subscription prices)
    const monthlyRevenue = doctors
      .filter(d => {
        if (!d.subscriptionPlan) return false
        if (!d.subscriptionExpiresAt) return false
        return new Date(d.subscriptionExpiresAt) > new Date()
      })
      .reduce((sum, d) => {
        const plan = typeof d.subscriptionPlan === 'object' ? d.subscriptionPlan : null
        return sum + (plan?.price || 0)
      }, 0)

    return { total, active, expired, monthlyRevenue }
  }, [doctors])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get doctor subscription status
  const getSubscriptionStatus = (doctor) => {
    if (!doctor.subscriptionPlan) return 'No Plan'
    if (!doctor.subscriptionExpiresAt) return 'Expired'
    const expiresAt = new Date(doctor.subscriptionExpiresAt)
    const now = new Date()
    return expiresAt > now ? 'Active' : 'Expired'
  }

  // Get subscription start date (calculated from expiration date and plan duration)
  const getStartDate = (doctor) => {
    if (!doctor.subscriptionExpiresAt || !doctor.subscriptionPlan) return 'N/A'
    const plan = typeof doctor.subscriptionPlan === 'object' ? doctor.subscriptionPlan : null
    if (!plan || !plan.durationInDays) return '—'
    const expiresAt = new Date(doctor.subscriptionExpiresAt)
    const startDate = new Date(expiresAt)
    startDate.setDate(startDate.getDate() - plan.durationInDays)
    return formatDate(startDate)
  }

  // Handle change plan
  const handleChangePlan = (doctor) => {
    setSelectedDoctor(doctor)
    const currentPlanId = typeof doctor.subscriptionPlan === 'object' 
      ? doctor.subscriptionPlan._id 
      : doctor.subscriptionPlan
    setSelectedPlanId(currentPlanId || '')
    setShowModal(true)
  }

  // Handle save plan
  const handleSavePlan = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a subscription plan')
      return
    }

    if (!selectedDoctor) {
      toast.error('Doctor not selected')
      return
    }

    const doctorId = selectedDoctor._id || selectedDoctor.userId?._id || selectedDoctor.userId

    if (!doctorId) {
      toast.error('Doctor ID not found')
      return
    }

    try {
      await assignMutation.mutateAsync({
        doctorId: String(doctorId),
        planId: String(selectedPlanId)
      })
      toast.success(`Subscription plan assigned successfully to ${selectedDoctor.fullName || selectedDoctor.name || 'doctor'}`)
      setShowModal(false)
      setSelectedDoctor(null)
      setSelectedPlanId('')
      refetchDoctors()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign subscription plan'
      toast.error(errorMessage)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return <span className="badge bg-success-light">Active</span>
    } else if (status === 'Expired') {
      return <span className="badge bg-danger-light">Expired</span>
    } else {
      return <span className="badge bg-secondary-light">No Plan</span>
    }
  }

  return (
    <>
      <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Manage Subscriptions</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Subscriptions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Total Subscriptions</h6>
                <h3>{doctorsLoading ? '...' : stats.total}</h3>
                <p className="text-muted mb-0">All doctors</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Active Subscriptions</h6>
                <h3>{doctorsLoading ? '...' : stats.active}</h3>
                <p className="text-muted mb-0">Currently active</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Monthly Revenue</h6>
                <h3>€{doctorsLoading ? '...' : stats.monthlyRevenue.toFixed(2)}</h3>
                <p className="text-muted mb-0">This month</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Expired</h6>
                <h3>{doctorsLoading ? '...' : stats.expired}</h3>
                <p className="text-muted mb-0">Need renewal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="datatable table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Current Plan</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Next Billing</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorsLoading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 mb-0">Loading doctors...</p>
                          </td>
                        </tr>
                      ) : doctorsError ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <p className="text-danger">Error loading doctors: {doctorsError.message || 'Unknown error'}</p>
                            <button className="btn btn-sm btn-primary" onClick={() => refetchDoctors()}>Retry</button>
                          </td>
                        </tr>
                      ) : doctors.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <p className="text-muted">No doctors found</p>
                          </td>
                        </tr>
                      ) : (
                        doctors.map((doctor) => {
                          const doctorName = doctor.fullName || doctor.name || '—'
                          const doctorEmail = doctor.email || '—'
                          const doctorImage = doctor.profileImage || doctor.image || '/assets/img/doctors/doctor-thumb-01.jpg'
                          const subscriptionStatus = getSubscriptionStatus(doctor)
                          const plan = typeof doctor.subscriptionPlan === 'object' ? doctor.subscriptionPlan : null
                          const planName = plan?.name || 'No Plan'
                          const planPrice = plan ? `€${plan.price?.toFixed(2) || '0.00'}` : '—'
                          const startDate = getStartDate(doctor)
                          const endDate = doctor.subscriptionExpiresAt ? formatDate(doctor.subscriptionExpiresAt) : 'N/A'
                          const nextBilling = subscriptionStatus === 'Active' ? endDate : '-'

                          return (
                            <tr key={doctor._id || doctor.id}>
                              <td>
                                <h2 className="table-avatar">
                                  <Link to="#" className="avatar avatar-sm me-2">
                                    <img 
                                      className="avatar-img rounded-circle" 
                                      src={doctorImage} 
                                      alt={doctorName}
                                      onError={(e) => {
                                        e.target.src = '/assets/img/doctors/doctor-thumb-01.jpg'
                                      }}
                                    />
                                  </Link>
                                  <div>
                                    <Link to="#">{doctorName}</Link>
                                    <small className="d-block text-muted">{doctorEmail}</small>
                                  </div>
                                </h2>
                              </td>
                              <td>
                                <strong>{planName}</strong>
                                <small className="d-block text-muted">{planPrice}</small>
                              </td>
                              <td>{getStatusBadge(subscriptionStatus)}</td>
                              <td>{startDate}</td>
                              <td>{endDate}</td>
                              <td>{nextBilling}</td>
                              <td>
                                <div className="actions">
                                  <button
                                    className="btn btn-sm bg-primary-light"
                                    onClick={() => handleChangePlan(doctor)}
                                    title="Change Plan"
                                    disabled={assignMutation.isLoading}
                                  >
                                    <i className="fe fe-edit"></i> Change Plan
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Plan Modal */}
        {showModal && selectedDoctor && (
          <>
            <div 
              className="modal-backdrop fade show" 
              onClick={() => {
                setShowModal(false)
                setSelectedDoctor(null)
                setSelectedPlanId('')
              }}
              style={{ zIndex: 1040 }}
            ></div>
            <div 
              className="modal fade show" 
              style={{ display: 'block', zIndex: 1050 }} 
              onClick={(e) => {
                if (e.target.classList.contains('modal')) {
                  setShowModal(false)
                  setSelectedDoctor(null)
                  setSelectedPlanId('')
                }
              }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                  <div className="modal-header">
                    <h5 className="modal-title">Change Subscription Plan</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowModal(false)
                        setSelectedDoctor(null)
                        setSelectedPlanId('')
                      }}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label"><strong>Doctor:</strong></label>
                      <p>{selectedDoctor.fullName || selectedDoctor.name || '—'}</p>
                      <small className="text-muted">{selectedDoctor.email || ''}</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Current Plan:</strong></label>
                      {(() => {
                        const currentPlan = typeof selectedDoctor.subscriptionPlan === 'object' 
                          ? selectedDoctor.subscriptionPlan 
                          : null
                        const currentPlanName = currentPlan?.name || 'No Plan'
                        const currentPlanPrice = currentPlan ? `€${currentPlan.price?.toFixed(2) || '0.00'}` : 'N/A'
                        return <p>{currentPlanName} ({currentPlanPrice})</p>
                      })()}
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Select New Plan:</strong></label>
                      {plansLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading plans...</span>
                        </div>
                      ) : plans.length === 0 ? (
                        <p className="text-muted">No active subscription plans available</p>
                      ) : (
                        <select
                          className="form-select"
                          value={selectedPlanId}
                          onChange={(e) => setSelectedPlanId(e.target.value)}
                          disabled={assignMutation.isLoading}
                        >
                          <option value="">Select a plan...</option>
                          {plans.map((plan) => (
                            <option key={plan._id} value={plan._id}>
                              {plan.name} - €{plan.price?.toFixed(2) || '0.00'} ({plan.durationInDays} days)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="alert alert-info">
                      <strong>Note:</strong> Assigning a new plan will update the doctor's subscription immediately. 
                      The expiration date will be calculated based on the plan's duration.
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false)
                        setSelectedDoctor(null)
                        setSelectedPlanId('')
                      }}
                      disabled={assignMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSavePlan}
                      disabled={assignMutation.isLoading || !selectedPlanId || plansLoading}
                    >
                      {assignMutation.isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <i className="fe fe-save me-2"></i>
                          Assign Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
    </>
  )
}

export default ManageSubscriptions

