import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAdminOrder } from '../../queries/adminQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { put } from '../../utils/api'
import { ADMIN_ROUTES } from '../../utils/apiConfig'
import { toast } from 'react-toastify'
import { useState } from 'react'

const OrderDetails = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [shippingFee, setShippingFee] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Fetch order details
  const { data: orderResponse, isLoading, error, refetch } = useAdminOrder(orderId)
  
  // Extract order data
  const order = orderResponse?.data || orderResponse

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => put(ADMIN_ROUTES.ORDER_BY_ID(orderId) + '/status', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-order', orderId])
      queryClient.invalidateQueries(['admin-orders'])
      setShowStatusModal(false)
      setNewStatus('')
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
      queryClient.invalidateQueries(['admin-order', orderId])
      queryClient.invalidateQueries(['admin-orders'])
      setShowShippingModal(false)
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
    if (!order || !newStatus) return
    updateStatusMutation.mutate({ orderId: order._id, status: newStatus })
  }

  // Handle shipping update
  const handleUpdateShipping = () => {
    if (!order) return
    const fee = parseFloat(shippingFee)
    if (isNaN(fee) || fee < 0) {
      toast.error('Please enter a valid shipping fee')
      return
    }
    updateShippingMutation.mutate({ orderId: order._id, shippingFee: fee })
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Normalize image URL
  const normalizeImageUrl = (imageUri) => {
    if (!imageUri || typeof imageUri !== 'string') return null
    const trimmedUri = imageUri.trim()
    if (!trimmedUri) return null
    const apiBaseURL = import.meta.env.VITE_API_URL || 'https://mydoctoradmin.mydoctorplus.it/api'
    const baseURL = apiBaseURL.replace('/api', '')
    if (trimmedUri.startsWith('http://') || trimmedUri.startsWith('https://')) {
      return trimmedUri
    }
    const imagePath = trimmedUri.startsWith('/') ? trimmedUri : `/${trimmedUri}`
    return `${baseURL}${imagePath}`
  }

  // Get patient name
  const getPatientName = (order) => {
    if (!order?.patientId) return 'Unknown Patient'
    if (typeof order.patientId === 'object') {
      return order.patientId.fullName || order.patientId.email || 'Unknown Patient'
    }
    return 'Unknown Patient'
  }

  // Get pharmacy name
  const getPharmacyName = (order) => {
    if (!order?.pharmacyId) return 'Unknown Pharmacy'
    if (typeof order.pharmacyId === 'object') {
      return order.pharmacyId.name || 'Unknown Pharmacy'
    }
    return 'Unknown Pharmacy'
  }

  if (isLoading) {
    return (
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading order details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <i className="fe fe-alert-circle" style={{ fontSize: '64px', color: '#dc3545' }}></i>
                <h5 className="mt-3">Error Loading Order</h5>
                <p className="text-muted">{error?.response?.data?.message || error?.message || 'Failed to load order details'}</p>
                <div className="mt-3">
                  <button className="btn btn-primary me-2" onClick={() => refetch()}>
                    Retry
                  </button>
                  <Link to="/orders" className="btn btn-outline-secondary">
                    Back to Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const patient = typeof order.patientId === 'object' ? order.patientId : null
  const pharmacy = typeof order.pharmacyId === 'object' ? order.pharmacyId : null
  const shippingAddress = order.shippingAddress

  return (
    <div className="content">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Order Details</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/orders">Orders</Link></li>
                <li className="breadcrumb-item active">Order Details</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {/* Order Header Card */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div>
                    <p className="text-muted mb-1">Order Number</p>
                    <h4 className="mb-0">{order.orderNumber || `#${order._id?.substring(0, 8)}`}</h4>
                    <p className="text-muted mb-0 mt-2">Order Date: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-end">
                    <div className="mb-2">
                      <span className={`badge ${getStatusBadgeClass(order.status)} me-2`}>
                        {order.status || 'N/A'}
                      </span>
                      <span className={`badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus || 'N/A'}
                      </span>
                    </div>
                    <div className="btn-group">
                      {['PENDING', 'CONFIRMED'].includes(order.status) && 
                       order.paymentStatus === 'PENDING' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShippingFee(order.shipping?.toString() || '0')
                            setShowShippingModal(true)
                          }}
                        >
                          <i className="fe fe-truck me-1"></i>Set Shipping
                        </button>
                      )}
                      {order.paymentStatus === 'PAID' && 
                       ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status) && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setSelectedOrder(order)
                            setNewStatus('')
                            setShowStatusModal(true)
                          }}
                          disabled={updateStatusMutation.isLoading}
                        >
                          <i className="fe fe-edit me-1"></i>Update Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Left Column - Order Items */}
              <div className="col-lg-8">
                {/* Order Items */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Order Items</h4>
                  </div>
                  <div className="card-body">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => {
                        const product = typeof item.productId === 'object' ? item.productId : null
                        const productName = product?.name || 'Product'
                        const productImage = product?.images?.[0]
                        const normalizedImageUrl = normalizeImageUrl(productImage)
                        const itemPrice = item.discountPrice || item.price

                        return (
                          <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                            {normalizedImageUrl ? (
                              <img
                                src={normalizedImageUrl}
                                alt={productName}
                                className="img-fluid"
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }}
                                onError={(e) => {
                                  e.target.src = '/assets/img/products/product1.jpg'
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{ width: '80px', height: '80px', borderRadius: '8px', marginRight: '15px' }}
                              >
                                <i className="fe fe-package" style={{ fontSize: '32px', color: '#dee2e6' }}></i>
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <h5 className="mb-1">{productName}</h5>
                              <p className="text-muted mb-1">Quantity: {item.quantity}</p>
                              <p className="text-muted mb-0">{formatCurrency(itemPrice)} each</p>
                            </div>
                            <div>
                              <h5 className="mb-0">{formatCurrency(item.total)}</h5>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-muted">No items found</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {shippingAddress && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h4 className="card-title mb-0">Shipping Address</h4>
                    </div>
                    <div className="card-body">
                      <p className="mb-1">{shippingAddress.line1}</p>
                      {shippingAddress.line2 && <p className="mb-1">{shippingAddress.line2}</p>}
                      <p className="mb-1">
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                      </p>
                      <p className="mb-0">{shippingAddress.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Order Summary & Info */}
              <div className="col-lg-4">
                {/* Order Summary */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Order Summary</h4>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax</span>
                      <span>{formatCurrency(order.tax || 0)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <span>Shipping</span>
                        {order.finalShipping !== null && order.finalShipping !== undefined && 
                         order.initialShipping && order.finalShipping !== order.initialShipping && (
                          <small className="text-muted d-block">
                            Updated from {formatCurrency(order.initialShipping)}
                          </small>
                        )}
                      </div>
                      <span>{formatCurrency(order.shipping || 0)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <strong>Total</strong>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Order Information</h4>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Patient:</strong>
                      <p className="mb-0">{getPatientName(order)}</p>
                      {patient?.email && (
                        <p className="text-muted small mb-0">{patient.email}</p>
                      )}
                      {patient?.phone && (
                        <p className="text-muted small mb-0">{patient.phone}</p>
                      )}
                    </div>
                    <div className="mb-3">
                      <strong>Pharmacy:</strong>
                      <p className="mb-0">{getPharmacyName(order)}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Order Date:</strong>
                      <p className="mb-0">{formatDate(order.createdAt)}</p>
                    </div>
                    {order.deliveredAt && (
                      <div className="mb-3">
                        <strong>Delivered Date:</strong>
                        <p className="mb-0">{formatDate(order.deliveredAt)}</p>
                      </div>
                    )}
                    <div>
                      <strong>Payment Method:</strong>
                      <p className="mb-0">{order.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Back Button */}
                <Link to="/orders" className="btn btn-outline-secondary w-100">
                  <i className="fe fe-arrow-left me-2"></i>Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && order && (
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
                    setNewStatus('')
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Order:</strong> {order.orderNumber}</p>
                <p><strong>Current Status:</strong> 
                  <span className={`badge ${getStatusBadgeClass(order.status)} ms-2`}>
                    {order.status}
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
                      if (status === order.status) return null
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
                    setNewStatus('')
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
      )}

      {/* Shipping Fee Update Modal */}
      {showShippingModal && order && (
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
                    setShippingFee('')
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Order:</strong> {order.orderNumber}</p>
                <p><strong>Current Shipping:</strong> {formatCurrency(order.shipping || 0)}</p>
                {order.initialShipping && order.initialShipping !== order.shipping && (
                  <p className="text-muted small">
                    Initial shipping was {formatCurrency(order.initialShipping)}
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
      )}
    </div>
  )
}

export default OrderDetails
