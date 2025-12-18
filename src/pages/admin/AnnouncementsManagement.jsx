import { useState } from 'react'
import { Link } from 'react-router-dom'

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'New Feature: Video Consultations Available',
      message: 'We are excited to announce that video consultations are now available for all doctors.',
      type: 'feature',
      priority: 'high',
      pinned: true,
      urgent: true,
      createdAt: '15 Nov 2024',
      createdBy: 'Admin User',
      status: 'published'
    },
    {
      id: 2,
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on November 20, 2024 from 2:00 AM to 4:00 AM EST.',
      type: 'maintenance',
      priority: 'medium',
      pinned: true,
      urgent: false,
      createdAt: '14 Nov 2024',
      createdBy: 'Admin User',
      status: 'published'
    },
    {
      id: 3,
      title: 'Payment Processing Update',
      message: 'Your payment for November has been processed successfully.',
      type: 'payment',
      priority: 'low',
      pinned: false,
      urgent: false,
      createdAt: '13 Nov 2024',
      createdBy: 'Admin User',
      status: 'published'
    },
    {
      id: 4,
      title: 'Holiday Schedule Reminder',
      message: 'Reminder: The platform will operate with limited support during the holiday season.',
      type: 'reminder',
      priority: 'low',
      pinned: false,
      urgent: false,
      createdAt: '12 Nov 2024',
      createdBy: 'Admin User',
      status: 'draft'
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'feature',
    priority: 'medium',
    pinned: false,
    urgent: false,
    status: 'published'
  })

  const handleCreate = () => {
    setEditingAnnouncement(null)
    setFormData({
      title: '',
      message: '',
      type: 'feature',
      priority: 'medium',
      pinned: false,
      urgent: false,
      status: 'published'
    })
    setShowModal(true)
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData(announcement)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (editingAnnouncement) {
      // Update existing
      setAnnouncements(announcements.map(a => 
        a.id === editingAnnouncement.id 
          ? { ...formData, id: editingAnnouncement.id, createdAt: editingAnnouncement.createdAt, createdBy: editingAnnouncement.createdBy }
          : a
      ))
    } else {
      // Create new
      const newAnnouncement = {
        ...formData,
        id: announcements.length + 1,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdBy: 'Admin User'
      }
      setAnnouncements([newAnnouncement, ...announcements])
    }
    setShowModal(false)
    setEditingAnnouncement(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id))
    }
  }

  const handleTogglePin = (id) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, pinned: !a.pinned } : a
    ))
  }

  const getTypeBadge = (type) => {
    const badges = {
      'feature': 'bg-primary-light',
      'maintenance': 'bg-warning-light',
      'payment': 'bg-success-light',
      'policy': 'bg-info-light',
      'reminder': 'bg-secondary-light'
    }
    return <span className={`badge ${badges[type] || 'bg-secondary-light'}`}>{type}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': 'bg-danger-light',
      'medium': 'bg-warning-light',
      'low': 'bg-success-light'
    }
    return <span className={`badge ${badges[priority] || 'bg-secondary-light'}`}>{priority}</span>
  }

  return (
    <>
      <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Announcements Management</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Announcements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="row mb-4">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">All Announcements ({announcements.length})</h5>
                  <button className="btn btn-primary" onClick={handleCreate}>
                    <i className="fe fe-plus me-2"></i>
                    Create Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Table */}
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="datatable table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Pinned</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements
                        .sort((a, b) => {
                          if (a.pinned && !b.pinned) return -1
                          if (!a.pinned && b.pinned) return 1
                          return new Date(b.createdAt) - new Date(a.createdAt)
                        })
                        .map((announcement) => (
                          <tr key={announcement.id}>
                            <td>
                              <div>
                                <strong>{announcement.title}</strong>
                                {announcement.urgent && (
                                  <span className="badge bg-danger ms-2">Urgent</span>
                                )}
                                {announcement.pinned && (
                                  <i className="fe fe-pin text-primary ms-2" title="Pinned"></i>
                                )}
                                <small className="d-block text-muted mt-1" style={{ maxWidth: '300px' }}>
                                  {announcement.message.substring(0, 80)}...
                                </small>
                              </div>
                            </td>
                            <td>{getTypeBadge(announcement.type)}</td>
                            <td>{getPriorityBadge(announcement.priority)}</td>
                            <td>
                              {announcement.status === 'published' ? (
                                <span className="badge bg-success-light">Published</span>
                              ) : (
                                <span className="badge bg-warning-light">Draft</span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`btn btn-sm ${announcement.pinned ? 'bg-primary-light' : 'bg-secondary-light'}`}
                                onClick={() => handleTogglePin(announcement.id)}
                                title={announcement.pinned ? 'Unpin' : 'Pin'}
                              >
                                <i className={`fe ${announcement.pinned ? 'fe-pin' : 'fe-pin-off'}`}></i>
                              </button>
                            </td>
                            <td>
                              <div>
                                <small>{announcement.createdAt}</small>
                                <small className="d-block text-muted">{announcement.createdBy}</small>
                              </div>
                            </td>
                            <td>
                              <div className="actions">
                                <button
                                  className="btn btn-sm bg-info-light me-2"
                                  onClick={() => handleEdit(announcement)}
                                  title="Edit"
                                >
                                  <i className="fe fe-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm bg-danger-light"
                                  onClick={() => handleDelete(announcement.id)}
                                  title="Delete"
                                >
                                  <i className="fe fe-trash-2"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAnnouncement(null)
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Enter announcement message"
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="feature">Feature</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="payment">Payment</option>
                        <option value="policy">Policy</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check mt-4">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="pinned"
                          checked={formData.pinned}
                          onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="pinned">
                          Pin Announcement
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="urgent"
                          checked={formData.urgent}
                          onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="urgent">
                          Mark as Urgent
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAnnouncement(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    <i className="fe fe-save me-2"></i>
                    {editingAnnouncement ? 'Update' : 'Create'} Announcement
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" onClick={() => {
              setShowModal(false)
              setEditingAnnouncement(null)
            }}></div>
          </div>
        )}
    </>
  )
}

export default AnnouncementsManagement

