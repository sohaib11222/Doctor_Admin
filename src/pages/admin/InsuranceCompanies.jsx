import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminInsuranceCompanies } from '../../queries/adminQueries'
import { useCreateInsuranceCompany, useUpdateInsuranceCompany, useDeleteInsuranceCompany, useToggleInsuranceCompanyStatus } from '../../mutations/adminMutations'
import { uploadFile } from '../../utils/api'

const InsuranceCompanies = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInsurance, setSelectedInsurance] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Fetch insurance companies
  const { data: insuranceResponse, isLoading, error, refetch } = useAdminInsuranceCompanies()

  // Extract insurance companies data
  const insuranceCompanies = useMemo(() => {
    if (!insuranceResponse) return []
    const responseData = insuranceResponse.data || insuranceResponse
    return Array.isArray(responseData) ? responseData : (responseData.companies || [])
  }, [insuranceResponse])

  // Create mutation
  const createMutation = useCreateInsuranceCompany()
  
  // Update mutation
  const updateMutation = useUpdateInsuranceCompany()
  
  // Delete mutation
  const deleteMutation = useDeleteInsuranceCompany()

  // Toggle status mutation
  const toggleStatusMutation = useToggleInsuranceCompanyStatus()

  // Handle logo upload
  const handleLogoUpload = async (file) => {
    if (!file) return null
    
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadFile('/upload/general', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Get the URL from response
      let logoUrl = response?.data?.url || response?.url || response
      
      // Convert relative URL to full URL if needed
      if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://mydoctoradmin.mydoctorplus.it/api'
        const serverBaseUrl = apiBaseUrl.replace('/api', '')
        logoUrl = logoUrl.startsWith('/') ? `${serverBaseUrl}${logoUrl}` : `${serverBaseUrl}/${logoUrl}`
      }
      
      setIsUploadingLogo(false)
      return logoUrl
    } catch (error) {
      console.error('Logo upload error:', error)
      setIsUploadingLogo(false)
      throw error
    }
  }

  // Handle logo file change
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    
    setLogoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Handle add
  const handleAdd = () => {
    setFormData({ name: '', logo: '' })
    setSelectedInsurance(null)
    setLogoFile(null)
    setLogoPreview(null)
    setShowAddModal(true)
  }

  // Handle edit
  const handleEdit = (insurance) => {
    setSelectedInsurance(insurance)
    setFormData({
      name: insurance.name || '',
      logo: insurance.logo || ''
    })
    setLogoFile(null)
    setLogoPreview(insurance.logo || null)
    setShowEditModal(true)
  }

  // Handle delete
  const handleDelete = (insurance) => {
    setSelectedInsurance(insurance)
    setShowDeleteModal(true)
  }

  // Handle toggle status
  const handleToggleStatus = async (insurance) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: insurance._id,
        isActive: !insurance.isActive
      })
      toast.success(`Insurance company ${!insurance.isActive ? 'activated' : 'deactivated'} successfully!`)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status'
      toast.error(errorMessage)
    }
  }

  // Handle form submit (create)
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Insurance company name must be at least 2 characters')
      return
    }

    try {
      let logoUrl = formData.logo.trim() || undefined
      
      // Upload logo file if selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile)
      }
      
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        logo: logoUrl,
        isActive: true
      })
      toast.success('Insurance company created successfully!')
      setShowAddModal(false)
      setFormData({ name: '', logo: '' })
      setLogoFile(null)
      setLogoPreview(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create insurance company'
      toast.error(errorMessage)
    }
  }

  // Handle form submit (update)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Insurance company name must be at least 2 characters')
      return
    }

    try {
      let logoUrl = formData.logo.trim() || undefined
      
      // Upload logo file if selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile)
      }
      
      await updateMutation.mutateAsync({
        id: selectedInsurance._id,
        data: {
          name: formData.name.trim(),
          logo: logoUrl
        }
      })
      toast.success('Insurance company updated successfully!')
      setShowEditModal(false)
      setSelectedInsurance(null)
      setFormData({ name: '', logo: '' })
      setLogoFile(null)
      setLogoPreview(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update insurance company'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedInsurance._id)
      toast.success('Insurance company deleted successfully!')
      setShowDeleteModal(false)
      setSelectedInsurance(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete insurance company'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-7 col-auto">
            <h3 className="page-title">Insurance Companies</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active">Insurance Companies</li>
            </ul>
          </div>
          <div className="col-sm-5 col">
            <button 
              className="btn btn-primary float-end mt-2"
              onClick={handleAdd}
            >
              <i className="fa fa-plus me-1"></i>Add
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0" id="insurance_companies_data">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Logo</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading insurance companies...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <p className="text-danger">Error loading insurance companies: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : insuranceCompanies.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <p className="text-muted">No insurance companies found</p>
                          <button className="btn btn-sm btn-primary mt-2" onClick={handleAdd}>Add First Insurance Company</button>
                        </td>
                      </tr>
                    ) : (
                      insuranceCompanies.map((insurance, idx) => (
                        <tr key={insurance._id}>
                          <td>{idx + 1}</td>
                          <td>
                            {insurance.logo ? (
                              <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                <img 
                                  className="avatar-img" 
                                  src={insurance.logo} 
                                  alt={insurance.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                />
                                <span 
                                  className="avatar-title rounded" 
                                  style={{ display: 'none', backgroundColor: '#f0f0f0', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  {insurance.name.charAt(0).toUpperCase()}
                                </span>
                              </a>
                            ) : (
                              <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                <span 
                                  className="avatar-title rounded" 
                                  style={{ backgroundColor: '#f0f0f0', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  {insurance.name.charAt(0).toUpperCase()}
                                </span>
                              </a>
                            )}
                          </td>
                          <td>
                            <h2 className="table-avatar">
                              <a href="javascript:void(0);">{insurance.name}</a>
                            </h2>
                          </td>
                          <td>
                            <span className={`badge ${insurance.isActive ? 'bg-success' : 'bg-danger'}`}>
                              {insurance.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="actions">
                              <button 
                                className={`btn btn-sm ${insurance.isActive ? 'bg-warning-light' : 'bg-success-light'} me-2`}
                                onClick={() => handleToggleStatus(insurance)}
                                disabled={toggleStatusMutation.isPending}
                                title={insurance.isActive ? 'Deactivate' : 'Activate'}
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
                                <i className={`fa fa-${insurance.isActive ? 'ban' : 'check'}`} style={{ 
                                  fontSize: '14px', 
                                  display: 'inline-block', 
                                  lineHeight: '1', 
                                  visibility: 'visible', 
                                  opacity: 1
                                }}></i>
                              </button>
                              <button 
                                className="btn btn-sm bg-success-light me-2" 
                                onClick={() => handleEdit(insurance)}
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
                              <button 
                                className="btn btn-sm bg-danger-light" 
                                onClick={() => handleDelete(insurance)}
                                title="Delete"
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
                                <i className="fa fa-trash" style={{ 
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
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Insurance Company</h5>
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
                          <label className="mb-2">Company Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            disabled={createMutation.isPending}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Logo</label>
                          <div className="mb-2">
                            <input 
                              type="file" 
                              className="form-control" 
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              disabled={createMutation.isPending || isUploadingLogo}
                            />
                            <small className="text-muted d-block mt-1">Upload an image file (JPEG, PNG, WebP - Max 5MB) or enter URL below</small>
                          </div>
                          {logoPreview && (
                            <div className="mb-2">
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                style={{ 
                                  maxWidth: '150px', 
                                  maxHeight: '100px', 
                                  objectFit: 'contain',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '4px'
                                }} 
                              />
                            </div>
                          )}
                          <div className="mt-2">
                            <label className="mb-2">Or enter Logo URL</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formData.logo}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, logo: e.target.value }))
                                if (!logoFile) {
                                  setLogoPreview(e.target.value || null)
                                }
                              }}
                              placeholder="https://example.com/logo.png"
                              disabled={createMutation.isPending || isUploadingLogo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddModal(false)}
                      disabled={createMutation.isPending || isUploadingLogo}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={createMutation.isPending || isUploadingLogo}
                    >
                      {createMutation.isPending || isUploadingLogo ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {isUploadingLogo ? 'Uploading...' : 'Creating...'}
                        </>
                      ) : (
                        'Create'
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
      {showEditModal && selectedInsurance && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => setShowEditModal(false)}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowEditModal(false)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Insurance Company</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowEditModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Company Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            disabled={updateMutation.isPending}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Logo</label>
                          <div className="mb-2">
                            <input 
                              type="file" 
                              className="form-control" 
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              disabled={updateMutation.isPending || isUploadingLogo}
                            />
                            <small className="text-muted d-block mt-1">Upload an image file (JPEG, PNG, WebP - Max 5MB) or enter URL below</small>
                          </div>
                          {logoPreview && (
                            <div className="mb-2">
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                style={{ 
                                  maxWidth: '150px', 
                                  maxHeight: '100px', 
                                  objectFit: 'contain',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '4px'
                                }} 
                              />
                            </div>
                          )}
                          <div className="mt-2">
                            <label className="mb-2">Or enter Logo URL</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formData.logo}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, logo: e.target.value }))
                                if (!logoFile) {
                                  setLogoPreview(e.target.value || null)
                                }
                              }}
                              placeholder="https://example.com/logo.png"
                              disabled={updateMutation.isPending || isUploadingLogo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowEditModal(false)}
                      disabled={updateMutation.isPending || isUploadingLogo}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updateMutation.isPending || isUploadingLogo}
                    >
                      {updateMutation.isPending || isUploadingLogo ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {isUploadingLogo ? 'Uploading...' : 'Updating...'}
                        </>
                      ) : (
                        'Update'
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
      {showDeleteModal && selectedInsurance && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => setShowDeleteModal(false)}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Insurance Company</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowDeleteModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete <strong>{selectedInsurance.name}</strong>?</p>
                  <p className="text-danger mb-0">This action cannot be undone. If doctors are using this insurance company, deletion will fail.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
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
        </>
      )}
    </>
  )
}

export default InsuranceCompanies
