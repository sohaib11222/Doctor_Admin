import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { useUsers } from '../../queries/adminQueries'
import { useApprovePharmacy } from '../../mutations/authMutations'

const PharmacyVerificationApproval = () => {
  const [selectedRole, setSelectedRole] = useState('PHARMACY')
  const [searchTerm, setSearchTerm] = useState('')

  const queryParams = useMemo(() => {
    const params = { role: selectedRole, status: 'PENDING' }
    if (searchTerm) params.search = searchTerm
    return params
  }, [selectedRole, searchTerm])

  const { data: usersResponse, isLoading, error, refetch } = useUsers(queryParams)

  const users = useMemo(() => {
    if (!usersResponse) return []
    const responseData = usersResponse.data || usersResponse
    return Array.isArray(responseData) ? responseData : (responseData.users || [])
  }, [usersResponse])

  const approveMutation = useApprovePharmacy()

  const normalizeUrl = (url) => {
    if (!url) return null
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/?api\/?$/, '')
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (!base) return url
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const getDocLinks = (user) => {
    const uploads = Array.isArray(user.documentUploads) ? user.documentUploads : []
    const byType = (type) => uploads.filter((d) => String(d.type || '').toUpperCase() === type)

    return {
      license: byType('PHARMACY_LICENSE'),
      degree: byType('PHARMACY_DEGREE'),
    }
  }

  const handleApprove = async (user) => {
    try {
      const userId = user._id
      await approveMutation.mutateAsync({ pharmacyUserId: String(userId) })
      toast.success(`${selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} approved successfully!`)
      refetch()
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to approve ${selectedRole === 'PARAPHARMACY' ? 'parapharmacy' : 'pharmacy'}`
      )
    }
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
        <h5>Error loading pharmacy verification requests</h5>
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
                <h5 className="card-title mb-0">{selectedRole === 'PARAPHARMACY' ? 'Parapharmacy' : 'Pharmacy'} Verification Approval</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="btn-group" role="group" aria-label="Verification role">
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
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Documents</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">No pending verifications</td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const docs = getDocLinks(u)
                          const hasDocs = docs.license.length > 0 && docs.degree.length > 0

                          return (
                            <tr key={u._id}>
                              <td>{u.fullName || u.name || '—'}</td>
                              <td>{u.email || '—'}</td>
                              <td>{u.phone || '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  <span className={`badge ${docs.license.length ? 'bg-success' : 'bg-warning'}`}>License</span>
                                  <span className={`badge ${docs.degree.length ? 'bg-success' : 'bg-warning'}`}>Degree</span>
                                </div>
                                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  {docs.license.map((d, idx) => (
                                    <a key={`lic-${idx}`} className="btn btn-sm btn-outline-primary" href={normalizeUrl(d.fileUrl)} target="_blank" rel="noreferrer">
                                      View License {idx + 1}
                                    </a>
                                  ))}
                                  {docs.degree.map((d, idx) => (
                                    <a key={`deg-${idx}`} className="btn btn-sm btn-outline-primary" href={normalizeUrl(d.fileUrl)} target="_blank" rel="noreferrer">
                                      View Degree {idx + 1}
                                    </a>
                                  ))}
                                </div>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-success"
                                  disabled={!hasDocs || approveMutation.isLoading}
                                  onClick={() => handleApprove(u)}
                                >
                                  {approveMutation.isLoading ? 'Approving...' : 'Approve'}
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-muted" style={{ fontSize: 12 }}>
                  Approval requires both document types: PHARMACY_LICENSE and PHARMACY_DEGREE.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacyVerificationApproval
