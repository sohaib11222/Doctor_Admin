import { useState } from 'react'
import { Link } from 'react-router-dom'

const DoctorVerificationApproval = () => {
  const [filter, setFilter] = useState('pending') // pending, approved, rejected

  const verificationRequests = [
    {
      id: 1,
      doctorId: 101,
      doctorName: 'Dr. John Smith',
      email: 'john.smith@example.com',
      phone: '+1 234 567 8900',
      specialization: 'Cardiology',
      medicalCouncilNumber: 'MC123456',
      submittedDate: '15 Nov 2024',
      status: 'pending',
      documents: {
        registrationCertificate: '/documents/doc1-reg-cert.pdf',
        goodStandingCertificate: '/documents/doc1-good-standing.pdf',
        cv: '/documents/doc1-cv.pdf',
        specialistRegistration: '/documents/doc1-specialist.pdf',
        digitalSignature: '/documents/doc1-signature.pdf'
      },
      image: '/assets/img/doctors/doctor-thumb-01.jpg'
    },
    {
      id: 2,
      doctorId: 102,
      doctorName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 234 567 8901',
      specialization: 'Dermatology',
      medicalCouncilNumber: 'MC789012',
      submittedDate: '14 Nov 2024',
      status: 'pending',
      documents: {
        registrationCertificate: '/documents/doc2-reg-cert.pdf',
        goodStandingCertificate: '/documents/doc2-good-standing.pdf',
        cv: '/documents/doc2-cv.pdf'
      },
      image: '/assets/img/doctors/doctor-thumb-02.jpg'
    },
    {
      id: 3,
      doctorId: 103,
      doctorName: 'Dr. Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 234 567 8902',
      specialization: 'Orthopedics',
      medicalCouncilNumber: 'MC345678',
      submittedDate: '13 Nov 2024',
      status: 'approved',
      approvedDate: '14 Nov 2024',
      approvedBy: 'Admin User',
      image: '/assets/img/doctors/doctor-thumb-03.jpg'
    },
    {
      id: 4,
      doctorId: 104,
      doctorName: 'Dr. Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 234 567 8903',
      specialization: 'Pediatrics',
      medicalCouncilNumber: 'MC901234',
      submittedDate: '12 Nov 2024',
      status: 'rejected',
      rejectedDate: '13 Nov 2024',
      rejectedBy: 'Admin User',
      rejectionReason: 'Invalid medical council number. Please resubmit with correct documents.',
      image: '/assets/img/doctors/doctor-thumb-04.jpg'
    }
  ]

  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const filteredRequests = verificationRequests.filter(req => 
    filter === 'all' || req.status === filter
  )

  const handleApprove = (requestId) => {
    // TODO: API call to approve
    console.log('Approving request:', requestId)
    alert('Doctor verification approved successfully!')
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    // TODO: API call to reject
    console.log('Rejecting request:', selectedRequest.id, 'Reason:', rejectionReason)
    alert('Doctor verification rejected.')
    setShowModal(false)
    setRejectionReason('')
    setSelectedRequest(null)
  }

  const handleViewDocuments = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-warning-light',
      'approved': 'bg-success-light',
      'rejected': 'bg-danger-light'
    }
    const labels = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected'
    }
    return <span className={`badge ${badges[status] || 'bg-secondary-light'}`}>{labels[status]}</span>
  }

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Doctor Verification Approval</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Doctor Verification</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="row mb-4">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('pending')}
                  >
                    Pending ({verificationRequests.filter(r => r.status === 'pending').length})
                  </button>
                  <button
                    className={`btn btn-sm ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('approved')}
                  >
                    Approved ({verificationRequests.filter(r => r.status === 'approved').length})
                  </button>
                  <button
                    className={`btn btn-sm ${filter === 'rejected' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('rejected')}
                  >
                    Rejected ({verificationRequests.filter(r => r.status === 'rejected').length})
                  </button>
                  <button
                    className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({verificationRequests.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Requests Table */}
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="datatable table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Medical Council #</th>
                        <th>Submitted Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <h2 className="table-avatar">
                              <Link to="#" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src={request.image} alt="User Image" />
                              </Link>
                              <div>
                                <Link to="#">{request.doctorName}</Link>
                                <small className="d-block text-muted">{request.email}</small>
                              </div>
                            </h2>
                          </td>
                          <td>{request.specialization}</td>
                          <td>{request.medicalCouncilNumber}</td>
                          <td>{request.submittedDate}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn btn-sm bg-info-light me-2"
                                onClick={() => handleViewDocuments(request)}
                                title="View Documents"
                              >
                                <i className="fe fe-eye"></i> View
                              </button>
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm bg-success-light me-2"
                                    onClick={() => handleApprove(request.id)}
                                    title="Approve"
                                  >
                                    <i className="fe fe-check"></i> Approve
                                  </button>
                                  <button
                                    className="btn btn-sm bg-danger-light"
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setShowModal(true)
                                    }}
                                    title="Reject"
                                  >
                                    <i className="fe fe-x"></i> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Documents Modal */}
        {showModal && selectedRequest && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Doctor Verification Documents - {selectedRequest.doctorName}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedRequest(null)
                      setRejectionReason('')
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6>Doctor Information</h6>
                      <p className="mb-1"><strong>Name:</strong> {selectedRequest.doctorName}</p>
                      <p className="mb-1"><strong>Email:</strong> {selectedRequest.email}</p>
                      <p className="mb-1"><strong>Phone:</strong> {selectedRequest.phone}</p>
                      <p className="mb-1"><strong>Specialization:</strong> {selectedRequest.specialization}</p>
                      <p className="mb-0"><strong>Medical Council #:</strong> {selectedRequest.medicalCouncilNumber}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Verification Details</h6>
                      <p className="mb-1"><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                      <p className="mb-1"><strong>Submitted:</strong> {selectedRequest.submittedDate}</p>
                      {selectedRequest.approvedDate && (
                        <p className="mb-1"><strong>Approved:</strong> {selectedRequest.approvedDate}</p>
                      )}
                      {selectedRequest.rejectedDate && (
                        <p className="mb-1"><strong>Rejected:</strong> {selectedRequest.rejectedDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="documents-section">
                    <h6>Uploaded Documents</h6>
                    <div className="list-group">
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i className="fe fe-file-text me-2"></i>
                            <strong>Registration Certificate</strong>
                          </div>
                          <a href={selectedRequest.documents?.registrationCertificate} target="_blank" className="btn btn-sm btn-primary">
                            <i className="fe fe-download"></i> Download
                          </a>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i className="fe fe-file-text me-2"></i>
                            <strong>Good Standing Certificate</strong>
                          </div>
                          <a href={selectedRequest.documents?.goodStandingCertificate} target="_blank" className="btn btn-sm btn-primary">
                            <i className="fe fe-download"></i> Download
                          </a>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i className="fe fe-file-text me-2"></i>
                            <strong>Curriculum Vitae (CV)</strong>
                          </div>
                          <a href={selectedRequest.documents?.cv} target="_blank" className="btn btn-sm btn-primary">
                            <i className="fe fe-download"></i> Download
                          </a>
                        </div>
                      </div>
                      {selectedRequest.documents?.specialistRegistration && (
                        <div className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <i className="fe fe-file-text me-2"></i>
                              <strong>Specialist Registration</strong>
                            </div>
                            <a href={selectedRequest.documents.specialistRegistration} target="_blank" className="btn btn-sm btn-primary">
                              <i className="fe fe-download"></i> Download
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedRequest.documents?.digitalSignature && (
                        <div className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <i className="fe fe-file-text me-2"></i>
                              <strong>Digital Signature</strong>
                            </div>
                            <a href={selectedRequest.documents.digitalSignature} target="_blank" className="btn btn-sm btn-primary">
                              <i className="fe fe-download"></i> Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRequest.status === 'pending' && (
                    <div className="mt-4">
                      <label className="form-label"><strong>Rejection Reason (if rejecting):</strong></label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                      ></textarea>
                    </div>
                  )}

                  {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                    <div className="alert alert-danger mt-3">
                      <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedRequest(null)
                      setRejectionReason('')
                    }}
                  >
                    Close
                  </button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleApprove(selectedRequest.id)}
                      >
                        <i className="fe fe-check me-2"></i>
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleReject}
                        disabled={!rejectionReason.trim()}
                      >
                        <i className="fe fe-x me-2"></i>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" onClick={() => {
              setShowModal(false)
              setSelectedRequest(null)
              setRejectionReason('')
            }}></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorVerificationApproval

