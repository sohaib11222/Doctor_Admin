import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminSpecializations } from '../../queries/adminQueries'
import { useCreateSpecialization, useUpdateSpecialization, useDeleteSpecialization } from '../../mutations/adminMutations'
import { uploadFile } from '../../utils/api'

const Specialities = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSpecialization, setSelectedSpecialization] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: ''
  })
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)

  // Fetch specializations
  const { data: specializationsResponse, isLoading, error, refetch } = useAdminSpecializations()

  // Extract specializations data
  const specializations = useMemo(() => {
    if (!specializationsResponse) return []
    const responseData = specializationsResponse.data || specializationsResponse
    return Array.isArray(responseData) ? responseData : (responseData.specializations || [])
  }, [specializationsResponse])

  // Create mutation
  const createMutation = useCreateSpecialization()
  
  // Update mutation
  const updateMutation = useUpdateSpecialization()
  
  // Delete mutation
  const deleteMutation = useDeleteSpecialization()

  // Handle icon upload
  const handleIconUpload = async (file) => {
    if (!file) return null
    
    setIsUploadingIcon(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadFile('/upload/general', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Get the URL from response
      let iconUrl = response?.data?.url || response?.url || response
      
      // Convert relative URL to full URL if needed
      if (iconUrl && !iconUrl.startsWith('http://') && !iconUrl.startsWith('https://')) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://mydoctoradmin.mydoctorplus.it/api'
        const serverBaseUrl = apiBaseUrl.replace('/api', '')
        iconUrl = iconUrl.startsWith('/') ? `${serverBaseUrl}${iconUrl}` : `${serverBaseUrl}/${iconUrl}`
      }
      
      setIsUploadingIcon(false)
      return iconUrl
    } catch (error) {
      console.error('Icon upload error:', error)
      setIsUploadingIcon(false)
      throw error
    }
  }

  // Handle icon file change
  const handleIconFileChange = (e) => {
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
    
    setIconFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setIconPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Handle add
  const handleAdd = () => {
    setFormData({ name: '', slug: '', description: '', icon: '' })
    setSelectedSpecialization(null)
    setIconFile(null)
    setIconPreview(null)
    setShowAddModal(true)
  }

  // Handle edit
  const handleEdit = (specialization) => {
    setSelectedSpecialization(specialization)
    setFormData({
      name: specialization.name || '',
      slug: specialization.slug || '',
      description: specialization.description || '',
      icon: specialization.icon || ''
    })
    setIconFile(null)
    setIconPreview(specialization.icon || null)
    setShowEditModal(true)
  }

  // Handle delete
  const handleDelete = (specialization) => {
    setSelectedSpecialization(specialization)
    setShowDeleteModal(true)
  }

  // Handle form submit (create)
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Specialization name must be at least 2 characters')
      return
    }

    try {
      let iconUrl = formData.icon.trim() || undefined
      
      // Upload icon file if selected
      if (iconFile) {
        iconUrl = await handleIconUpload(iconFile)
      }
      
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
        icon: iconUrl
      })
      toast.success('Specialization created successfully!')
      setShowAddModal(false)
      setFormData({ name: '', slug: '', description: '', icon: '' })
      setIconFile(null)
      setIconPreview(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create specialization'
      toast.error(errorMessage)
    }
  }

  // Handle form submit (update)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Specialization name must be at least 2 characters')
      return
    }

    try {
      let iconUrl = formData.icon.trim() || undefined
      
      // Upload icon file if selected
      if (iconFile) {
        iconUrl = await handleIconUpload(iconFile)
      }
      
      await updateMutation.mutateAsync({
        id: selectedSpecialization._id,
        data: {
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          icon: iconUrl
        }
      })
      toast.success('Specialization updated successfully!')
      setShowEditModal(false)
      setSelectedSpecialization(null)
      setFormData({ name: '', slug: '', description: '', icon: '' })
      setIconFile(null)
      setIconPreview(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update specialization'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedSpecialization._id)
      toast.success('Specialization deleted successfully!')
      setShowDeleteModal(false)
      setSelectedSpecialization(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete specialization'
      toast.error(errorMessage)
    }
  }

  // Generate slug from name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  return (
    <>
      <div className="page-header">
            <div className="row">
              <div className="col-sm-7 col-auto">
                <h3 className="page-title">Specialities</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Specialities</li>
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
                    <table className="datatable table table-hover table-center mb-0" id="specialities_data">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Specialities</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2 mb-0">Loading specializations...</p>
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              <p className="text-danger">Error loading specializations: {error.message || 'Unknown error'}</p>
                              <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                            </td>
                          </tr>
                        ) : specializations.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              <p className="text-muted">No specializations found</p>
                              <button className="btn btn-sm btn-primary mt-2" onClick={handleAdd}>Add First Specialization</button>
                            </td>
                          </tr>
                        ) : (
                          specializations.map((specialization, idx) => (
                            <tr key={specialization._id}>
                              <td>{idx + 1}</td>
                              <td>
                                <h2 className="table-avatar">
                                  {specialization.icon ? (
                                    <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                      <img 
                                        className="avatar-img" 
                                        src={specialization.icon} 
                                        alt={specialization.name}
                                        onError={(e) => {
                                          e.target.style.display = 'none'
                                          e.target.nextSibling.style.display = 'flex'
                                        }}
                                      />
                                      <span 
                                        className="avatar-title rounded" 
                                        style={{ display: 'none', backgroundColor: '#f0f0f0', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center' }}
                                      >
                                        {specialization.name.charAt(0).toUpperCase()}
                                      </span>
                                    </a>
                                  ) : (
                                    <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                      <span 
                                        className="avatar-title rounded" 
                                        style={{ backgroundColor: '#f0f0f0', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      >
                                        {specialization.name.charAt(0).toUpperCase()}
                                      </span>
                                    </a>
                                  )}
                                  <a href="javascript:void(0);">{specialization.name}</a>
                                  {specialization.description && (
                                    <small className="d-block text-muted">{specialization.description}</small>
                                  )}
                                </h2>
                              </td>
                              <td>
                                <div className="actions">
                                  <button 
                                    className="btn btn-sm bg-success-light me-2" 
                                    onClick={() => handleEdit(specialization)}
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
                                    onClick={() => handleDelete(specialization)}
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
                  <h5 className="modal-title">Add Specialization</h5>
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
                          <label className="mb-2">Specialization Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                name: e.target.value,
                                slug: prev.slug || generateSlug(e.target.value)
                              }))
                            }}
                            required
                            disabled={createMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Slug</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="Auto-generated from name"
                            disabled={createMutation.isLoading}
                          />
                          <small className="text-muted">Leave empty to auto-generate from name</small>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Description</label>
                          <textarea 
                            className="form-control" 
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            disabled={createMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Icon</label>
                          <div className="mb-2">
                            <input 
                              type="file" 
                              className="form-control" 
                              accept="image/*"
                              onChange={handleIconFileChange}
                              disabled={createMutation.isLoading || isUploadingIcon}
                            />
                            <small className="text-muted d-block mt-1">Upload an image file (JPEG, PNG, WebP - Max 5MB) or enter URL below</small>
                          </div>
                          {iconPreview && (
                            <div className="mb-2">
                              <img 
                                src={iconPreview} 
                                alt="Icon preview" 
                                style={{ 
                                  maxWidth: '100px', 
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
                            <label className="mb-2">Or enter Icon URL</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formData.icon}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, icon: e.target.value }))
                                if (!iconFile) {
                                  setIconPreview(e.target.value || null)
                                }
                              }}
                              placeholder="https://example.com/icon.png"
                              disabled={createMutation.isLoading || isUploadingIcon}
                            />
                          </div>
                          {isUploadingIcon && (
                            <small className="text-info d-block mt-1">
                              <i className="fa fa-spinner fa-spin me-1"></i>Uploading icon...
                            </small>
                          )}
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
                        'Create Specialization'
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
      {showEditModal && selectedSpecialization && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowEditModal(false)
              setSelectedSpecialization(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowEditModal(false)
                setSelectedSpecialization(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Specialization</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedSpecialization(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Specialization Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                name: e.target.value,
                                slug: prev.slug || generateSlug(e.target.value)
                              }))
                            }}
                            required
                            disabled={updateMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Slug</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            disabled={updateMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Description</label>
                          <textarea 
                            className="form-control" 
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            disabled={updateMutation.isLoading}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Icon</label>
                          <div className="mb-2">
                            <input 
                              type="file" 
                              className="form-control" 
                              accept="image/*"
                              onChange={handleIconFileChange}
                              disabled={updateMutation.isLoading || isUploadingIcon}
                            />
                            <small className="text-muted d-block mt-1">Upload an image file (JPEG, PNG, WebP - Max 5MB) or enter URL below</small>
                          </div>
                          {iconPreview && (
                            <div className="mb-2">
                              <img 
                                src={iconPreview} 
                                alt="Icon preview" 
                                style={{ 
                                  maxWidth: '100px', 
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
                            <label className="mb-2">Or enter Icon URL</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formData.icon}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, icon: e.target.value }))
                                if (!iconFile) {
                                  setIconPreview(e.target.value || null)
                                }
                              }}
                              placeholder="https://example.com/icon.png"
                              disabled={updateMutation.isLoading || isUploadingIcon}
                            />
                          </div>
                          {isUploadingIcon && (
                            <small className="text-info d-block mt-1">
                              <i className="fa fa-spinner fa-spin me-1"></i>Uploading icon...
                            </small>
                          )}
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
                        setSelectedSpecialization(null)
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
                        'Update Specialization'
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
      {showDeleteModal && selectedSpecialization && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedSpecialization(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setSelectedSpecialization(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Specialization</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{selectedSpecialization.name}</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setShowDeleteModal(false)
                          setSelectedSpecialization(null)
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

export default Specialities

