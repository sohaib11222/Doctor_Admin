import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { useUpdateAdminProfile } from '../../mutations/adminMutations'
import { useChangePassword } from '../../mutations/authMutations'
import { get } from '../../utils/api'
import { ADMIN_ROUTES } from '../../utils/apiConfig'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const Profile = () => {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState('about')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Fetch admin profile
  const { data: profileResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-profile', authUser?._id],
    queryFn: async () => {
      if (!authUser?._id) return null
      const response = await get(ADMIN_ROUTES.USER_BY_ID(authUser._id))
      return response
    },
    enabled: !!authUser?._id,
  })

  const profile = useMemo(() => {
    if (!profileResponse) return null
    const responseData = profileResponse.data || profileResponse
    return responseData.data || responseData.user || responseData
  }, [profileResponse])

  // Profile update form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      zip: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        bloodGroup: profile.bloodGroup || '',
        address: {
          line1: profile.address?.line1 || '',
          line2: profile.address?.line2 || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          country: profile.address?.country || '',
          zip: profile.address?.zip || ''
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          phone: profile.emergencyContact?.phone || '',
          relation: profile.emergencyContact?.relation || ''
        }
      })
      setImagePreview(profile.profileImage || '/assets_admin/img/profiles/avatar-01.jpg')
    }
  }, [profile])

  const updateProfileMutation = useUpdateAdminProfile()
  const changePasswordMutation = useChangePassword()

  // Handle profile image upload
  const handleImageUpload = async (file) => {
    if (!file) return null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Response is already unwrapped by interceptor
      const responseData = response?.data || response
      return responseData?.url || responseData?.data?.url || null
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      let profileImageUrl = profileForm.profileImage || profile?.profileImage

      // Upload image if new one is selected
      if (profileImage) {
        const uploadedUrl = await handleImageUpload(profileImage)
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl
        }
      }

      const updateData = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || undefined,
        gender: profileForm.gender || undefined,
        dob: profileForm.dob || undefined,
        bloodGroup: profileForm.bloodGroup || undefined,
        profileImage: profileImageUrl || undefined,
        address: {
          line1: profileForm.address.line1.trim() || undefined,
          line2: profileForm.address.line2.trim() || undefined,
          city: profileForm.address.city.trim() || undefined,
          state: profileForm.address.state.trim() || undefined,
          country: profileForm.address.country.trim() || undefined,
          zip: profileForm.address.zip.trim() || undefined
        },
        emergencyContact: {
          name: profileForm.emergencyContact.name.trim() || undefined,
          phone: profileForm.emergencyContact.phone.trim() || undefined,
          relation: profileForm.emergencyContact.relation.trim() || undefined
        }
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      if (updateData.address) {
        Object.keys(updateData.address).forEach(key => {
          if (updateData.address[key] === undefined) {
            delete updateData.address[key]
          }
        })
        if (Object.keys(updateData.address).length === 0) {
          delete updateData.address
        }
      }

      if (updateData.emergencyContact) {
        Object.keys(updateData.emergencyContact).forEach(key => {
          if (updateData.emergencyContact[key] === undefined) {
            delete updateData.emergencyContact[key]
          }
        })
        if (Object.keys(updateData.emergencyContact).length === 0) {
          delete updateData.emergencyContact
        }
      }

      await updateProfileMutation.mutateAsync(updateData)
      toast.success('Profile updated successfully')
      setShowEditModal(false)
      setProfileImage(null)
      refetch()
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile')
    }
  }

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to change password')
    }
  }

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'N/A'
    const parts = []
    if (address.line1) parts.push(address.line1)
    if (address.line2) parts.push(address.line2)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zip) parts.push(address.zip)
    if (address.country) parts.push(address.country)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  if (isLoading) {
    return (
      <div className="page-header">
        <div className="row">
          <div className="col">
            <h3 className="page-title">Profile</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active">Profile</li>
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col">
            <h3 className="page-title">Profile</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active">Profile</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="profile-header">
            <div className="row align-items-center">
              <div className="col-auto profile-image">
                <a href="javascript:;">
                  <img 
                    className="rounded-circle" 
                    alt="User Image" 
                    src={imagePreview || profile?.profileImage || '/assets_admin/img/profiles/avatar-01.jpg'}
                    onError={(e) => {
                      e.target.src = '/assets_admin/img/profiles/avatar-01.jpg'
                    }}
                  />
                </a>
              </div>
              <div className="col ml-md-n2 profile-user-info">
                <h4 className="user-name mb-0">{profile?.fullName || 'Admin User'}</h4>
                <h6 className="text-muted">{profile?.email || 'admin@example.com'}</h6>
                <div className="user-Location">
                  <i className="fa-solid fa-location-dot"></i> {formatAddress(profile?.address)}
                </div>
                <div className="about-text">
                  {profile?.role === 'ADMIN' ? 'System Administrator' : 'User'}
                </div>
              </div>
              <div className="col-auto profile-btn">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
          <div className="profile-menu">
            <ul className="nav nav-tabs nav-tabs-solid">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  Password
                </button>
              </li>
            </ul>
          </div>
          <div className="tab-content profile-tab-cont">
            {activeTab === 'about' && (
              <div className="tab-pane fade show active" id="per_details_tab">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title d-flex justify-content-between">
                          <span>Personal Details</span>
                          <button
                            className="btn btn-link p-0"
                            onClick={() => setShowEditModal(true)}
                          >
                            <i className="fa fa-edit me-1"></i>Edit
                          </button>
                        </h5>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Name</p>
                          <p className="col-sm-10">{profile?.fullName || '—'}</p>
                        </div>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Date of Birth</p>
                          <p className="col-sm-10">{formatDate(profile?.dob)}</p>
                        </div>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Email ID</p>
                          <p className="col-sm-10">{profile?.email || '—'}</p>
                        </div>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Mobile</p>
                          <p className="col-sm-10">{profile?.phone || '—'}</p>
                        </div>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Gender</p>
                          <p className="col-sm-10">{profile?.gender || '—'}</p>
                        </div>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Blood Group</p>
                          <p className="col-sm-10">{profile?.bloodGroup || '—'}</p>
                        </div>
                        <div className="row">
                          <p className="col-sm-2 text-muted text-sm-right mb-0">Address</p>
                          <p className="col-sm-10 mb-0">
                            {formatAddress(profile?.address)}
                          </p>
                        </div>
                        {profile?.emergencyContact?.name && (
                          <>
                            <div className="row mt-3">
                              <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Emergency Contact</p>
                              <p className="col-sm-10">{profile.emergencyContact.name}</p>
                            </div>
                            <div className="row">
                              <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Emergency Phone</p>
                              <p className="col-sm-10">{profile.emergencyContact.phone || '—'}</p>
                            </div>
                            <div className="row">
                              <p className="col-sm-2 text-muted text-sm-right mb-0 mb-sm-3">Relation</p>
                              <p className="col-sm-10">{profile.emergencyContact.relation || '—'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="tab-pane fade show active" id="password_tab">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Change Password</h5>
                    <div className="row">
                      <div className="col-md-10 col-lg-6">
                        <form onSubmit={handleChangePassword}>
                          <div className="mb-3">
                            <label className="mb-2">Old Password</label>
                            <input
                              type="password"
                              className="form-control"
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="mb-2">New Password</label>
                            <input
                              type="password"
                              className="form-control"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              required
                              minLength={6}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="mb-2">Confirm Password</label>
                            <input
                              type="password"
                              className="form-control"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              required
                              minLength={6}
                            />
                          </div>
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={changePasswordMutation.isLoading}
                          >
                            {changePasswordMutation.isLoading ? 'Changing...' : 'Save Changes'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowEditModal(false)}
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1050 }}
            onClick={() => setShowEditModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Personal Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="mb-2">Profile Image</label>
                        <div className="d-flex align-items-center">
                          <img
                            src={imagePreview || '/assets_admin/img/profiles/avatar-01.jpg'}
                            alt="Profile"
                            className="rounded-circle me-3"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          />
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Full Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={profileForm.email}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Phone</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Gender</label>
                          <select
                            className="form-control"
                            value={profileForm.gender}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Date of Birth</label>
                          <input
                            type="date"
                            className="form-control"
                            value={profileForm.dob}
                            onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Blood Group</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.bloodGroup}
                            onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <h5 className="form-title">
                          <span>Address</span>
                        </h5>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Address Line 1</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.address.line1}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, line1: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="mb-2">Address Line 2</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.address.line2}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, line2: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">City</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.address.city}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, city: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">State</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.address.state}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, state: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Zip Code</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.address.zip}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, zip: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.address.country}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, country: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <h5 className="form-title">
                          <span>Emergency Contact</span>
                        </h5>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.emergencyContact.name}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, name: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Phone</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.emergencyContact.phone}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, phone: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label className="mb-2">Relation</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.emergencyContact.relation}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, relation: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowEditModal(false)
                          setProfileImage(null)
                          setImagePreview(profile?.profileImage || '/assets_admin/img/profiles/avatar-01.jpg')
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateProfileMutation.isLoading}
                      >
                        {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Profile
