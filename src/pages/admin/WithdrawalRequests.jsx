import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { useWithdrawalRequests } from '../../queries/adminQueries'
import { useApproveWithdrawal, useRejectWithdrawal } from '../../mutations/adminMutations'

const WithdrawalRequests = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState(null)
  const [withdrawalFeePercent, setWithdrawalFeePercent] = useState('')

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      page: 1,
      limit: 100
    }
    if (statusFilter) params.status = statusFilter
    return params
  }, [statusFilter])

  // Fetch withdrawal requests
  const { data: requestsResponse, isLoading, refetch } = useWithdrawalRequests(queryParams)

  // Extract requests data
  const requests = useMemo(() => {
    if (!requestsResponse) return []
    const responseData = requestsResponse.data || requestsResponse
    let requestsList = Array.isArray(responseData) ? responseData : (responseData.requests || [])

    // Apply search filter
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      requestsList = requestsList.filter(request => {
        const userName = request.userId?.fullName || request.userId?.email || ''
        const userEmail = request.userId?.email || ''
        return (
          userName.toLowerCase().includes(searchLower) ||
          userEmail.toLowerCase().includes(searchLower)
        )
      })
    }

    return requestsList
  }, [requestsResponse, searchFilter])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const allRequests = requests
    const counts = {
      ALL: allRequests.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      COMPLETED: 0,
    }
    
    allRequests.forEach(request => {
      const status = request.status
      if (counts.hasOwnProperty(status)) {
        counts[status]++
      }
    })
    
    return counts
  }, [requests])

  // Approve mutation
  const approveMutation = useApproveWithdrawal()
  const rejectMutation = useRejectWithdrawal()

  // Handle approve
  const handleApprove = () => {
    if (!selectedRequestForApproval) return

    const requesterRole = selectedRequestForApproval.userId?.role
      ? String(selectedRequestForApproval.userId.role).toUpperCase()
      : null
    const isPharmacyRequester = requesterRole === 'PHARMACY'
    
    // Validate fee percentage if provided
    const feePercent = isPharmacyRequester
      ? null
      : (withdrawalFeePercent.trim() === '' ? null : parseFloat(withdrawalFeePercent))
    
    if (feePercent !== null) {
      if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
        toast.error('Withdrawal fee percentage must be a number between 0 and 100')
        return
      }
    }

    approveMutation.mutate(
      { 
        requestId: selectedRequestForApproval._id, 
        withdrawalFeePercent: feePercent 
      },
      {
        onSuccess: () => {
          toast.success('Withdrawal request approved successfully')
          setShowApproveModal(false)
          setSelectedRequestForApproval(null)
          setWithdrawalFeePercent('')
          refetch()
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to approve withdrawal request'
          toast.error(errorMessage)
        },
      }
    )
  }

  // Handle reject
  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    rejectMutation.mutate(
      { requestId: selectedRequest._id, reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success('Withdrawal request rejected')
          setShowRejectModal(false)
          setSelectedRequest(null)
          setRejectionReason('')
          refetch()
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to reject withdrawal request'
          toast.error(errorMessage)
        },
      }
    )
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '€0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-warning-light'
      case 'APPROVED':
        return 'bg-success-light'
      case 'REJECTED':
        return 'bg-danger-light'
      case 'COMPLETED':
        return 'bg-info-light'
      default:
        return 'bg-secondary-light'
    }
  }

  // Get status label
  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Pending'
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      case 'COMPLETED':
        return 'Completed'
      default:
        return status || 'Unknown'
    }
  }

  return (
    <div className="content">
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Withdrawal Requests</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active">Withdrawal Requests</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          {/* Status Filter Tabs */}
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setStatusFilter('')}
                    >
                      All ({statusCounts.ALL})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setStatusFilter('PENDING')}
                    >
                      Pending ({statusCounts.PENDING})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'APPROVED' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setStatusFilter('APPROVED')}
                    >
                      Approved ({statusCounts.APPROVED})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'REJECTED' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setStatusFilter('REJECTED')}
                    >
                      Rejected ({statusCounts.REJECTED})
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by user name or email..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fe fe-search"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Requests Table */}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No withdrawal requests found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>User</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Requested Amount</th>
                        <th>Fee %</th>
                        <th>Fee Amount</th>
                        <th>User Receives</th>
                        <th>Total Deducted</th>
                        <th>Payment Method</th>
                        <th>Requested At</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            <span className="text-muted">#{request._id.toString().slice(-8)}</span>
                          </td>
                          <td>
                            <h2 className="table-avatar">
                              <span>{request.userId?.fullName || '—'}</span>
                            </h2>
                          </td>
                          <td>
                            {request.userId?.role ? String(request.userId.role).toUpperCase() : '—'}
                          </td>
                          <td>{request.userId?.email || '—'}</td>
                          <td>
                            <strong className="text-success">{formatCurrency(request.amount)}</strong>
                            {request.userId?.balance !== undefined && (
                              <small className="d-block text-muted">
                                Balance: {formatCurrency(request.userId.balance)}
                              </small>
                            )}
                          </td>
                          <td>
                            {request.withdrawalFeePercent !== null && request.withdrawalFeePercent !== undefined
                              ? `${request.withdrawalFeePercent}%`
                              : '—'}
                          </td>
                          <td>
                            {request.withdrawalFeeAmount !== null && request.withdrawalFeeAmount !== undefined
                              ? formatCurrency(request.withdrawalFeeAmount)
                              : '—'}
                          </td>
                          <td>
                            {request.netAmount !== null && request.netAmount !== undefined
                              ? <strong className="text-primary">{formatCurrency(request.netAmount)}</strong>
                              : formatCurrency(request.amount)}
                          </td>
                          <td>
                            {request.totalDeducted !== null && request.totalDeducted !== undefined
                              ? <strong className="text-danger">{formatCurrency(request.totalDeducted)}</strong>
                              : formatCurrency(request.amount)}
                          </td>
                          <td>
                            {request.paymentMethod || '—'}
                            {request.paymentDetails && (
                              <small className="d-block text-muted">{request.paymentDetails}</small>
                            )}
                          </td>
                          <td>{formatDate(request.requestedAt || request.createdAt)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                              {getStatusLabel(request.status)}
                            </span>
                            {request.approvedAt && (
                              <small className="d-block text-muted">
                                Approved: {formatDate(request.approvedAt)}
                              </small>
                            )}
                            {request.rejectionReason && (
                              <small className="d-block text-danger">
                                Reason: {request.rejectionReason}
                              </small>
                            )}
                          </td>
                          <td>
                            {request.status === 'PENDING' && (
                              <div className="actions">
                                <button
                                  className="btn btn-sm bg-success-light me-2"
                                  onClick={() => {
                                    const requesterRole = request.userId?.role
                                      ? String(request.userId.role).toUpperCase()
                                      : null

                                    if (requesterRole === 'PHARMACY') {
                                      approveMutation.mutate(
                                        { requestId: request._id, withdrawalFeePercent: null },
                                        {
                                          onSuccess: () => {
                                            toast.success('Withdrawal request approved successfully')
                                            refetch()
                                          },
                                          onError: (error) => {
                                            const errorMessage = error.response?.data?.message || error.message || 'Failed to approve withdrawal request'
                                            toast.error(errorMessage)
                                          },
                                        }
                                      )
                                      return
                                    }

                                    setSelectedRequestForApproval(request)
                                    setShowApproveModal(true)
                                  }}
                                  disabled={approveMutation.isPending}
                                  title="Approve"
                                >
                                  <i className="fe fe-check"></i> Approve
                                </button>
                                <button
                                  className="btn btn-sm bg-danger-light"
                                  onClick={() => {
                                    setSelectedRequest(request)
                                    setShowRejectModal(true)
                                  }}
                                  disabled={rejectMutation.isPending}
                                  title="Reject"
                                >
                                  <i className="fe fe-x"></i> Reject
                                </button>
                              </div>
                            )}
                            {request.status === 'APPROVED' && request.approvedBy && (
                              <small className="text-muted">
                                By: {request.approvedBy?.fullName || 'Admin'}
                              </small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowRejectModal(false)
              setSelectedRequest(null)
              setRejectionReason('')
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowRejectModal(false)
                setSelectedRequest(null)
                setRejectionReason('')
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Reject Withdrawal Request</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedRequest(null)
                      setRejectionReason('')
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to reject the withdrawal request of{' '}
                    <strong>{formatCurrency(selectedRequest.amount)}</strong> from{' '}
                    <strong>{selectedRequest.userId?.fullName || '—'}</strong>?
                  </p>
                  <div className="form-group">
                    <label>Rejection Reason <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedRequest(null)
                      setRejectionReason('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequestForApproval && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowApproveModal(false)
              setSelectedRequestForApproval(null)
              setWithdrawalFeePercent('')
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowApproveModal(false)
                setSelectedRequestForApproval(null)
                setWithdrawalFeePercent('')
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Approve Withdrawal Request</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowApproveModal(false)
                      setSelectedRequestForApproval(null)
                      setWithdrawalFeePercent('')
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <p>
                      <strong>User:</strong> {selectedRequestForApproval.userId?.fullName || '—'}<br />
                      <strong>Role:</strong> {selectedRequestForApproval.userId?.role ? String(selectedRequestForApproval.userId.role).toUpperCase() : '—'}<br />
                      <strong>Email:</strong> {selectedRequestForApproval.userId?.email || '—'}<br />
                      <strong>Withdrawal Amount:</strong> {formatCurrency(selectedRequestForApproval.amount)}<br />
                      <strong>Current Balance:</strong> {formatCurrency(selectedRequestForApproval.userId?.balance || 0)}
                    </p>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Withdrawal Fee Percentage <span className="text-muted">(Optional)</span>
                    </label>
                    {String(selectedRequestForApproval.userId?.role || '').toUpperCase() === 'PHARMACY' ? (
                      <>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={0}
                            disabled
                          />
                          <span className="input-group-text">%</span>
                        </div>
                        <small className="form-text text-muted">
                          Withdrawal fee is not applied for pharmacies.
                        </small>
                      </>
                    ) : (
                      <>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter fee percentage (0-100)"
                            value={withdrawalFeePercent}
                            onChange={(e) => setWithdrawalFeePercent(e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                          <span className="input-group-text">%</span>
                        </div>
                        <small className="form-text text-muted">
                          Leave empty for no fee. Fee will be deducted FROM the withdrawal amount.
                        </small>
                      </>
                    )}
                  </div>

                  {String(selectedRequestForApproval.userId?.role || '').toUpperCase() !== 'PHARMACY' && withdrawalFeePercent && !isNaN(parseFloat(withdrawalFeePercent)) && parseFloat(withdrawalFeePercent) >= 0 && parseFloat(withdrawalFeePercent) <= 100 && (
                    <div className="alert alert-info">
                      <strong>Fee Calculation:</strong><br />
                      Requested Withdrawal Amount: {formatCurrency(selectedRequestForApproval.amount)}<br />
                      Fee ({withdrawalFeePercent}%): {formatCurrency((selectedRequestForApproval.amount * parseFloat(withdrawalFeePercent)) / 100)}<br />
                      <strong>User Receives: {formatCurrency(selectedRequestForApproval.amount - (selectedRequestForApproval.amount * parseFloat(withdrawalFeePercent)) / 100)}</strong><br />
                      <strong>Total Deducted from Balance: {formatCurrency(selectedRequestForApproval.amount)}</strong>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowApproveModal(false)
                      setSelectedRequestForApproval(null)
                      setWithdrawalFeePercent('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? 'Approving...' : 'Approve Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WithdrawalRequests
