import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminAnnouncements, useAdminSpecializations } from '../../queries/adminQueries'
import { useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '../../mutations/adminMutations'
import { post as apiPost } from '../../utils/api'

const AnnouncementsManagement = () => {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: '',
    file: '',
    link: '',
    priority: 'NORMAL',
    announcementType: 'BROADCAST',
    isPinned: false,
    expiryType: 'NO_EXPIRY',
    expiryDate: '',
    isActive: true,
    targetCriteria: {
      specializationIds: [],
      subscriptionPlanIds: [],
      individualDoctorIds: [],
      location: {
        city: '',
        state: '',
        country: ''
      }
    }
  })
  const [imageFile, setImageFile] = useState(null)
  const [fileFile, setFileFile] = useState(null)

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (priorityFilter !== 'all') params.priority = priorityFilter.toUpperCase()
    if (typeFilter !== 'all') params.announcementType = typeFilter.toUpperCase()
    if (activeFilter !== 'all') params.isActive = activeFilter === 'active'
    return params
  }, [priorityFilter, typeFilter, activeFilter])

  // Fetch announcements
  const { data: announcementsResponse, isLoading, error, refetch } = useAdminAnnouncements(queryParams)

  // Fetch specializations for targeted announcements
  const { data: specializationsResponse } = useAdminSpecializations()

  // Extract announcements data
  const announcements = useMemo(() => {
    if (!announcementsResponse) return []
    const responseData = announcementsResponse.data || announcementsResponse
    return Array.isArray(responseData) ? responseData : (responseData.announcements || [])
  }, [announcementsResponse])

  // Extract specializations data
  const specializations = useMemo(() => {
    if (!specializationsResponse) return []
    const responseData = specializationsResponse.data || specializationsResponse
    return Array.isArray(responseData) ? responseData : (responseData.specializations || [])
  }, [specializationsResponse])

  // Create mutation
  const createMutation = useCreateAnnouncement()
  
  // Update mutation
  const updateMutation = useUpdateAnnouncement()
  
  // Delete mutation
  const deleteMutation = useDeleteAnnouncement()

  // Handle create
  const handleCreate = () => {
    setEditingAnnouncement(null)
    setFormData({
      title: '',
      message: '',
      image: '',
      file: '',
      link: '',
      priority: 'NORMAL',
      announcementType: 'BROADCAST',
      isPinned: false,
      expiryType: 'NO_EXPIRY',
      expiryDate: '',
      isActive: true,
      targetCriteria: {
        specializationIds: [],
        subscriptionPlanIds: [],
        individualDoctorIds: [],
        location: { city: '', state: '', country: '' }
      }
    })
    setImageFile(null)
    setFileFile(null)
    setShowModal(true)
  }

  // Handle edit
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    
    // Extract specialization IDs from targetCriteria
    const specializationIds = announcement.targetCriteria?.specializationIds || []
    const specializationIdStrings = specializationIds.map(id => 
      typeof id === 'object' ? id._id || id : id
    ).filter(Boolean)

    setFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      image: announcement.image || '',
      file: announcement.file || '',
      link: announcement.link || '',
      priority: announcement.priority || 'NORMAL',
      announcementType: announcement.announcementType || 'BROADCAST',
      isPinned: announcement.isPinned || false,
      expiryType: announcement.expiryType || 'NO_EXPIRY',
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().split('T')[0] : '',
      isActive: announcement.isActive !== undefined ? announcement.isActive : true,
      targetCriteria: {
        specializationIds: specializationIdStrings,
        subscriptionPlanIds: (announcement.targetCriteria?.subscriptionPlanIds || []).map(id => 
          typeof id === 'object' ? id._id || id : id
        ).filter(Boolean),
        individualDoctorIds: (announcement.targetCriteria?.individualDoctorIds || []).map(id => 
          typeof id === 'object' ? id._id || id : id
        ).filter(Boolean),
        location: announcement.targetCriteria?.location || { city: '', state: '', country: '' }
      }
    })
    setImageFile(null)
    setFileFile(null)
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = (announcement) => {
    setEditingAnnouncement(announcement)
    setShowDeleteModal(true)
  }

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return null
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiPost('/upload/general', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // Axios interceptor returns response.data, so response is already { success, message, data: {...} }
      return response?.data?.url || response?.url || response
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return null
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiPost('/upload/general', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // Axios interceptor returns response.data, so response is already { success, message, data: {...} }
      return response?.data?.url || response?.url || response
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in title and message')
      return
    }

    if (formData.announcementType === 'TARGETED') {
      if (!formData.targetCriteria) {
        toast.error('Target criteria is required for targeted announcements')
        return
      }
      // Validate that at least one specialization is selected for targeted announcements
      if (!formData.targetCriteria.specializationIds || formData.targetCriteria.specializationIds.length === 0) {
        toast.error('Please select at least one specialization for targeted announcements')
        return
      }
    }

    if (formData.expiryType === 'EXPIRE_AFTER_DATE' && !formData.expiryDate) {
      toast.error('Expiry date is required when expiry type is EXPIRE_AFTER_DATE')
      return
    }

    try {
      let imageUrl = formData.image
      let fileUrl = formData.file

      // Upload image if new file selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile)
      }

      // Upload file if new file selected
      if (fileFile) {
        fileUrl = await handleFileUpload(fileFile)
      }

      const announcementData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
        announcementType: formData.announcementType,
        isPinned: formData.isPinned,
        expiryType: formData.expiryType,
        isActive: formData.isActive,
        ...(imageUrl && { image: imageUrl }),
        ...(fileUrl && { file: fileUrl }),
        ...(formData.link && { link: formData.link.trim() }),
        ...(formData.expiryDate && formData.expiryType === 'EXPIRE_AFTER_DATE' && { expiryDate: formData.expiryDate }),
        ...(formData.announcementType === 'TARGETED' && formData.targetCriteria && {
          targetCriteria: {
            specializationIds: formData.targetCriteria.specializationIds || [],
            ...(formData.targetCriteria.subscriptionPlanIds?.length > 0 && {
              subscriptionPlanIds: formData.targetCriteria.subscriptionPlanIds
            }),
            ...(formData.targetCriteria.individualDoctorIds?.length > 0 && {
              individualDoctorIds: formData.targetCriteria.individualDoctorIds
            }),
            ...(formData.targetCriteria.location && Object.values(formData.targetCriteria.location).some(v => v) && {
              location: formData.targetCriteria.location
            })
          }
        })
      }

      if (editingAnnouncement) {
        await updateMutation.mutateAsync({
          announcementId: editingAnnouncement._id,
          data: announcementData
        })
        toast.success('Announcement updated successfully!')
      } else {
        await createMutation.mutateAsync(announcementData)
        toast.success('Announcement created successfully!')
      }

      setShowModal(false)
      setEditingAnnouncement(null)
      setImageFile(null)
      setFileFile(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save announcement'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!editingAnnouncement) return

    try {
      await deleteMutation.mutateAsync(editingAnnouncement._id)
      toast.success('Announcement deleted successfully!')
      setShowDeleteModal(false)
      setEditingAnnouncement(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete announcement'
      toast.error(errorMessage)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityUpper = (priority || 'NORMAL').toUpperCase()
    switch (priorityUpper) {
      case 'URGENT':
        return <span className="badge bg-danger-light">Urgent</span>
      case 'IMPORTANT':
        return <span className="badge bg-warning-light">Important</span>
      case 'NORMAL':
        return <span className="badge bg-success-light">Normal</span>
      default:
        return <span className="badge bg-secondary-light">{priorityUpper}</span>
    }
  }

  // Get type badge
  const getTypeBadge = (type) => {
    const typeUpper = (type || 'BROADCAST').toUpperCase()
    return typeUpper === 'BROADCAST' 
      ? <span className="badge bg-primary-light">Broadcast</span>
      : <span className="badge bg-info-light">Targeted</span>
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Announcements Management</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Announcements</li>
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
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Priority</label>
                    <select
                      className="form-select"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Type</label>
                    <select
                      className="form-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="broadcast">Broadcast</option>
                      <option value="targeted">Targeted</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Status</label>
                    <select
                      className="form-select"
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group d-flex align-items-end">
                    <button className="btn btn-primary w-100" onClick={handleCreate}>
                      <i className="fe fe-plus me-2"></i>
                      Create Announcement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Pinned</th>
                      <th>Created</th>
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
                          <p className="mt-2 mb-0">Loading announcements...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-danger">Error loading announcements: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : announcements.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-muted">No announcements found</p>
                          <button className="btn btn-sm btn-primary mt-2" onClick={handleCreate}>Create First Announcement</button>
                        </td>
                      </tr>
                    ) : (
                      announcements
                        .sort((a, b) => {
                          if (a.isPinned && !b.isPinned) return -1
                          if (!a.isPinned && b.isPinned) return 1
                          return new Date(b.createdAt) - new Date(a.createdAt)
                        })
                        .map((announcement) => {
                          const createdBy = typeof announcement.createdBy === 'object' 
                            ? announcement.createdBy.fullName || announcement.createdBy.email 
                            : 'Admin'
                          
                          return (
                            <tr key={announcement._id}>
                              <td>
                                <div>
                                  <strong>{announcement.title}</strong>
                                  {announcement.priority === 'URGENT' && (
                                    <span className="badge bg-danger ms-2">Urgent</span>
                                  )}
                                  {announcement.isPinned && (
                                    <i className="fe fe-pin text-primary ms-2" title="Pinned"></i>
                                  )}
                                  <small className="d-block text-muted mt-1" style={{ maxWidth: '300px' }}>
                                    {announcement.message && announcement.message.length > 80 
                                      ? announcement.message.substring(0, 80) + '...'
                                      : announcement.message || 'No message'}
                                  </small>
                                  {announcement.announcementType === 'TARGETED' && announcement.targetCriteria?.specializationIds && announcement.targetCriteria.specializationIds.length > 0 && (
                                    <div className="mt-2">
                                      <small className="text-muted d-block mb-1">Targeted to specializations: </small>
                                      <div className="d-flex flex-wrap gap-1">
                                        {announcement.targetCriteria.specializationIds.map((spec, idx) => {
                                          // Handle both populated (object with name) and unpopulated (just ID) cases
                                          const specName = typeof spec === 'object' && spec?.name ? spec.name : (spec?.name || 'Specialization')
                                          const specId = typeof spec === 'object' && spec?._id ? spec._id : spec
                                          return (
                                            <span key={specId || idx} className="badge bg-info-light">
                                              {specName}
                                            </span>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>{getTypeBadge(announcement.announcementType)}</td>
                              <td>{getPriorityBadge(announcement.priority)}</td>
                              <td>
                                {announcement.isActive ? (
                                  <span className="badge bg-success-light">Active</span>
                                ) : (
                                  <span className="badge bg-danger-light">Inactive</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${announcement.isPinned ? 'bg-primary-light' : 'bg-secondary-light'}`}>
                                  {announcement.isPinned ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td>
                                <div>
                                  <small>{formatDate(announcement.createdAt)}</small>
                                  <small className="d-block text-muted">{createdBy}</small>
                                </div>
                              </td>
                              <td>
                                <div className="actions">
                                  <button
                                    className="btn btn-sm bg-success-light me-2"
                                    onClick={() => handleEdit(announcement)}
                                    title="Edit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
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
                                    onClick={() => handleDelete(announcement)}
                                    title="Delete"
                                    disabled={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowModal(false)
              setEditingAnnouncement(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowModal(false)
                setEditingAnnouncement(null)
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAnnouncement(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter announcement title"
                      required
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Enter announcement message"
                      required
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Announcement Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.announcementType}
                        onChange={(e) => {
                          const newType = e.target.value
                          setFormData({ 
                            ...formData, 
                            announcementType: newType,
                            // Clear target criteria when switching to BROADCAST
                            ...(newType === 'BROADCAST' && {
                              targetCriteria: {
                                specializationIds: [],
                                subscriptionPlanIds: [],
                                individualDoctorIds: [],
                                location: { city: '', state: '', country: '' }
                              }
                            })
                          })
                        }}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      >
                        <option value="BROADCAST">Broadcast (All Doctors)</option>
                        <option value="TARGETED">Targeted (Specific Doctors)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="IMPORTANT">Important</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Enter image URL or upload file below"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Upload Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">File URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.file}
                        onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                        placeholder="Enter file URL or upload file below"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Upload File</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setFileFile(e.target.files[0])}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Link</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://example.com"
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expiry Type</label>
                      <select
                        className="form-select"
                        value={formData.expiryType}
                        onChange={(e) => setFormData({ ...formData, expiryType: e.target.value, expiryDate: e.target.value !== 'EXPIRE_AFTER_DATE' ? '' : formData.expiryDate })}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      >
                        <option value="NO_EXPIRY">No Expiry</option>
                        <option value="EXPIRE_AFTER_DATE">Expire After Date</option>
                        <option value="AUTO_HIDE_AFTER_READ">Auto Hide After Read</option>
                      </select>
                    </div>
                    {formData.expiryType === 'EXPIRE_AFTER_DATE' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Expiry Date <span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          required
                          disabled={createMutation.isLoading || updateMutation.isLoading}
                        />
                      </div>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isPinned"
                          checked={formData.isPinned}
                          onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                          disabled={createMutation.isLoading || updateMutation.isLoading}
                        />
                        <label className="form-check-label" htmlFor="isPinned">
                          Pin Announcement
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
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
                  {formData.announcementType === 'TARGETED' && (
                    <div className="mb-3">
                      <label className="form-label">
                        Select Specializations <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        multiple
                        size="5"
                        value={formData.targetCriteria.specializationIds || []}
                        onChange={(e) => {
                          const selectedIds = Array.from(e.target.selectedOptions, option => option.value)
                          setFormData({
                            ...formData,
                            targetCriteria: {
                              ...formData.targetCriteria,
                              specializationIds: selectedIds
                            }
                          })
                        }}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                        required={formData.announcementType === 'TARGETED'}
                      >
                        {specializations.length === 0 ? (
                          <option disabled>Loading specializations...</option>
                        ) : (
                          specializations.map((spec) => (
                            <option key={spec._id} value={spec._id}>
                              {spec.name}
                            </option>
                          ))
                        )}
                      </select>
                      <small className="text-muted">
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple specializations. 
                        The announcement will be sent only to doctors with the selected specializations.
                      </small>
                      {formData.targetCriteria.specializationIds?.length > 0 && (
                        <div className="mt-2">
                          <strong>Selected ({formData.targetCriteria.specializationIds.length}):</strong>
                          <div className="d-flex flex-wrap gap-2 mt-1">
                            {formData.targetCriteria.specializationIds.map((specId) => {
                              const spec = specializations.find(s => s._id === specId)
                              return spec ? (
                                <span key={specId} className="badge bg-primary-light">
                                  {spec.name}
                                  <button
                                    type="button"
                                    className="btn-close btn-close-sm ms-1"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setFormData({
                                        ...formData,
                                        targetCriteria: {
                                          ...formData.targetCriteria,
                                          specializationIds: formData.targetCriteria.specializationIds.filter(id => id !== specId)
                                        }
                                      })
                                    }}
                                    aria-label="Remove"
                                  ></button>
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAnnouncement(null)
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
                        {editingAnnouncement ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fe fe-save me-2"></i>
                        {editingAnnouncement ? 'Update' : 'Create'} Announcement
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
      {showDeleteModal && editingAnnouncement && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowDeleteModal(false)
              setEditingAnnouncement(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setEditingAnnouncement(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Announcement</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{editingAnnouncement.title}</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteModal(false)
                          setEditingAnnouncement(null)
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

export default AnnouncementsManagement
