import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminPharmacies } from '../../queries/adminQueries'
import { useCreatePharmacy, useUpdatePharmacy, useDeletePharmacy } from '../../mutations/adminMutations'
import { post as apiPost } from '../../utils/api'

const Pharmacies = () => {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      zip: ''
    },
    location: {
      lat: '',
      lng: ''
    },
    isActive: true
  })
  const [logoFile, setLogoFile] = useState(null)

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (searchFilter) params.search = searchFilter
    if (cityFilter) params.city = cityFilter
    return params
  }, [searchFilter, cityFilter])

  // Fetch pharmacies
  const { data: pharmaciesResponse, isLoading, error, refetch } = useAdminPharmacies(queryParams)

  // Create mutation
  const createMutation = useCreatePharmacy()
  
  // Update mutation
  const updateMutation = useUpdatePharmacy()
  
  // Delete mutation
  const deleteMutation = useDeletePharmacy()

  // Extract pharmacies data
  const pharmacies = useMemo(() => {
    if (!pharmaciesResponse) return []
    const responseData = pharmaciesResponse.data || pharmaciesResponse
    return Array.isArray(responseData) ? responseData : (responseData.pharmacies || [])
  }, [pharmaciesResponse])

  // Extract pagination data
  const pagination = useMemo(() => {
    if (!pharmaciesResponse) return null
    const responseData = pharmaciesResponse.data || pharmaciesResponse
    return responseData.pagination || null
  }, [pharmaciesResponse])

  // Handle create
  const handleCreate = () => {
    setEditingPharmacy(null)
    setFormData({
      name: '',
      logo: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        zip: ''
      },
      location: {
        lat: '',
        lng: ''
      },
      isActive: true
    })
    setLogoFile(null)
    setShowModal(true)
  }

  // Handle edit
  const handleEdit = (pharmacy) => {
    setEditingPharmacy(pharmacy)
    setFormData({
      // ownerId is not editable - automatically set by backend
      name: pharmacy.name || '',
      logo: pharmacy.logo || '',
      phone: pharmacy.phone || '',
      address: {
        line1: pharmacy.address?.line1 || '',
        line2: pharmacy.address?.line2 || '',
        city: pharmacy.address?.city || '',
        state: pharmacy.address?.state || '',
        country: pharmacy.address?.country || '',
        zip: pharmacy.address?.zip || ''
      },
      location: {
        lat: pharmacy.location?.lat || '',
        lng: pharmacy.location?.lng || ''
      },
      isActive: pharmacy.isActive !== undefined ? pharmacy.isActive : true
    })
    setLogoFile(null)
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = (pharmacy) => {
    setEditingPharmacy(pharmacy)
    setShowDeleteModal(true)
  }

  // Handle logo upload
  const handleLogoUpload = async (file) => {
    if (!file) return null
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiPost('/upload/pharmacy', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Get the URL from response
      let logoUrl = response?.data?.url || response?.url || response
      
      // Convert relative URL to full URL if needed
      if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'
        const serverBaseUrl = apiBaseUrl.replace('/api', '')
        logoUrl = logoUrl.startsWith('/') ? `${serverBaseUrl}${logoUrl}` : `${serverBaseUrl}/${logoUrl}`
      }
      
      return logoUrl
    } catch (error) {
      console.error('Logo upload error:', error)
      throw error
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter pharmacy name')
      return
    }

    try {
      let logoUrl = formData.logo

      // Upload logo if new file selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile)
      }

      const pharmacyData = {
        // ownerId is automatically set by backend from logged-in admin
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        isActive: formData.isActive,
        ...(logoUrl && { logo: logoUrl }),
        ...(formData.address.line1 || formData.address.city ? {
          address: {
            ...(formData.address.line1 && { line1: formData.address.line1 }),
            ...(formData.address.line2 && { line2: formData.address.line2 }),
            ...(formData.address.city && { city: formData.address.city }),
            ...(formData.address.state && { state: formData.address.state }),
            ...(formData.address.country && { country: formData.address.country }),
            ...(formData.address.zip && { zip: formData.address.zip })
          }
        } : {}),
        ...(formData.location.lat && formData.location.lng ? {
          location: {
            lat: parseFloat(formData.location.lat),
            lng: parseFloat(formData.location.lng)
          }
        } : {})
      }

      if (editingPharmacy) {
        await updateMutation.mutateAsync({
          pharmacyId: editingPharmacy._id,
          data: pharmacyData
        })
        toast.success('Pharmacy updated successfully!')
      } else {
        await createMutation.mutateAsync(pharmacyData)
        toast.success('Pharmacy created successfully!')
      }

      setShowModal(false)
      setEditingPharmacy(null)
      setLogoFile(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save pharmacy'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!editingPharmacy) return

    try {
      await deleteMutation.mutateAsync(editingPharmacy._id)
      toast.success('Pharmacy deleted successfully!')
      setShowDeleteModal(false)
      setEditingPharmacy(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete pharmacy'
      toast.error(errorMessage)
    }
  }

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'N/A'
    const parts = []
    if (address.line1) parts.push(address.line1)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.country) parts.push(address.country)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  // Get owner name
  const getOwnerName = (owner) => {
    if (!owner) return 'N/A'
    if (typeof owner === 'object') {
      return owner.fullName || owner.email || 'Unknown Owner'
    }
    return 'Unknown Owner'
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Pharmacies</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Pharmacies</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label className="mb-2">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or city"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label className="mb-2">City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter by city"
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group d-flex align-items-end">
                    <button className="btn btn-primary w-100" onClick={handleCreate}>
                      <i className="fe fe-plus me-2"></i>
                      Add Pharmacy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacies Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Pharmacy Name</th>
                      <th>Owner</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading pharmacies...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="text-danger">Error loading pharmacies: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : pharmacies.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="text-muted">No pharmacies found</p>
                          <button className="btn btn-sm btn-primary mt-2" onClick={handleCreate}>Add First Pharmacy</button>
                        </td>
                      </tr>
                    ) : (
                      pharmacies.map((pharmacy) => (
                        <tr key={pharmacy._id}>
                          <td>
                            <h2 className="table-avatar">
                              {pharmacy.logo && (
                                <a href="#" className="avatar avatar-sm me-2">
                                  <img
                                    className="avatar-img rounded-circle"
                                    src={pharmacy.logo}
                                    alt="Pharmacy Logo"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </a>
                              )}
                              <a href="#">{pharmacy.name}</a>
                            </h2>
                          </td>
                          <td>{getOwnerName(pharmacy.ownerId)}</td>
                          <td>{formatAddress(pharmacy.address)}</td>
                          <td>{pharmacy.phone || 'N/A'}</td>
                          <td>
                            {pharmacy.isActive ? (
                              <span className="badge bg-success-light">Active</span>
                            ) : (
                              <span className="badge bg-danger-light">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn btn-sm bg-success-light me-2"
                                onClick={() => handleEdit(pharmacy)}
                                title="Edit"
                                disabled={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
                              >
                                <i className="feather-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm bg-danger-light"
                                onClick={() => handleDelete(pharmacy)}
                                title="Delete"
                                disabled={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
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

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <p className="text-muted mb-0">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} pharmacies
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowModal(false)
              setEditingPharmacy(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowModal(false)
                setEditingPharmacy(null)
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPharmacy(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Note: ownerId is automatically set by backend from logged-in admin */}
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Pharmacy Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter pharmacy name"
                        required
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Logo URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="Enter logo URL or upload file below"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Upload Logo</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files[0])}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Address Line 1</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.line1}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, line1: e.target.value }
                        })}
                        placeholder="Street address"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Address Line 2</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.line2}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, line2: e.target.value }
                        })}
                        placeholder="Apartment, suite, etc."
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })}
                        placeholder="City"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value }
                        })}
                        placeholder="State"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.country}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value }
                        })}
                        placeholder="Country"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.zip}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, zip: e.target.value }
                        })}
                        placeholder="ZIP code"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={formData.location.lat}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, lat: e.target.value }
                        })}
                        placeholder="Latitude"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      value={formData.location.lng}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, lng: e.target.value }
                      })}
                      placeholder="Longitude"
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPharmacy(null)
                    }}
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingPharmacy ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fe fe-save me-2"></i>
                        {editingPharmacy ? 'Update' : 'Create'} Pharmacy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && editingPharmacy && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowDeleteModal(false)
              setEditingPharmacy(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setEditingPharmacy(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Pharmacy</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{editingPharmacy.name}</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteModal(false)
                          setEditingPharmacy(null)
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
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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

export default Pharmacies

