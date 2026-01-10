import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminOrders } from '../../queries/adminQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { put, post } from '../../utils/api'
import { ADMIN_ROUTES } from '../../utils/apiConfig'

const Orders = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [shippingFee, setShippingFee] = useState('')
  const [newStatus, setNewStatus] = useState('')

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      page: 1,
      limit: 100 // Fetch more orders by default
    }
    if (statusFilter) params.status = statusFilter
    return params
  }, [statusFilter])

  // Fetch orders
  const { data: ordersResponse, isLoading, refetch } = useAdminOrders(queryParams)

  // Extract orders data
  const orders = useMemo(() => {
    if (!ordersResponse) return []
    const responseData = ordersResponse.data || ordersResponse
    let ordersList = Array.isArray(responseData) ? responseData : (responseData.orders || [])

    // Apply search filter
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      ordersList = ordersList.filter(order => {
        const orderNumber = order.orderNumber || ''
        const patientName = order.patientId?.fullName || order.patientId?.email || ''
        const pharmacyName = order.pharmacyId?.name || ''
        return (
          orderNumber.toLowerCase().includes(searchLower) ||
          patientName.toLowerCase().includes(searchLower) ||
          pharmacyName.toLowerCase().includes(searchLower)
        )
      })
    }

    return ordersList
  }, [ordersResponse, searchFilter])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const allOrders = orders
    const counts = {
      ALL: allOrders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    }
    
    allOrders.forEach(order => {
      const status = order.status
      if (counts.hasOwnProperty(status)) {
        counts[status]++
      }
    })
    
    return counts
  }, [orders])

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => put(ADMIN_ROUTES.ORDER_BY_ID(orderId) + '/status', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders'])
      setShowStatusModal(false)
      setSelectedOrder(null)
      toast.success('Order status updated successfully')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status'
      toast.error(errorMessage)
    },
  })

  // Update shipping mutation
  const updateShippingMutation = useMutation({
    mutationFn: ({ orderId, shippingFee }) => put(ADMIN_ROUTES.ORDER_BY_ID(orderId) + '/shipping', { shippingFee }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders'])
      setShowShippingModal(false)
      setSelectedOrder(null)
      setShippingFee('')
      toast.success('Shipping fee updated successfully')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update shipping fee'
      toast.error(errorMessage)
    },
  })

  // Handle status update
  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return
    updateStatusMutation.mutate({ orderId: selectedOrder._id, status: newStatus })
  }

  // Handle shipping update
  const handleUpdateShipping = () => {
    if (!selectedOrder) return
    const fee = parseFloat(shippingFee)
    if (isNaN(fee) || fee < 0) {
      toast.error('Please enter a valid shipping fee')
      return
    }
    updateShippingMutation.mutate({ orderId: selectedOrder._id, shippingFee: fee })
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-success-light'
      case 'SHIPPED':
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-info-light'
      case 'PENDING':
        return 'bg-warning-light'
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-danger-light'
      default:
        return 'bg-secondary-light'
    }
  }

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-success-light'
      case 'PARTIAL':
        return 'bg-warning-light'
      case 'PENDING':
        return 'bg-danger-light'
      case 'REFUNDED':
        return 'bg-info-light'
      default:
        return 'bg-secondary-light'
    }
  }

  // Get patient name
  const getPatientName = (order) => {
    if (!order.patientId) return 'Unknown Patient'
    if (typeof order.patientId === 'object') {
      return order.patientId.fullName || order.patientId.email || 'Unknown Patient'
    }
    return 'Unknown Patient'
  }

  // Get pharmacy name
  const getPharmacyName = (order) => {
    if (!order.pharmacyId) return 'Unknown Pharmacy'
    if (typeof order.pharmacyId === 'object') {
      return order.pharmacyId.name || 'Unknown Pharmacy'
    }
    return 'Unknown Pharmacy'
  }

  // Clear filters
  const handleClearFilters = () => {
    setStatusFilter('')
    setSearchFilter('')
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Orders</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Orders</li>
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
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by order number, patient, or pharmacy..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-5">
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
                      className={`btn ${statusFilter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setStatusFilter('PENDING')}
                    >
                      Pending ({statusCounts.PENDING})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'CONFIRMED' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setStatusFilter('CONFIRMED')}
                    >
                      Confirmed ({statusCounts.CONFIRMED})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'PROCESSING' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setStatusFilter('PROCESSING')}
                    >
                      Processing ({statusCounts.PROCESSING})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'SHIPPED' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setStatusFilter('SHIPPED')}
                    >
                      Shipped ({statusCounts.SHIPPED})
                    </button>
                    <button
                      type="button"
                      className={`btn ${statusFilter === 'DELIVERED' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setStatusFilter('DELIVERED')}
                    >
                      Delivered ({statusCounts.DELIVERED})
                    </button>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Patient</th>
                      <th>Pharmacy</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0 small text-muted">Loading orders...</p>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          <p className="text-muted">No orders found</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <strong>{order.orderNumber || `#${order._id.substring(0, 8)}`}</strong>
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
                              <a href="#">{getPatientName(order)}</a>
                            </h2>
                          </td>
                          <td>{getPharmacyName(order)}</td>
                          <td>{order.items?.length || 0} item(s)</td>
                          <td><strong>{formatCurrency(order.total)}</strong></td>
                          <td>
                            <span className={`badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                              {order.paymentStatus || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status || 'N/A'}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td className="text-end">
                            <div className="actions">
                              <Link
                                to={`/order/${order._id}`}
                                className="btn btn-sm bg-info-light me-2"
                                title="View Details"
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
                                <i className="fa fa-eye" style={{ 
                                  fontSize: '14px', 
                                  display: 'inline-block', 
                                  lineHeight: '1', 
                                  visibility: 'visible', 
                                  opacity: 1
                                }}></i>
                              </Link>
                              {['PENDING', 'CONFIRMED'].includes(order.status) && 
                               order.paymentStatus === 'PENDING' && (
                                <button
                                  className="btn btn-sm bg-warning-light me-2"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShippingFee(order.shipping?.toString() || '0')
                                    setShowShippingModal(true)
                                  }}
                                  title="Set Shipping Fee"
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
                                  <i className="fa fa-truck" style={{ 
                                    fontSize: '14px', 
                                    display: 'inline-block', 
                                    lineHeight: '1', 
                                    visibility: 'visible', 
                                    opacity: 1
                                  }}></i>
                                </button>
                              )}
                              {order.paymentStatus === 'PAID' && 
                               ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status) && (
                                <button
                                  className="btn btn-sm bg-primary-light"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setNewStatus('')
                                    setShowStatusModal(true)
                                  }}
                                  title="Update Status"
                                  disabled={updateStatusMutation.isLoading}
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

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <>
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowStatusModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Order Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedOrder(null)
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Order:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Current Status:</strong> 
                    <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Select New Status:</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => {
                        if (status === selectedOrder.status) return null
                        return (
                          <option key={status} value={status}>{status}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedOrder(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || updateStatusMutation.isLoading}
                  >
                    {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Shipping Fee Update Modal */}
      {showShippingModal && selectedOrder && (
        <>
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowShippingModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Shipping Fee</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowShippingModal(false)
                      setSelectedOrder(null)
                      setShippingFee('')
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Order:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Current Shipping:</strong> {formatCurrency(selectedOrder.shipping)}</p>
                  {selectedOrder.initialShipping && selectedOrder.initialShipping !== selectedOrder.shipping && (
                    <p className="text-muted small">
                      Initial shipping was {formatCurrency(selectedOrder.initialShipping)}
                    </p>
                  )}
                  <div className="mb-3">
                    <label className="form-label">New Shipping Fee ($):</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter shipping fee"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowShippingModal(false)
                      setSelectedOrder(null)
                      setShippingFee('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateShipping}
                    disabled={updateShippingMutation.isLoading}
                  >
                    {updateShippingMutation.isLoading ? 'Updating...' : 'Update Shipping'}
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

export default Orders

