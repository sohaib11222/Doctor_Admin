import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { useAdminSubscriptionPlans } from '../../queries/adminQueries'
import { useUpdateSubscriptionPlan } from '../../mutations/adminMutations'

const SubscriptionPlans = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData] = useState({
    price: '',
    name: ''
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [targetRole, setTargetRole] = useState('PHARMACY')

  // Fetch subscription plans
  const { data: plansResponse, isLoading, error, refetch } = useAdminSubscriptionPlans(
    {
      ...(statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {}),
      targetRole
    }
  )

  // Extract plans data
  const plans = useMemo(() => {
    if (!plansResponse) return []
    const responseData = plansResponse.data || plansResponse
    return Array.isArray(responseData) ? responseData : (responseData.plans || [])
  }, [plansResponse])

  // Update mutation
  const updateMutation = useUpdateSubscriptionPlan()

  // Handle edit
  const handleEdit = (plan) => {
    setSelectedPlan(plan)
    setFormData({
      price: plan.price || '',
      name: plan.name || ''
    })
    setShowEditModal(true)
  }

  // Handle form submit (update)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Price must be a non-negative number')
      return
    }

    try {
      const updateData = { price: parseFloat(formData.price) }

      await updateMutation.mutateAsync({
        planId: selectedPlan._id,
        data: updateData
      })
      toast.success('Subscription plan updated successfully!')
      setShowEditModal(false)
      setSelectedPlan(null)
      setFormData({ name: '', price: '' })
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update subscription plan'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-7 col-auto">
            <h3 className="page-title">Subscription Plans</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active">Subscription Plans</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <label className="mb-0">Target Role:</label>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="PHARMACY">Pharmacy</option>
                </select>
                <label className="mb-0">Filter by Status:</label>
                <select 
                  className="form-select" 
                  style={{ width: 'auto' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="alert alert-info mb-3">
                Subscription plans are fixed. Admin can update prices only.
              </div>
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Role</th>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Features</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading subscription plans...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <p className="text-danger">Error loading subscription plans: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : plans.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <p className="text-muted">No subscription plans found</p>
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan, idx) => (
                        <tr key={plan._id}>
                          <td>{idx + 1}</td>
                          <td>{plan.targetRole || targetRole}</td>
                          <td>
                            <strong>{plan.name}</strong>
                          </td>
                          <td>€{plan.price?.toFixed(2) || '0.00'}</td>
                          <td>{plan.durationInDays} days</td>
                          <td>
                            {plan.features && plan.features.length > 0 ? (
                              <ul className="list-unstyled mb-0">
                                {plan.features.slice(0, 2).map((feature, i) => (
                                  <li key={i}><small>{feature}</small></li>
                                ))}
                                {plan.features.length > 2 && (
                                  <li><small className="text-muted">+{plan.features.length - 2} more</small></li>
                                )}
                              </ul>
                            ) : (
                              <span className="text-muted">No features</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${plan.status === 'ACTIVE' ? 'bg-success-light' : 'bg-danger-light'}`}>
                              {plan.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <div className="actions">
                              <button 
                                className="btn btn-sm bg-success-light me-2" 
                                onClick={() => handleEdit(plan)}
                                title="Edit"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  minWidth: '32px',
                                  height: '32px',
                                  padding: '4px 8px',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className="fa fa-edit" style={{ 
                                  fontSize: '14px', 
                                  display: 'inline-block', 
                                  lineHeight: '1', 
                                  visibility: 'visible', 
                                  opacity: 1
                                }}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedPlan && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowEditModal(false)
              setSelectedPlan(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowEditModal(false)
                setSelectedPlan(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Subscription Plan</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedPlan(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Plan</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Price (€)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            min="0"
                            step="0.01"
                            disabled={updateMutation.isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedPlan(null)
                      }}
                      disabled={updateMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updateMutation.isLoading}
                    >
                      {updateMutation.isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Plan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default SubscriptionPlans

