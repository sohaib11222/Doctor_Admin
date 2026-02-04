import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useUsers } from '../../queries/adminQueries'
import { useUpdateUserStatus, useDeleteUser } from '../../mutations/adminMutations'

const PharmacyUsers = () => {
  const [selectedRole, setSelectedRole] = useState('PHARMACY')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')

  const queryParams = useMemo(() => {
    const params = { role: selectedRole }
    if (searchTerm) params.search = searchTerm
    if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()
    return params
  }, [selectedRole, searchTerm, statusFilter])

  const { data: usersResponse, isLoading, error, refetch } = useUsers(queryParams)

  const users = useMemo(() => {
    if (!usersResponse) return []
    const responseData = usersResponse.data || usersResponse
    return Array.isArray(responseData) ? responseData : (responseData.users || [])
  }, [usersResponse])

  const updateStatusMutation = useUpdateUserStatus()
  const deleteUserMutation = useDeleteUser()

  const handleStatusChange = (user) => {
    setSelectedUser(user)
    setSelectedStatus(user.status || 'PENDING')
    setShowStatusModal(true)
  }

  const handleStatusUpdate = async () => {
    if (!selectedUser || !selectedStatus) return

    try {
      const userId = selectedUser._id
      await updateStatusMutation.mutateAsync({
        userId: String(userId),
        data: { status: selectedStatus }
      })
      toast.success(`${selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} user status updated successfully!`)
      setShowStatusModal(false)
      setSelectedUser(null)
      setSelectedStatus('')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status')
    }
  }

  const handleDelete = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      await deleteUserMutation.mutateAsync(String(selectedUser._id))
      toast.success(`${selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} user deleted successfully!`)
      setShowDeleteModal(false)
      setSelectedUser(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user')
    }
  }

  const getStatusBadge = (status) => {
    const statusUpper = (status || 'PENDING').toUpperCase()
    const badgeClass =
      statusUpper === 'APPROVED' ? 'badge bg-success' :
      statusUpper === 'REJECTED' ? 'badge bg-danger' :
      statusUpper === 'BLOCKED' ? 'badge bg-dark' :
      'badge bg-warning'

    return <span className={badgeClass}>{statusUpper}</span>
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <h5>Error loading pharmacy users</h5>
        <p className="text-muted">{error.message || 'Failed to load users'}</p>
        <button className="btn btn-primary" onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">{selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} Users</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="btn-group" role="group" aria-label="Pharmacy role">
                      <button
                        type="button"
                        className={`btn ${selectedRole === 'PHARMACY' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedRole('PHARMACY')}
                      >
                        Pharmacies
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedRole === 'PARAPHARMACY' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedRole('PARAPHARMACY')}
                      >
                        Parapharmacies
                      </button>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Search</label>
                    <input
                      className="form-control"
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">No users found</td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id}>
                            <td>{u.fullName || u.name || '—'}</td>
                            <td>{u.email || '—'}</td>
                            <td>{u.phone || '—'}</td>
                            <td>{getStatusBadge(u.status)}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleStatusChange(u)}
                                disabled={updateStatusMutation.isLoading}
                              >
                                Update Status
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(u)}
                                disabled={deleteUserMutation.isLoading}
                              >
                                Delete
                              </button>
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
      </div>

      {showStatusModal && selectedUser && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowStatusModal(false)
                setSelectedUser(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Update {selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} User Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedUser(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label"><strong>User:</strong></label>
                    <p className="mb-0">{selectedUser.fullName || selectedUser.name || '—'}</p>
                    <small className="text-muted">{selectedUser.email || ''}</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Current Status:</strong></label>
                    <div>{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Select New Status:</strong></label>
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={updateStatusMutation.isLoading}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedUser(null)
                    }}
                    disabled={updateStatusMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isLoading || !selectedStatus}
                  >
                    {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteModal && selectedUser && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={(e) => {
              if (e.target.classList.contains('modal')) {
                setShowDeleteModal(false)
                setSelectedUser(null)
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Delete {selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} User</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedUser(null)
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this user?</p>
                  <p className="mb-0"><strong>{selectedUser.fullName || selectedUser.name || '—'}</strong></p>
                  <small className="text-muted">{selectedUser.email || ''}</small>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedUser(null)
                    }}
                    disabled={deleteUserMutation.isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                    disabled={deleteUserMutation.isLoading}
                  >
                    {deleteUserMutation.isLoading ? 'Deleting...' : 'Delete'}
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

export default PharmacyUsers
