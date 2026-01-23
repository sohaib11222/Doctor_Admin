import { useParams, Link } from 'react-router-dom'
import { useAdminOrder } from '../../queries/adminQueries'

const OrderDetails = () => {
  const { orderId } = useParams()

  // Fetch order details
  const { data: orderResponse, isLoading, error, refetch } = useAdminOrder(orderId)
  
  // Extract order data
  const order = orderResponse?.data || orderResponse

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
                        {order.status || '—'}
                      </span>
                      <span className={`badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus || '—'}
                      </span>
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
                      <p className="mb-0">{order.paymentMethod || '—'}</p>
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

    </div>
  )
}

export default OrderDetails
