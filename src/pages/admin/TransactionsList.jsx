import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminTransactions } from '../../queries/adminQueries'
import { useRefundTransaction } from '../../mutations/adminMutations'

const TransactionsList = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showRefundModal, setShowRefundModal] = useState(false)

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (statusFilter) params.status = statusFilter
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate
    return params
  }, [statusFilter, fromDate, toDate])

  // Fetch transactions
  const { data: transactionsResponse, isLoading, refetch } = useAdminTransactions(queryParams)
  const refundMutation = useRefundTransaction()

  // Extract transactions data
  const transactions = useMemo(() => {
    if (!transactionsResponse) return []
    const responseData = transactionsResponse.data || transactionsResponse
    let transactionsList = Array.isArray(responseData) ? responseData : (responseData.transactions || [])

    // Apply search filter
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      transactionsList = transactionsList.filter(transaction => {
        const invoiceNumber = transaction._id?.toString().substring(0, 8) || ''
        const userName = transaction.userId?.fullName || transaction.userId?.email || ''
        const userEmail = transaction.userId?.email || ''
        return (
          invoiceNumber.toLowerCase().includes(searchLower) ||
          userName.toLowerCase().includes(searchLower) ||
          userEmail.toLowerCase().includes(searchLower)
        )
      })
    }

    return transactionsList
  }, [transactionsResponse, searchFilter])

  // Handle refund
  const handleRefund = async () => {
    if (!selectedTransaction) return

    try {
      await refundMutation.mutateAsync(selectedTransaction._id)
      toast.success('Transaction refunded successfully')
      setShowRefundModal(false)
      setSelectedTransaction(null)
      refetch()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to refund transaction'
      toast.error(errorMessage)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get transaction type
  const getTransactionType = (transaction) => {
    if (transaction.relatedAppointmentId) return 'Appointment'
    if (transaction.relatedSubscriptionId) return 'Subscription'
    if (transaction.relatedProductId) return 'Product'
    return 'Other'
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-success-light'
      case 'PENDING':
        return 'bg-warning-light'
      case 'FAILED':
        return 'bg-danger-light'
      case 'REFUNDED':
        return 'bg-info-light'
      default:
        return 'bg-secondary-light'
    }
  }

  // Get user name
  const getUserName = (transaction) => {
    if (!transaction.userId) return 'Unknown User'
    if (typeof transaction.userId === 'object') {
      return transaction.userId.fullName || transaction.userId.email || 'Unknown User'
    }
    return 'Unknown User'
  }

  // Get user email
  const getUserEmail = (transaction) => {
    if (!transaction.userId) return ''
    if (typeof transaction.userId === 'object') {
      return transaction.userId.email || ''
    }
    return ''
  }

  // Get invoice number (using transaction ID)
  const getInvoiceNumber = (transaction) => {
    if (!transaction._id) return 'N/A'
    return `#INV-${transaction._id.toString().substring(0, 8).toUpperCase()}`
  }

  // Clear filters
  const handleClearFilters = () => {
    setStatusFilter('')
    setSearchFilter('')
    setFromDate('')
    setToDate('')
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Transactions</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Transactions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by invoice, name, or email..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="From Date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="To Date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th className="text-center">Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0 small text-muted">Loading transactions...</p>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-muted">No transactions found</p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>
                            <Link to={`/transaction/${transaction._id}`}>
                              {getInvoiceNumber(transaction)}
                            </Link>
                          </td>
                          <td>
                            <h2 className="table-avatar">
                              <a href="#" className="avatar avatar-sm me-2">
                                <img
                                  className="avatar-img rounded-circle"
                                  src="/assets/img/patients/patient1.jpg"
                                  alt="User Image"
                                  onError={(e) => {
                                    e.target.src = '/assets/img/patients/patient1.jpg'
                                  }}
                                />
                              </a>
                              <a href="#">{getUserName(transaction)}</a>
                            </h2>
                            <small className="text-muted">{getUserEmail(transaction)}</small>
                          </td>
                          <td>{getTransactionType(transaction)}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>{formatDate(transaction.createdAt)}</td>
                          <td className="text-center">
                            <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                              {transaction.status || 'N/A'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="actions">
                              {transaction.status === 'SUCCESS' && (
                                <button
                                  className="btn btn-sm bg-warning-light me-2"
                                  onClick={() => {
                                    setSelectedTransaction(transaction)
                                    setShowRefundModal(true)
                                  }}
                                  disabled={refundMutation.isLoading}
                                  title="Refund Transaction"
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
                                  <i className="fa fa-refresh" style={{ 
                                    fontSize: '14px', 
                                    display: 'inline-block', 
                                    lineHeight: '1', 
                                    visibility: 'visible', 
                                    opacity: 1
                                  }}></i>
                                </button>
                              )}
                              {transaction.status === 'REFUNDED' && (
                                <span className="badge bg-info-light">Refunded</span>
                              )}
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

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setShowRefundModal(false)}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 1051 }}
              >
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Refund Transaction</h4>
                    {selectedTransaction && (
                      <div className="mb-3">
                        <p className="mb-2">
                          <strong>Invoice:</strong> {getInvoiceNumber(selectedTransaction)}
                        </p>
                        <p className="mb-2">
                          <strong>User:</strong> {getUserName(selectedTransaction)}
                        </p>
                        <p className="mb-2">
                          <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
                        </p>
                        <p className="mb-4">
                          Are you sure you want to refund this transaction? This action cannot be undone.
                        </p>
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleRefund}
                        disabled={refundMutation.isLoading}
                      >
                        {refundMutation.isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Processing...
                          </>
                        ) : (
                          'Confirm Refund'
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowRefundModal(false)
                          setSelectedTransaction(null)
                        }}
                        disabled={refundMutation.isLoading}
                      >
                        Cancel
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

export default TransactionsList
