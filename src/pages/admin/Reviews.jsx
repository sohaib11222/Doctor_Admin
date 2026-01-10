import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminReviews } from '../../queries/adminQueries'
import { useDeleteReview } from '../../mutations/adminMutations'

const Reviews = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [doctorFilter, setDoctorFilter] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 20

  // Build query params
  const queryParams = useMemo(() => {
    const params = { page, limit }
    if (doctorFilter) params.doctorId = doctorFilter
    if (patientFilter) params.patientId = patientFilter
    if (ratingFilter !== 'all') params.rating = ratingFilter
    return params
  }, [doctorFilter, patientFilter, ratingFilter, page, limit])

  // Fetch reviews
  const { data: reviewsResponse, isLoading, error, refetch } = useAdminReviews(queryParams)

  // Delete mutation
  const deleteMutation = useDeleteReview()

  // Extract reviews data
  const reviews = useMemo(() => {
    if (!reviewsResponse) return []
    const responseData = reviewsResponse.data || reviewsResponse
    return Array.isArray(responseData) ? responseData : (responseData.reviews || [])
  }, [reviewsResponse])

  // Extract pagination data
  const pagination = useMemo(() => {
    if (!reviewsResponse) return null
    const responseData = reviewsResponse.data || reviewsResponse
    return responseData.pagination || null
  }, [reviewsResponse])

  // Handle delete
  const handleDelete = (review) => {
    setSelectedReview(review)
    setShowDeleteModal(true)
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedReview) return

    try {
      await deleteMutation.mutateAsync(selectedReview._id)
      toast.success('Review deleted successfully!')
      setShowDeleteModal(false)
      setSelectedReview(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete review'
      toast.error(errorMessage)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get doctor name
  const getDoctorName = (doctor) => {
    if (!doctor) return 'N/A'
    if (typeof doctor === 'object') {
      return doctor.fullName || doctor.email || 'Unknown Doctor'
    }
    return 'Unknown Doctor'
  }

  // Get patient name
  const getPatientName = (patient) => {
    if (!patient) return 'N/A'
    if (typeof patient === 'object') {
      return patient.fullName || patient.email || 'Unknown Patient'
    }
    return 'Unknown Patient'
  }

  // Get doctor image
  const getDoctorImage = (doctor) => {
    if (!doctor) return '/assets/img/doctors/doctor-thumb-01.jpg'
    if (typeof doctor === 'object' && doctor.profileImage) {
      return doctor.profileImage
    }
    return '/assets/img/doctors/doctor-thumb-01.jpg'
  }

  // Get patient image
  const getPatientImage = (patient) => {
    if (!patient) return '/assets/img/patients/patient1.jpg'
    if (typeof patient === 'object' && patient.profileImage) {
      return patient.profileImage
    }
    return '/assets/img/patients/patient1.jpg'
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Reviews</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Reviews</li>
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
                    <label className="mb-2">Doctor ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter by Doctor ID"
                      value={doctorFilter}
                      onChange={(e) => {
                        setDoctorFilter(e.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Patient ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter by Patient ID"
                      value={patientFilter}
                      onChange={(e) => {
                        setPatientFilter(e.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Rating</label>
                    <select
                      className="form-select"
                      value={ratingFilter}
                      onChange={(e) => {
                        setRatingFilter(e.target.value)
                        setPage(1)
                      }}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group d-flex align-items-end">
                    <button
                      className="btn btn-secondary w-100"
                      onClick={() => {
                        setDoctorFilter('')
                        setPatientFilter('')
                        setRatingFilter('all')
                        setPage(1)
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0" id="review_data">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Doctor Name</th>
                      <th>Ratings</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading reviews...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="text-danger">Error loading reviews: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : reviews.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="text-muted">No reviews found</p>
                        </td>
                      </tr>
                    ) : (
                      reviews.map((review) => (
                        <tr key={review._id}>
                          <td>
                            <h2 className="table-avatar">
                              <a href={`/patient-profile?id=${review.patientId?._id || review.patientId}`} className="avatar avatar-sm me-2">
                                <img
                                  className="avatar-img rounded-circle"
                                  src={getPatientImage(review.patientId)}
                                  alt="Patient Image"
                                  onError={(e) => {
                                    e.target.src = '/assets/img/patients/patient1.jpg'
                                  }}
                                />
                              </a>
                              <a href={`/patient-profile?id=${review.patientId?._id || review.patientId}`}>
                                {getPatientName(review.patientId)}
                              </a>
                            </h2>
                          </td>
                          <td>
                            <h2 className="table-avatar">
                              <a href={`/doctor-profile?id=${review.doctorId?._id || review.doctorId}`} className="avatar avatar-sm me-2">
                                <img
                                  className="avatar-img rounded-circle"
                                  src={getDoctorImage(review.doctorId)}
                                  alt="Doctor Image"
                                  onError={(e) => {
                                    e.target.src = '/assets/img/doctors/doctor-thumb-01.jpg'
                                  }}
                                />
                              </a>
                              <a href={`/doctor-profile?id=${review.doctorId?._id || review.doctorId}`}>
                                {getDoctorName(review.doctorId)}
                              </a>
                            </h2>
                          </td>
                          <td>
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star ${i < (review.rating || 0) ? 'filled' : ''}`}
                                style={{ color: i < (review.rating || 0) ? '#f4c430' : '#ddd' }}
                              ></i>
                            ))}
                            <span className="ms-2">({review.rating || 0})</span>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              {review.reviewText || 'No review text'}
                            </div>
                          </td>
                          <td>{formatDate(review.createdAt)}</td>
                          <td className="text-end">
                            <div className="actions">
                              <button
                                className="btn btn-sm bg-danger-light"
                                onClick={() => handleDelete(review)}
                                disabled={deleteMutation.isLoading}
                                title="Delete Review"
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

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <p className="text-muted mb-0">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
                    </p>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      Previous
                    </button>
                    <span className="mx-2">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages || isLoading}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedReview && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedReview(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setSelectedReview(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Review</h4>
                    <p className="mb-4">
                      Are you sure you want to delete this review from <strong>{getPatientName(selectedReview.patientId)}</strong> to <strong>{getDoctorName(selectedReview.doctorId)}</strong>?
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteModal(false)
                          setSelectedReview(null)
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

export default Reviews
