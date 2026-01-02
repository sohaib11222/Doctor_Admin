import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminSubscriptionPlans } from '../../queries/adminQueries'
import { useCreateSubscriptionPlan, useUpdateSubscriptionPlan, useDeleteSubscriptionPlan } from '../../mutations/adminMutations'

const SubscriptionPlans = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationInDays: '',
    features: [''],
    status: 'ACTIVE'
  })
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch subscription plans
  const { data: plansResponse, isLoading, error, refetch } = useAdminSubscriptionPlans(
    statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {}
  )

  // Extract plans data
  const plans = useMemo(() => {
    if (!plansResponse) return []
    const responseData = plansResponse.data || plansResponse
    return Array.isArray(responseData) ? responseData : (responseData.plans || [])
  }, [plansResponse])

  // Create mutation
  const createMutation = useCreateSubscriptionPlan()
  
  // Update mutation
  const updateMutation = useUpdateSubscriptionPlan()
  
  // Delete mutation
  const deleteMutation = useDeleteSubscriptionPlan()

  // Handle add
  const handleAdd = () => {
    setFormData({ name: '', price: '', durationInDays: '', features: [''] })
    setSelectedPlan(null)
    setShowAddModal(true)
  }

  // Handle edit
  const handleEdit = (plan) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name || '',
      price: plan.price || '',
      durationInDays: plan.durationInDays || '',
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      status: plan.status || 'ACTIVE'
    })
    setShowEditModal(true)
  }

  // Handle delete
  const handleDelete = (plan) => {
    setSelectedPlan(plan)
    setShowDeleteModal(true)
  }

  // Handle feature change
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  // Add feature field
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  // Remove feature field
  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] })
  }

  // Handle form submit (create)
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 1) {
      toast.error('Plan name is required')
      return
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Price must be a non-negative number')
      return
    }

    if (!formData.durationInDays || parseInt(formData.durationInDays) < 1) {
      toast.error('Duration must be a positive integer')
      return
    }

    try {
      const features = formData.features.filter(f => f.trim().length > 0)
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        features: features.length > 0 ? features : undefined
      })
      toast.success('Subscription plan created successfully!')
      setShowAddModal(false)
      setFormData({ name: '', price: '', durationInDays: '', features: [''] })
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create subscription plan'
      toast.error(errorMessage)
    }
  }

  // Handle form submit (update)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 1) {
      toast.error('Plan name is required')
      return
    }

    if (formData.price && parseFloat(formData.price) < 0) {
      toast.error('Price must be a non-negative number')
      return
    }

    if (formData.durationInDays && parseInt(formData.durationInDays) < 1) {
      toast.error('Duration must be a positive integer')
      return
    }

    try {
      const updateData = {}
      if (formData.name) updateData.name = formData.name.trim()
      if (formData.price) updateData.price = parseFloat(formData.price)
      if (formData.durationInDays) updateData.durationInDays = parseInt(formData.durationInDays)
      
      const features = formData.features.filter(f => f.trim().length > 0)
      if (features.length > 0) {
        updateData.features = features
      }

      if (formData.status) {
        updateData.status = formData.status
      }

      await updateMutation.mutateAsync({
        planId: selectedPlan._id,
        data: updateData
      })
      toast.success('Subscription plan updated successfully!')
      setShowEditModal(false)
      setSelectedPlan(null)
      setFormData({ name: '', price: '', durationInDays: '', features: [''] })
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update subscription plan'
      toast.error(errorMessage)
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (plan) => {
    try {
      await updateMutation.mutateAsync({
        planId: plan._id,
        data: {
          status: plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }
      })
      toast.success(`Subscription plan ${plan.status === 'ACTIVE' ? 'deactivated' : 'activated'} successfully!`)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update subscription plan status'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedPlan._id)
      toast.success('Subscription plan deleted successfully!')
      setShowDeleteModal(false)
      setSelectedPlan(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete subscription plan'
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
          <div className="col-sm-5 col">
            <button 
              className="btn btn-primary float-end mt-2"
              onClick={handleAdd}
            >
              <i className="fa fa-plus me-1"></i>Add Plan
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
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
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
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
                        <td colSpan="7" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading subscription plans...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-danger">Error loading subscription plans: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : plans.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-muted">No subscription plans found</p>
                          <button className="btn btn-sm btn-primary mt-2" onClick={handleAdd}>Add First Plan</button>
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan, idx) => (
                        <tr key={plan._id}>
                          <td>{idx + 1}</td>
                          <td>
                            <strong>{plan.name}</strong>
                          </td>
                          <td>${plan.price?.toFixed(2) || '0.00'}</td>
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
                              >
                                <i className="feather-edit"></i>
                              </button>
                              <button 
                                className="btn btn-sm bg-info-light me-2" 
                                onClick={() => handleStatusToggle(plan)}
                                title={plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                disabled={updateMutation.isLoading}
                              >
                                <i className={`feather-${plan.status === 'ACTIVE' ? 'eye-off' : 'eye'}`}></i>
                              </button>
                              <button 
                                className="btn btn-sm bg-danger-light" 
                                onClick={() => handleDelete(plan)}
                                title="Delete"
                              >
                                <i className="feather-trash-2"></i>
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

      {/* Add Modal */}
      {showAddModal && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => setShowAddModal(false)}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowAddModal(false)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Subscription Plan</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAddModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleCreateSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Plan Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            disabled={createMutation.isLoading}
                            placeholder="e.g., BASIC, PREMIUM, ENTERPRISE"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Price ($) <span className="text-danger">*</span></label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            min="0"
                            step="0.01"
                            required
                            disabled={createMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Duration (Days) <span className="text-danger">*</span></label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={formData.durationInDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, durationInDays: e.target.value }))}
                            min="1"
                            required
                            disabled={createMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Features</label>
                          {formData.features.map((feature, index) => (
                            <div key={index} className="input-group mb-2">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`Feature ${index + 1}`}
                                disabled={createMutation.isLoading}
                              />
                              {formData.features.length > 1 && (
                                <button 
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => removeFeature(index)}
                                  disabled={createMutation.isLoading}
                                >
                                  <i className="feather-x"></i>
                                </button>
                              )}
                            </div>
                          ))}
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addFeature}
                            disabled={createMutation.isLoading}
                          >
                            <i className="feather-plus me-1"></i>Add Feature
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddModal(false)}
                      disabled={createMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={createMutation.isLoading}
                    >
                      {createMutation.isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        'Create Plan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

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
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Plan Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            disabled={updateMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Price ($)</label>
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
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Duration (Days)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={formData.durationInDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, durationInDays: e.target.value }))}
                            min="1"
                            disabled={updateMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Features</label>
                          {formData.features.map((feature, index) => (
                            <div key={index} className="input-group mb-2">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`Feature ${index + 1}`}
                                disabled={updateMutation.isLoading}
                              />
                              {formData.features.length > 1 && (
                                <button 
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => removeFeature(index)}
                                  disabled={updateMutation.isLoading}
                                >
                                  <i className="feather-x"></i>
                                </button>
                              )}
                            </div>
                          ))}
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addFeature}
                            disabled={updateMutation.isLoading}
                          >
                            <i className="feather-plus me-1"></i>Add Feature
                          </button>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Status</label>
                          <select 
                            className="form-select"
                            value={formData.status || 'ACTIVE'}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            disabled={updateMutation.isLoading}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
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

      {/* Delete Modal */}
      {showDeleteModal && selectedPlan && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedPlan(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setSelectedPlan(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Subscription Plan</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{selectedPlan.name}</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setShowDeleteModal(false)
                          setSelectedPlan(null)
                        }}
                        disabled={deleteMutation.isLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={handleDeleteConfirm}
                        disabled={deleteMutation.isLoading}
                      >
                        {deleteMutation.isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default SubscriptionPlans

