import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminDoctors, useAdminPatients } from '../../queries/adminQueries'
import { useSendNotification } from '../../mutations/adminMutations'

const NotificationsManagement = () => {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    body: '',
    type: 'SYSTEM',
    data: null
  })

  // Fetch doctors and patients for user selection
  const { data: doctorsResponse } = useAdminDoctors()
  const { data: patientsResponse } = useAdminPatients()

  // Send notification mutation
  const sendMutation = useSendNotification()

  // Extract doctors and patients safely
  const doctors = useMemo(() => {
    if (!doctorsResponse) return []
    const responseData = doctorsResponse.data || doctorsResponse
    if (Array.isArray(responseData)) return responseData
    return responseData.doctors || responseData.users || []
  }, [doctorsResponse])

  const patients = useMemo(() => {
    if (!patientsResponse) return []
    const responseData = patientsResponse.data || patientsResponse
    if (Array.isArray(responseData)) return responseData
    return responseData.patients || responseData.users || []
  }, [patientsResponse])

  // Ensure doctors and patients are arrays before mapping
  const safeDoctors = Array.isArray(doctors) ? doctors : []
  const safePatients = Array.isArray(patients) ? patients : []

  // Handle create
  const handleCreate = () => {
    setFormData({
      userId: '',
      title: '',
      body: '',
      type: 'SYSTEM',
      data: null
    })
    setShowModal(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!formData.userId) {
      toast.error('Please select a user')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.body.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      const notificationData = {
        userId: formData.userId,
        title: formData.title.trim(),
        body: formData.body.trim(),
        type: formData.type,
        ...(formData.data && { data: formData.data })
      }

      await sendMutation.mutateAsync(notificationData)
      toast.success('Notification sent successfully!')
      setShowModal(false)
      setFormData({
        userId: '',
        title: '',
        body: '',
        type: 'SYSTEM',
        data: null
      })
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send notification'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Notifications Management</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Notifications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="row mb-4">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Send Notifications</h5>
                <button className="btn btn-primary" onClick={handleCreate}>
                  <i className="fe fe-plus me-2"></i>
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="alert alert-info mb-0">
                <h5 className="alert-heading">
                  <i className="fe fe-info me-2"></i>
                  About Notifications
                </h5>
                <p className="mb-2">
                  Send notifications to doctors or patients. Notifications will appear in their notification center.
                </p>
                <ul className="mb-0">
                  <li>Select a user (doctor or patient) to send the notification to</li>
                  <li>Enter a title and message for the notification</li>
                  <li>Choose the notification type (SYSTEM, APPOINTMENT, PAYMENT, etc.)</li>
                  <li>The notification will be marked as unread and visible to the user</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowModal(false)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowModal(false)
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Send Notification</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Select User <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      required
                      disabled={sendMutation.isLoading}
                    >
                      <option value="">-- Select User --</option>
                      <optgroup label="Doctors">
                        {safeDoctors.length === 0 ? (
                          <option disabled>Loading doctors...</option>
                        ) : (
                          safeDoctors
                            .filter(doctor => {
                              const status = doctor.status || doctor.userId?.status
                              return status === 'APPROVED'
                            })
                            .map((doctor) => {
                              const doctorId = doctor._id || doctor.userId?._id
                              const doctorName = doctor.fullName || doctor.userId?.fullName || doctor.email || doctor.userId?.email
                              if (!doctorId) return null
                              return (
                                <option key={doctorId} value={doctorId}>
                                  {doctorName} (Doctor)
                                </option>
                              )
                            })
                            .filter(Boolean)
                        )}
                      </optgroup>
                      <optgroup label="Patients">
                        {safePatients.length === 0 ? (
                          <option disabled>Loading patients...</option>
                        ) : (
                          safePatients
                            .filter(patient => {
                              const status = patient.status || patient.userId?.status
                              return status === 'APPROVED'
                            })
                            .map((patient) => {
                              const patientId = patient._id || patient.userId?._id
                              const patientName = patient.fullName || patient.userId?.fullName || patient.email || patient.userId?.email
                              if (!patientId) return null
                              return (
                                <option key={patientId} value={patientId}>
                                  {patientName} (Patient)
                                </option>
                              )
                            })
                            .filter(Boolean)
                        )}
                      </optgroup>
                    </select>
                    <small className="text-muted">Select the user who will receive this notification</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Notification Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      disabled={sendMutation.isLoading}
                    >
                      <option value="SYSTEM">System</option>
                      <option value="APPOINTMENT">Appointment</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="SUBSCRIPTION">Subscription</option>
                      <option value="CHAT">Chat</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter notification title"
                      required
                      disabled={sendMutation.isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="Enter notification message"
                      required
                      disabled={sendMutation.isLoading}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                    }}
                    disabled={sendMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={sendMutation.isLoading}
                  >
                    {sendMutation.isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fe fe-send me-2"></i>
                        Send Notification
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

export default NotificationsManagement

