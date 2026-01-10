import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAdminPatients } from '../../queries/adminQueries'
import { useUpdateUserStatus, useDeleteUser } from '../../mutations/adminMutations'

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')

  // Build query params
  const queryParams = useMemo(() => {
    const params = { role: 'PATIENT' }
    if (searchTerm) params.search = searchTerm
    if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()
    return params
  }, [searchTerm, statusFilter])

  // Fetch patients
  const { data: patientsResponse, isLoading, error, refetch } = useAdminPatients(queryParams)

  // Extract patients data
  const patients = useMemo(() => {
    if (!patientsResponse) return []
    const responseData = patientsResponse.data || patientsResponse
    return Array.isArray(responseData) ? responseData : (responseData.users || responseData.patients || [])
  }, [patientsResponse])

  // Update status mutation
  const updateStatusMutation = useUpdateUserStatus()
  
  // Delete user mutation
  const deleteUserMutation = useDeleteUser()

  // Handle status change
  const handleStatusChange = (patient) => {
    setSelectedPatient(patient)
    setSelectedStatus(patient.status || 'PENDING')
    setShowStatusModal(true)
  }

  // Handle delete
  const handleDelete = (patient) => {
    setSelectedPatient(patient)
    setShowDeleteModal(true)
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedPatient || !selectedStatus) return

    try {
      const userId = selectedPatient._id || selectedPatient.userId?._id || selectedPatient.userId
      await updateStatusMutation.mutateAsync({
        userId: String(userId),
        data: { status: selectedStatus }
      })
      toast.success('Patient status updated successfully!')
      setShowStatusModal(false)
      setSelectedPatient(null)
      setSelectedStatus('')
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update patient status'
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return

    try {
      const userId = selectedPatient._id || selectedPatient.userId?._id || selectedPatient.userId
      await deleteUserMutation.mutateAsync(String(userId))
      toast.success('Patient deleted successfully!')
      setShowDeleteModal(false)
      setSelectedPatient(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete patient'
      toast.error(errorMessage)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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

  // Get address string
  const getAddress = (patient) => {
    if (patient.address && typeof patient.address === 'object') {
      const addr = patient.address
      const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.country, addr.zip].filter(Boolean)
      return parts.join(', ') || 'N/A'
    }
    return patient.address || 'N/A'
  }

  // Get patient ID (use _id or generate from name)
  const getPatientId = (patient, index) => {
    if (patient._id) {
      return `PT${String(patient._id).slice(-6).toUpperCase()}`
    }
    return `PT${String(index + 1).padStart(3, '0')}`
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">List of Patients</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><a href="javascript:void(0);">Users</a></li>
              <li className="breadcrumb-item active">Patient</li>
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

      {/* Patients Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Account Status</th>
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
                          <p className="mt-2 mb-0">Loading patients...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-danger">Error loading patients: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : patients.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-muted">No patients found</p>
                        </td>
                      </tr>
                    ) : (
                      patients.map((patient, index) => {
                        const patientName = patient.fullName || patient.name || 'N/A'
                        const patientImage = patient.profileImage || '/assets/img/patients/patient1.jpg'
                        const age = calculateAge(patient.dob)
                        const address = getAddress(patient)
                        const phone = patient.phone || 'N/A'
                        const patientId = getPatientId(patient, index)

                        return (
                          <tr key={patient._id || patient.id}>
                            <td>{patientId}</td>
                            <td>
                              <h2 className="table-avatar">
                                <Link to="#" className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={patientImage} 
                                    alt={patientName}
                                    onError={(e) => {
                                      e.target.src = '/assets/img/patients/patient1.jpg'
                                    }}
                                  />
                                </Link>
                                <Link to="#">{patientName}</Link>
                              </h2>
                            </td>
                            <td>{age}</td>
                            <td>{address}</td>
                            <td>{phone}</td>
                            <td>{getStatusBadge(patient.status)}</td>
                            <td>
                              <div className="actions">
                                <button
                                  className="btn btn-sm bg-success-light me-2"
                                  onClick={() => handleStatusChange(patient)}
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
                                  onClick={() => handleDelete(patient)}
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
      {showStatusModal && selectedPatient && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowStatusModal(false)
              setSelectedPatient(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowStatusModal(false)
                setSelectedPatient(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Update Patient Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedPatient(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label"><strong>Patient:</strong></label>
                    <p>{selectedPatient.fullName || selectedPatient.name || 'N/A'}</p>
                    <small className="text-muted">{selectedPatient.email || ''}</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Current Status:</strong></label>
                    <p>{getStatusBadge(selectedPatient.status)}</p>
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
                      setSelectedPatient(null)
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
      {showDeleteModal && selectedPatient && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedPatient(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setSelectedPatient(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Patient</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{selectedPatient.fullName || selectedPatient.name || 'this patient'}</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteModal(false)
                          setSelectedPatient(null)
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

export default PatientList
