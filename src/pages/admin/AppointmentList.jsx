import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAdminAppointments } from '../../queries/adminQueries'
import { get } from '../../utils/api'
import { DOCTOR_ROUTES } from '../../utils/apiConfig'
import { toast } from 'react-toastify'

const AppointmentList = () => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const limit = 10

  // Build query params
  const queryParams = useMemo(() => {
    const params = { page, limit }
    if (statusFilter) params.status = statusFilter
    if (searchQuery) params.search = searchQuery
    return params
  }, [page, statusFilter, searchQuery])

  // Fetch appointments
  const { data: appointmentsResponse, isLoading, error, refetch } = useAdminAppointments(queryParams)

  // Extract appointments data
  const appointmentsData = useMemo(() => {
    if (!appointmentsResponse) return { appointments: [], pagination: null }
    const responseData = appointmentsResponse.data || appointmentsResponse
    return {
      appointments: responseData.appointments || [],
      pagination: responseData.pagination || null
    }
  }, [appointmentsResponse])

  // Fetch appointment details
  const { data: appointmentDetailsResponse } = useQuery({
    queryKey: ['appointment-details', selectedAppointment],
    queryFn: () => get(DOCTOR_ROUTES.APPOINTMENT_BY_ID(selectedAppointment)),
    enabled: !!selectedAppointment && showDetailsModal,
  })

  const appointmentDetails = useMemo(() => {
    if (!appointmentDetailsResponse) return null
    const responseData = appointmentDetailsResponse.data || appointmentDetailsResponse
    return responseData
  }, [appointmentDetailsResponse])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusUpper = (status || '').toUpperCase()
    if (statusUpper === 'CONFIRMED' || statusUpper === 'COMPLETED') {
      return <span className="badge bg-success-light">{status}</span>
    }
    if (statusUpper === 'PENDING') {
      return <span className="badge bg-warning-light">{status}</span>
    }
    if (statusUpper === 'CANCELLED' || statusUpper === 'REJECTED') {
      return <span className="badge bg-danger-light">{status}</span>
    }
    return <span className="badge bg-secondary-light">{status || 'N/A'}</span>
  }

  // Get specialization name
  const getSpecializationName = (doctor) => {
    if (!doctor || typeof doctor !== 'object') return 'N/A'
    if (doctor.doctorProfile?.specialization) {
      const spec = doctor.doctorProfile.specialization
      return typeof spec === 'object' ? spec.name : spec
    }
    return 'N/A'
  }

  // Handle view details
  const handleViewDetails = (appointmentId) => {
    setSelectedAppointment(appointmentId)
    setShowDetailsModal(true)
  }

  // Filter appointments by search query
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointmentsData.appointments
    
    const query = searchQuery.toLowerCase()
    return appointmentsData.appointments.filter(apt => {
      const doctorName = apt.doctorId?.fullName || ''
      const patientName = apt.patientId?.fullName || ''
      const appointmentNumber = apt.appointmentNumber || ''
      return (
        doctorName.toLowerCase().includes(query) ||
        patientName.toLowerCase().includes(query) ||
        appointmentNumber.toLowerCase().includes(query)
      )
    })
  }, [appointmentsData.appointments, searchQuery])

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Appointments</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active">Appointments</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by doctor, patient, or appointment number..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="col-md-5 text-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    <i className="fa fa-refresh me-1"></i>Refresh
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Doctor Name</th>
                      <th>Speciality</th>
                      <th>Patient Name</th>
                      <th>Appointment Time</th>
                      <th>Status</th>
                      <th>Amount</th>
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
                          <p className="mt-2 mb-0">Loading appointments...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <p className="text-danger">Error loading appointments: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <p className="text-muted">No appointments found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment) => {
                        const doctor = appointment.doctorId
                        const patient = appointment.patientId
                        const doctorName = (doctor && typeof doctor === 'object' && doctor !== null) ? doctor.fullName : 'N/A'
                        const patientName = (patient && typeof patient === 'object' && patient !== null) ? patient.fullName : 'N/A'
                        const doctorImage = (doctor && typeof doctor === 'object' && doctor !== null) 
                          ? (doctor.profileImage || '/assets/img/doctors/doctor-thumb-01.jpg') 
                          : '/assets/img/doctors/doctor-thumb-01.jpg'
                        const patientImage = (patient && typeof patient === 'object' && patient !== null) 
                          ? (patient.profileImage || '/assets/img/patients/patient1.jpg') 
                          : '/assets/img/patients/patient1.jpg'
                        
                        return (
                          <tr key={appointment._id}>
                            <td>
                              <a href="javascript:void(0);" className="link-primary">
                                {appointment.appointmentNumber || `#${appointment._id.slice(-6).toUpperCase()}`}
                              </a>
                            </td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={doctorImage} 
                                    alt="Doctor" 
                                    onError={(e) => {
                                      e.target.src = '/assets/img/doctors/doctor-thumb-01.jpg'
                                    }}
                                  />
                                </a>
                                <a href="javascript:void(0);">Dr. {doctorName}</a>
                              </h2>
                            </td>
                            <td>{getSpecializationName(doctor)}</td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={patientImage} 
                                    alt="Patient" 
                                    onError={(e) => {
                                      e.target.src = '/assets/img/patients/patient1.jpg'
                                    }}
                                  />
                                </a>
                                <a href="javascript:void(0);">{patientName}</a>
                              </h2>
                            </td>
                            <td>
                              {formatDate(appointment.appointmentDate)}
                              <span className="text-primary d-block">{appointment.appointmentTime || 'N/A'}</span>
                            </td>
                            <td>{getStatusBadge(appointment.status)}</td>
                            <td>{formatCurrency(appointment.amount)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleViewDetails(appointment._id)}
                              >
                                <i className="fa fa-eye me-1"></i>View
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {appointmentsData.pagination && appointmentsData.pagination.pages > 1 && (
                <div className="row mt-3">
                  <div className="col-md-12">
                    <nav>
                      <ul className="pagination justify-content-end">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(appointmentsData.pagination.pages)].map((_, idx) => {
                          const pageNum = idx + 1
                          if (
                            pageNum === 1 ||
                            pageNum === appointmentsData.pagination.pages ||
                            (pageNum >= page - 2 && pageNum <= page + 2)
                          ) {
                            return (
                              <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => setPage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            )
                          } else if (pageNum === page - 3 || pageNum === page + 3) {
                            return (
                              <li key={pageNum} className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            )
                          }
                          return null
                        })}
                        <li className={`page-item ${page === appointmentsData.pagination.pages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(page + 1)}
                            disabled={page === appointmentsData.pagination.pages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                    <p className="text-muted text-end">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, appointmentsData.pagination.total)} of {appointmentsData.pagination.total} appointments
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowDetailsModal(false)
              setSelectedAppointment(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDetailsModal(false)
                setSelectedAppointment(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Appointment Details</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedAppointment(null)
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  {!appointmentDetails ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <strong>Appointment Number:</strong>
                        <p>{appointmentDetails.appointmentNumber || `#${appointmentDetails._id?.slice(-6).toUpperCase()}`}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Status:</strong>
                        <p>{getStatusBadge(appointmentDetails.status)}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Date:</strong>
                        <p>{formatDate(appointmentDetails.appointmentDate)}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Time:</strong>
                        <p>{appointmentDetails.appointmentTime || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Booking Type:</strong>
                        <p>{appointmentDetails.bookingType || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Amount:</strong>
                        <p>{formatCurrency(appointmentDetails.amount)}</p>
                      </div>
                      {appointmentDetails.patientNotes && (
                        <div className="col-md-12 mb-3">
                          <strong>Patient Notes:</strong>
                          <p>{appointmentDetails.patientNotes}</p>
                        </div>
                      )}
                      {appointmentDetails.clinicName && (
                        <div className="col-md-12 mb-3">
                          <strong>Clinic Name:</strong>
                          <p>{appointmentDetails.clinicName}</p>
                        </div>
                      )}
                      {appointmentDetails.videoCallLink && (
                        <div className="col-md-12 mb-3">
                          <strong>Video Call Link:</strong>
                          <p><a href={appointmentDetails.videoCallLink} target="_blank" rel="noopener noreferrer">{appointmentDetails.videoCallLink}</a></p>
                        </div>
                      )}
                      <div className="col-md-12">
                        <hr />
                        <h6>Doctor Information</h6>
                        <p><strong>Name:</strong> {appointmentDetails.doctorId?.fullName || 'N/A'}</p>
                        <p><strong>Email:</strong> {appointmentDetails.doctorId?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {appointmentDetails.doctorId?.phone || 'N/A'}</p>
                      </div>
                      <div className="col-md-12 mt-3">
                        <hr />
                        <h6>Patient Information</h6>
                        <p><strong>Name:</strong> {appointmentDetails.patientId?.fullName || 'N/A'}</p>
                        <p><strong>Email:</strong> {appointmentDetails.patientId?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {appointmentDetails.patientId?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedAppointment(null)
                    }}
                  >
                    Close
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

export default AppointmentList

