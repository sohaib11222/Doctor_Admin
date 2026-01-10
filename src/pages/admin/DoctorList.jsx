import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminDoctors } from '../../queries/adminQueries'
import { useUpdateUserStatus, useDeleteUser } from '../../mutations/adminMutations'

const DoctorList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()
    return params
  }, [searchTerm, statusFilter])

  // Fetch doctors
  const { data: doctorsResponse, isLoading, error, refetch } = useAdminDoctors(queryParams)

  // Extract doctors data
  const doctors = useMemo(() => {
    if (!doctorsResponse) return []
    const responseData = doctorsResponse.data || doctorsResponse
    return Array.isArray(responseData) ? responseData : (responseData.doctors || [])
  }, [doctorsResponse])

  // Update status mutation
  const updateStatusMutation = useUpdateUserStatus()
  
  // Delete user mutation
  const deleteUserMutation = useDeleteUser()

  // Handle status change
  const handleStatusChange = (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedStatus(doctor.status || 'PENDING')
    setShowStatusModal(true)
  }

  // Handle delete
  const handleDelete = (doctor) => {
    setSelectedDoctor(doctor)
    setShowDeleteModal(true)
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedDoctor || !selectedStatus) return

    try {
      const userId = selectedDoctor._id || selectedDoctor.userId?._id || selectedDoctor.userId
      await updateStatusMutation.mutateAsync({
        userId: String(userId),
        data: { status: selectedStatus }
      })
      toast.success('Doctor status updated successfully!')
      setShowStatusModal(false)
      setSelectedDoctor(null)
      setSelectedStatus('')
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update doctor status'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return

    try {
      const userId = selectedDoctor._id || selectedDoctor.userId?._id || selectedDoctor.userId
      await deleteUserMutation.mutateAsync(String(userId))
      toast.success('Doctor deleted successfully!')
      setShowDeleteModal(false)
      setSelectedDoctor(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete doctor'
      toast.error(errorMessage)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusUpper = (status || 'PENDING').toUpperCase()
    switch (statusUpper) {
      case 'APPROVED':
        return <span className="badge bg-success-light">Approved</span>
      case 'PENDING':
        return <span className="badge bg-warning-light">Pending</span>
      case 'REJECTED':
        return <span className="badge bg-danger-light">Rejected</span>
      case 'BLOCKED':
        return <span className="badge bg-danger-light">Blocked</span>
      default:
        return <span className="badge bg-secondary-light">{statusUpper}</span>
    }
  }

  // Get specialization name
  const getSpecialization = (doctor) => {
    if (doctor.doctorProfile && typeof doctor.doctorProfile === 'object') {
      if (doctor.doctorProfile.specialization) {
        const spec = doctor.doctorProfile.specialization
        return typeof spec === 'object' ? spec.name : spec
      }
    }
    return 'N/A'
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">List of Doctors</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><a href="javascript:void(0);">Users</a></li>
              <li className="breadcrumb-item active">Doctor</li>
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
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Speciality</th>
                      <th>Email</th>
                      <th>Member Since</th>
                      <th>Account Status</th>
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
                          <p className="mt-2 mb-0">Loading doctors...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="text-danger">Error loading doctors: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : doctors.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="text-muted">No doctors found</p>
                        </td>
                      </tr>
                    ) : (
                      doctors.map((doctor) => {
                        const doctorName = doctor.fullName || doctor.name || 'N/A'
                        const doctorEmail = doctor.email || 'N/A'
                        const doctorImage = doctor.profileImage || '/assets/img/doctors/doctor-thumb-01.jpg'
                        const specialization = getSpecialization(doctor)
                        const memberSince = formatDate(doctor.createdAt)

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
                                <Link to="#">{doctorName}</Link>
                              </h2>
                            </td>
                            <td>{specialization}</td>
                            <td>{doctorEmail}</td>
                            <td>{memberSince}</td>
                            <td>{getStatusBadge(doctor.status)}</td>
                            <td>
                              <div className="actions">
                                <button
                                  className="btn btn-sm bg-success-light me-2"
                                  onClick={() => handleStatusChange(doctor)}
                                  title="Change Status"
                                  disabled={updateStatusMutation.isLoading || deleteUserMutation.isLoading}
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
                                  onClick={() => handleDelete(doctor)}
                                  title="Delete"
                                  disabled={updateStatusMutation.isLoading || deleteUserMutation.isLoading}
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

      {/* Status Update Modal */}
      {showStatusModal && selectedDoctor && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowStatusModal(false)
              setSelectedDoctor(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowStatusModal(false)
                setSelectedDoctor(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Update Doctor Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedDoctor(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label"><strong>Doctor:</strong></label>
                    <p>{selectedDoctor.fullName || selectedDoctor.name || 'N/A'}</p>
                    <small className="text-muted">{selectedDoctor.email || ''}</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Current Status:</strong></label>
                    <p>{getStatusBadge(selectedDoctor.status)}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Select New Status:</strong></label>
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={updateStatusMutation.isLoading}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedDoctor(null)
                    }}
                    disabled={updateStatusMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isLoading || !selectedStatus}
                  >
                    {updateStatusMutation.isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDoctor && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedDoctor(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setSelectedDoctor(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Doctor</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{selectedDoctor.fullName || selectedDoctor.name || 'this doctor'}</strong>? 
                      This action cannot be undone and will also delete the doctor's profile.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteModal(false)
                          setSelectedDoctor(null)
                        }}
                        disabled={deleteUserMutation.isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDeleteConfirm}
                        disabled={deleteUserMutation.isLoading}
                      >
                        {deleteUserMutation.isLoading ? (
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

export default DoctorList
