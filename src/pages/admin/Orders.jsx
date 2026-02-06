import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdminOrders } from '../../queries/adminQueries'

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

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
    if (!dateString) return '—'
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
                <div className="col-md-5">
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
                    <option value="">All ({statusCounts.ALL})</option>
                    <option value="PENDING">Pending ({statusCounts.PENDING})</option>
                    <option value="CONFIRMED">Confirmed ({statusCounts.CONFIRMED})</option>
                    <option value="PROCESSING">Processing ({statusCounts.PROCESSING})</option>
                    <option value="SHIPPED">Shipped ({statusCounts.SHIPPED})</option>
                    <option value="DELIVERED">Delivered ({statusCounts.DELIVERED})</option>
                    <option value="CANCELLED">Cancelled ({statusCounts.CANCELLED})</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex justify-content-end">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleClearFilters}>
                    Clear
                  </button>
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
                            <a href="#">{getPatientName(order)}</a>
                          </td>
                          <td>{getPharmacyName(order)}</td>
                          <td>{order.items?.length || 0} item(s)</td>
                          <td><strong>{formatCurrency(order.total)}</strong></td>
                          <td>
                            <span className={`badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                              {order.paymentStatus || '—'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status || '—'}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td className="text-end">
                            <div className="actions">
                              <Link
                                to={`/order/${order._id}`}
                                className="btn btn-sm bg-info-light"
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

    </>
  )
}

export default Orders

