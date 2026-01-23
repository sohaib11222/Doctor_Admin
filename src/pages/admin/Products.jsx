import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminProducts, useAdminPharmacies } from '../../queries/adminQueries'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../mutations/adminMutations'
import { post as apiPost } from '../../utils/api'

const Products = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sellerTypeFilter, setSellerTypeFilter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    sku: '',
    discountPrice: '',
    category: '',
    subCategory: '',
    tags: '',
    isActive: true,
    images: [],
    pharmacyId: '' // Pharmacy selection for linking product
  })
  const [imageFiles, setImageFiles] = useState([])

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (searchFilter) params.search = searchFilter
    if (categoryFilter) params.category = categoryFilter
    if (sellerTypeFilter) params.sellerType = sellerTypeFilter
    return params
  }, [searchFilter, categoryFilter, sellerTypeFilter])

  // Fetch products
  const { data: productsResponse, isLoading, error, refetch } = useAdminProducts(queryParams)
  
  // Fetch pharmacies for dropdown - only show admin-owned pharmacies
  const { data: pharmaciesResponse } = useAdminPharmacies({ limit: 1000, ownerRole: 'ADMIN' }) // Get only admin-owned pharmacies
  const pharmacies = useMemo(() => {
    if (!pharmaciesResponse) return []
    const responseData = pharmaciesResponse.data || pharmaciesResponse
    return Array.isArray(responseData) ? responseData : (responseData.pharmacies || [])
  }, [pharmaciesResponse])

  // Create mutation
  const createMutation = useCreateProduct()
  
  // Update mutation
  const updateMutation = useUpdateProduct()
  
  // Delete mutation
  const deleteMutation = useDeleteProduct()

  // Extract products data
  // Axios interceptor returns response.data directly
  // Backend returns: { success: true, message: 'OK', data: { products: [...], pagination: {...} } }
  const products = useMemo(() => {
    if (!productsResponse) return []
    
    // Handle different response structures
    let extractedProducts = []
    if (Array.isArray(productsResponse)) {
      extractedProducts = productsResponse
    } else if (productsResponse.data && Array.isArray(productsResponse.data)) {
      extractedProducts = productsResponse.data
    } else if (productsResponse.data && productsResponse.data.products) {
      extractedProducts = productsResponse.data.products
    } else if (productsResponse.products) {
      extractedProducts = productsResponse.products
    }
    
    console.log('Admin products list:', {
      responseStructure: productsResponse,
      total: extractedProducts.length,
      products: extractedProducts.map(p => ({ 
        id: p._id, 
        name: p.name, 
        sellerType: p.sellerType, 
        sellerId: p.sellerId,
        isActive: p.isActive
      }))
    })
    
    return extractedProducts
  }, [productsResponse])

  // Extract pagination data
  // Backend returns: { success: true, message: 'OK', data: { products: [...], pagination: {...} } }
  const pagination = useMemo(() => {
    if (!productsResponse) return null
    
    // Handle different response structures
    if (productsResponse.data && productsResponse.data.pagination) {
      return productsResponse.data.pagination
    } else if (productsResponse.pagination) {
      return productsResponse.pagination
    }
    
    return null
  }, [productsResponse])

  // Handle create
  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      price: '',
      stock: '',
      description: '',
      sku: '',
      discountPrice: '',
      category: '',
      subCategory: '',
      tags: '',
      isActive: true,
      images: [],
      pharmacyId: '' // Pharmacy selection for linking product
    })
    setImageFiles([])
    setShowModal(true)
  }

  // Handle edit
  const handleEdit = (product) => {
    console.log('Editing product:', product)
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      price: product.price !== undefined && product.price !== null ? String(product.price) : '',
      stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '',
      description: product.description || '',
      sku: product.sku || '',
      discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? String(product.discountPrice) : '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      isActive: product.isActive !== undefined ? product.isActive : true,
      images: Array.isArray(product.images) ? product.images : []
    })
    setImageFiles([])
    setShowModal(true)
    console.log('Modal opened, editingProduct set:', product._id)
  }

  // Handle delete
  const handleDelete = (product) => {
    setEditingProduct(product)
    setShowDeleteModal(true)
  }

  // Handle image upload
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return []
    
    try {
      // Use /upload/product route which supports multiple files
      // Note: Backend route needs ADMIN role added to authGuard(['DOCTOR', 'PHARMACY'])
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file) // Note: field name is 'files' (plural) for multiple uploads
      })
      
      const response = await apiPost('/upload/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Response structure: { success: true, data: { urls: [...] } }
      const responseData = response?.data || response
      if (responseData?.urls && Array.isArray(responseData.urls)) {
        return responseData.urls
      }
      
      // Fallback: if single url returned
      if (responseData?.url) {
        return [responseData.url]
      }
      
      return []
    } catch (error) {
      console.error('Image upload error:', error)
      // If ADMIN is not allowed, fallback to /upload/general (single file only)
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('Product upload route not accessible, falling back to general upload (single file only)')
        // Upload files one by one using general route
        const uploadPromises = Array.from(files).map(async (file) => {
          const singleFormData = new FormData()
          singleFormData.append('file', file)
          const response = await apiPost('/upload/general', singleFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          const responseData = response?.data || response
          return responseData?.url || responseData?.data?.url
        })
        
        const uploadedUrls = await Promise.all(uploadPromises)
        return uploadedUrls.filter(url => url)
      }
      throw error
    }
  }

  // Handle save
  const handleSave = async () => {
    console.log('handleSave called, editingProduct:', editingProduct)
    console.log('Form data:', formData)
    
    if (!formData.name || !formData.name.trim()) {
      toast.error('Please enter product name')
      return
    }

    // Validate price
    const price = formData.price ? parseFloat(formData.price) : null
    if (price === null || isNaN(price) || price < 0) {
      toast.error('Please enter a valid price (must be a number >= 0)')
      return
    }

    // Validate stock if provided
    let stock = 0
    if (formData.stock !== undefined && formData.stock !== null && formData.stock !== '') {
      // Handle both string and number types
      const stockValue = typeof formData.stock === 'string' ? formData.stock.trim() : String(formData.stock)
      if (stockValue !== '') {
        stock = parseInt(stockValue)
        if (isNaN(stock) || stock < 0) {
          toast.error('Stock must be a non-negative integer')
          return
        }
      }
    }

    // Validate discount price if provided
    let discountPrice = null
    if (formData.discountPrice !== undefined && formData.discountPrice !== null && formData.discountPrice !== '') {
      // Handle both string and number types
      const discountValue = typeof formData.discountPrice === 'string' ? formData.discountPrice.trim() : String(formData.discountPrice)
      if (discountValue !== '') {
        discountPrice = parseFloat(discountValue)
        if (isNaN(discountPrice) || discountPrice < 0) {
          toast.error('Discount price must be a non-negative number')
          return
        }
        if (discountPrice >= price) {
          toast.error('Discount price must be less than regular price')
          return
        }
      }
    }

    try {
      let imageUrls = [...formData.images]

      // Upload new images if files selected
      if (imageFiles.length > 0) {
        const uploadedUrls = await handleImageUpload(imageFiles)
        imageUrls = [...imageUrls, ...uploadedUrls]
      }

      // Convert relative image URLs to full URLs if needed
      // Backend validator requires full URLs (http:// or https://)
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://mydoctoradmin.mydoctorplus.it/api'
      // Remove /api from base URL to get server base URL
      const serverBaseUrl = apiBaseUrl.replace('/api', '')
      const fullImageUrls = imageUrls.map(url => {
        if (!url || typeof url !== 'string') return null
        // If already a full URL, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url
        }
        // Convert relative path to full URL
        // URL is like /uploads/product/... so we just prepend server base URL
        const cleanUrl = url.startsWith('/') ? url : '/' + url
        return `${serverBaseUrl}${cleanUrl}`
      }).filter(url => url !== null && url !== '')

      // For update, if no new images uploaded and no existing images, don't send images field
      // This prevents clearing existing images accidentally
      const shouldIncludeImages = editingProduct 
        ? (fullImageUrls.length > 0 || imageFiles.length > 0) // Only include if we have new/existing images
        : (fullImageUrls.length > 0) // For create, include if we have images

      // Parse tags
      const tags = formData.tags && formData.tags.trim()
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []

      // Build product data, ensuring proper types and no empty strings
      const productData = {
        name: formData.name.trim(),
        price: Number(price), // Ensure it's a number
        stock: Number(stock), // Ensure it's an integer number
        isActive: Boolean(formData.isActive)
      }
      
      // If pharmacy is selected, include pharmacyId (backend will link to pharmacy)
      // Only include if it's a non-empty string
      if (formData.pharmacyId && formData.pharmacyId.trim() !== '') {
        productData.pharmacyId = formData.pharmacyId.trim()
        console.log('Including pharmacyId in product data:', productData.pharmacyId)
      } else {
        console.log('No pharmacyId included (empty or not selected)')
      }
      
      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        productData.description = formData.description.trim()
      }
      if (formData.sku && formData.sku.trim()) {
        productData.sku = formData.sku.trim()
      }
      if (discountPrice !== null && !isNaN(discountPrice)) {
        productData.discountPrice = Number(discountPrice)
      }
      if (formData.category && formData.category.trim()) {
        productData.category = formData.category.trim()
      }
      if (formData.subCategory && formData.subCategory.trim()) {
        productData.subCategory = formData.subCategory.trim()
      }
      if (tags.length > 0) {
        productData.tags = tags
      }
      // Only include images if we should (see shouldIncludeImages logic above)
      if (shouldIncludeImages && fullImageUrls.length > 0) {
        productData.images = fullImageUrls
      }
      
      console.log('Sending product data:', JSON.stringify(productData, null, 2))
      console.log('Pharmacy ID:', formData.pharmacyId)
      console.log('Editing product:', editingProduct ? editingProduct._id : 'none')
      console.log('Image URLs:', fullImageUrls)
      console.log('Should include images:', shouldIncludeImages)

      // Note: sellerId and sellerType are automatically set by backend from authenticated user
      if (editingProduct) {
        await updateMutation.mutateAsync({
          productId: editingProduct._id,
          data: productData
        })
        toast.success('Product updated successfully!')
      } else {
        await createMutation.mutateAsync(productData)
        toast.success('Product created successfully!')
      }

      setShowModal(false)
      setEditingProduct(null)
      setImageFiles([])
      
      // Invalidate and refetch products list
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      refetch()
    } catch (error) {
      // Handle validation errors from backend
      let errorMessage = 'Failed to save product'
      
      if (error.response?.data) {
        const errorData = error.response.data
        // Zod validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => {
            const field = err.field ? `${err.field}: ` : ''
            return `${field}${err.message || err.msg}`
          }).join(', ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.error('Product creation/update error:', {
        error,
        message: errorMessage,
        response: error.response?.data,
        status: error.response?.status,
        pharmacyId: formData.pharmacyId,
        productData
      })
      
      toast.error(errorMessage)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!editingProduct) return

    try {
      await deleteMutation.mutateAsync(editingProduct._id)
      toast.success('Product deleted successfully!')
      setShowDeleteModal(false)
      setEditingProduct(null)
      // Note: Cache invalidation is handled by mutation's onSuccess callback
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product'
      toast.error(errorMessage)
    }
  }

  // Get seller name
  const getSellerName = (seller) => {
    if (!seller) return '—'
    if (typeof seller === 'object') {
      return seller.fullName || seller.email || 'Unknown Seller'
    }
    return 'Unknown Seller'
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price || 0)
  }

  // Calculate discount percentage
  const getDiscountPercent = (price, discountPrice) => {
    if (!price || !discountPrice || discountPrice >= price) return 0
    return Math.round(((price - discountPrice) / price) * 100)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchFilter('')
    setCategoryFilter('')
    setSellerTypeFilter('')
  }

  // Check if any filters are active
  const hasActiveFilters = searchFilter || categoryFilter || sellerTypeFilter

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Products</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Products</li>
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
                    <label className="mb-2">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or description"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter by category"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="mb-2">Seller Type</label>
                    <select
                      className="form-control"
                      value={sellerTypeFilter}
                      onChange={(e) => setSellerTypeFilter(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="ADMIN">Admin</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="PHARMACY">Pharmacy</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group d-flex align-items-end gap-2">
                    {hasActiveFilters && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={handleClearFilters}
                        title="Clear all filters"
                      >
                        <i className="fe fe-x me-1"></i>
                        Clear
                      </button>
                    )}
                    <button className="btn btn-primary flex-grow-1" onClick={handleCreate}>
                      <i className="fe fe-plus me-2"></i>
                      Add Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="datatable table table-hover table-center mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Seller</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading products...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-danger">Error loading products: {error.message || 'Unknown error'}</p>
                          <button className="btn btn-sm btn-primary" onClick={() => refetch()}>Retry</button>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <p className="text-muted">No products found</p>
                          <button className="btn btn-sm btn-primary mt-2" onClick={handleCreate}>Add First Product</button>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <h2 className="table-avatar">
                              {product.images && product.images.length > 0 && (
                                <a href="#" className="avatar avatar-sm me-2">
                                  <img
                                    className="avatar-img rounded"
                                    src={product.images[0]}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </a>
                              )}
                              <a href="#">{product.name}</a>
                            </h2>
                            {product.sku && (
                              <small className="text-muted">SKU: {product.sku}</small>
                            )}
                          </td>
                          <td>
                            <div>
                              <span className="badge bg-info-light">{product.sellerType}</span>
                              <br />
                              <small>{getSellerName(product.sellerId)}</small>
                            </div>
                          </td>
                          <td>
                            {product.category && (
                              <div>
                                <span>{product.category}</span>
                                {product.subCategory && (
                                  <small className="d-block text-muted">{product.subCategory}</small>
                                )}
                              </div>
                            )}
                            {!product.category && <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <div>
                              {product.discountPrice && product.discountPrice < product.price ? (
                                <>
                                  <span className="text-decoration-line-through text-muted me-2">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span className="text-primary fw-bold">
                                    {formatPrice(product.discountPrice)}
                                  </span>
                                  <br />
                                  <small className="text-success">
                                    {getDiscountPercent(product.price, product.discountPrice)}% OFF
                                  </small>
                                </>
                              ) : (
                                <span className="fw-bold">{formatPrice(product.price)}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                              {product.stock || 0}
                            </span>
                          </td>
                          <td>
                            {product.isActive ? (
                              <span className="badge bg-success-light">Active</span>
                            ) : (
                              <span className="badge bg-danger-light">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn btn-sm bg-success-light me-2"
                                onClick={() => handleEdit(product)}
                                title="Edit"
                                disabled={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
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
                              <button
                                className="btn btn-sm bg-danger-light"
                                onClick={() => handleDelete(product)}
                                title="Delete"
                                disabled={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
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
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowModal(false)
              setEditingProduct(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowModal(false)
                setEditingProduct(null)
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051, pointerEvents: 'auto' }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Note: When pharmacy is selected, product will be linked to that pharmacy
                      - sellerId = pharmacy.ownerId
                      - sellerType = "PHARMACY"
                      If no pharmacy selected, product uses admin's ID and sellerType = "ADMIN" */}
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Select Pharmacy <span className="text-muted">(Optional - to link product to a pharmacy)</span>
                      </label>
                      <select
                        className="form-control"
                        value={formData.pharmacyId}
                        onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      >
                        <option value="">-- No Pharmacy (Admin Product) --</option>
                        {pharmacies.map((pharmacy) => (
                          <option key={pharmacy._id} value={pharmacy._id}>
                            {pharmacy.name} {pharmacy.address?.city ? `- ${pharmacy.address.city}` : ''}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        {formData.pharmacyId 
                          ? 'Product will be linked to the selected pharmacy' 
                          : 'Product will be created as admin product (not linked to any pharmacy)'}
                      </small>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter product name"
                        required
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">SKU</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Product SKU"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Price <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Discount Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        placeholder="0.00"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Product category"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Sub Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        placeholder="Product sub category"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product description"
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Product Images</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImageFiles(Array.from(e.target.files))}
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    />
                    {imageFiles.length > 0 && (
                      <small className="text-muted d-block mt-1">
                        {imageFiles.length} file(s) selected
                      </small>
                    )}
                    {formData.images && formData.images.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted d-block mb-2">Current Images:</small>
                        <div className="d-flex flex-wrap gap-2">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="position-relative" style={{ width: '80px', height: '80px' }}>
                              <img
                                src={img}
                                alt={`Product ${idx + 1}`}
                                className="img-thumbnail"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                style={{ transform: 'translate(50%, -50%)' }}
                                onClick={() => {
                                  const newImages = formData.images.filter((_, i) => i !== idx)
                                  setFormData({ ...formData, images: newImages })
                                }}
                                disabled={createMutation.isLoading || updateMutation.isLoading}
                              >
                                <i className="fe fe-x"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                    }}
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSave()
                    }}
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    style={{ pointerEvents: 'auto', cursor: (createMutation.isLoading || updateMutation.isLoading) ? 'not-allowed' : 'pointer' }}
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingProduct ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fe fe-save me-2"></i>
                        {editingProduct ? 'Update' : 'Create'} Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && editingProduct && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setShowDeleteModal(false)
              setEditingProduct(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setEditingProduct(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-body">
                  <div className="form-content p-2">
                    <h4 className="modal-title">Delete Product</h4>
                    <p className="mb-4">
                      Are you sure you want to delete <strong>{editingProduct.name}</strong>? 
                      This action cannot be undone.
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteModal(false)
                          setEditingProduct(null)
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

export default Products

