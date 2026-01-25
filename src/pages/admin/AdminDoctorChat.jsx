import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDoctorsForChat } from '../../queries/adminQueries'
import { useChatMessages } from '../../queries/adminQueries'
import { useStartConversation, useSendMessage, useMarkMessagesAsRead } from '../../mutations/adminMutations'
import { useAuth } from '../../contexts/AuthContext'
import { useUploadChatFile } from '../../mutations/uploadMutations'

const AdminDoctorChat = () => {
  const { user } = useAuth()
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch doctors for chat
  const queryParams = useMemo(() => {
    const params = {}
    if (searchFilter) params.search = searchFilter
    return params
  }, [searchFilter])

  const { data: doctorsResponse, isLoading: doctorsLoading, refetch: refetchDoctors } = useDoctorsForChat(queryParams)

  // Fetch messages for selected conversation
  const { data: messagesResponse, isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(
    conversationId,
    { enabled: !!conversationId, refetchInterval: 3000 } // Poll every 3 seconds
  )

  // Mutations
  const startConversationMutation = useStartConversation()
  const sendMessageMutation = useSendMessage()
  const markAsReadMutation = useMarkMessagesAsRead()
  const uploadChatFileMutation = useUploadChatFile()

  // Extract doctors data
  const doctors = useMemo(() => {
    if (!doctorsResponse) return []
    const responseData = doctorsResponse.data || doctorsResponse
    return Array.isArray(responseData) ? responseData : (responseData.doctors || [])
  }, [doctorsResponse])

  // Extract messages data
  const messages = useMemo(() => {
    if (!messagesResponse || !conversationId) return []
    const responseData = messagesResponse.data || messagesResponse
    return Array.isArray(responseData) ? responseData : (responseData.messages || [])
  }, [messagesResponse, conversationId])

  // Get admin ID from user
  const adminId = user?._id || user?.id

  // Validate admin user
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Only admins can access this page')
    }
  }, [user])

  // Handle doctor selection
  const handleSelectDoctor = async (doctor) => {
    if (!adminId) {
      toast.error('Admin user not found')
      return
    }

    setSelectedDoctor(doctor)
    setNewMessage('')

    try {
      // Get or create conversation
      // adminId is automatically set from token in backend, but we can also send it explicitly
      const conversationData = await startConversationMutation.mutateAsync({
        doctorId: doctor._id,
        ...(adminId && { adminId }) // Include adminId if available
      })

      const conversation = conversationData?.data || conversationData
      if (conversation?._id) {
        setConversationId(conversation._id)
        // Mark messages as read when opening conversation
        if (conversation._id) {
          try {
            await markAsReadMutation.mutateAsync(conversation._id)
          } catch (error) {
            console.error('Error marking messages as read:', error)
          }
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start conversation'
      toast.error(errorMessage)
      console.error('Error starting conversation:', error)
    }
  }

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file sizes (50MB max)
    const maxSize = 50 * 1024 * 1024
    const oversizedFiles = files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      toast.error(`Some files are too large. Maximum size is 50MB.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setUploadingFiles(true)
    const uploadedAttachments = []

    try {
      // Upload files in parallel for better performance
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        try {
          const uploadResponse = await uploadChatFileMutation.mutateAsync(formData)
          const fileUrl = uploadResponse.data?.url || uploadResponse.url
          
          if (fileUrl) {
            // Determine file type
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension)
            
            return {
              type: isImage ? 'image' : 'file',
              url: fileUrl,
              name: file.name,
              size: file.size
            }
          }
          return null
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError)
          const errorMessage = uploadError.response?.data?.message || uploadError.message || 'Upload failed'
          toast.error(`Failed to upload ${file.name}: ${errorMessage}`)
          return null
        }
      })

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result !== null)
      
      if (successfulUploads.length === 0) {
        toast.error('No files were uploaded successfully')
        return
      }

      // Prepare message data - ensure we don't send null/empty message when we have attachments
      const messageText = newMessage.trim()
      const messageData = {
        doctorId: selectedDoctor._id,
        attachments: successfulUploads,
        ...(adminId && { adminId })
      }
      
      // Only include message if it's not empty (backend validator requires either message or attachments)
      if (messageText) {
        messageData.message = messageText
      }

      // Send message with attachments
      await sendMessageMutation.mutateAsync(messageData)
      setSelectedFiles([])
      setNewMessage('')
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } catch (error) {
      console.error('Error handling files:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message with attachments'
      toast.error(errorMessage)
    } finally {
      setUploadingFiles(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedDoctor || !conversationId || !adminId) {
      toast.error('Please enter a message or select a file')
      return
    }

    // If files are selected, upload them first
    if (selectedFiles.length > 0) {
      handleFileSelect({ target: { files: selectedFiles } })
    } else {
      try {
        const messageText = newMessage.trim()
        if (!messageText) {
          toast.error('Please enter a message')
          return
        }

        await sendMessageMutation.mutateAsync({
          doctorId: selectedDoctor._id,
          message: messageText,
          ...(adminId && { adminId }) // Include adminId if available (backend also sets it from token)
        })

        setNewMessage('')
        // Messages will be refetched automatically
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to send message'
        toast.error(errorMessage)
        console.error('Error sending message:', error)
      }
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && adminId) {
      markAsReadMutation.mutate(conversationId, {
        onSuccess: () => {
          // Refetch doctors to update unread counts
          refetchDoctors()
        },
        onError: (error) => {
          console.error('Error marking messages as read:', error)
        }
      })
    }
  }, [conversationId, adminId, refetchDoctors])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Get doctor name
  const getDoctorName = (doctor) => {
    if (!doctor) return 'Unknown Doctor'
    return doctor.fullName || doctor.email || 'Unknown Doctor'
  }

  // Get doctor specialization
  const getDoctorSpecialization = (doctor) => {
    if (!doctor) return 'N/A'
    if (doctor.doctorProfile?.specialization) {
      const spec = doctor.doctorProfile.specialization
      return typeof spec === 'object' ? spec.name : spec
    }
    return '—'
  }

  // Get doctor avatar
  const getDoctorAvatar = (doctor) => {
    if (!doctor) return '/assets/img/doctors/doctor-thumb-01.jpg'
    return doctor.profileImage || doctor.doctorProfile?.profileImage || '/assets/img/doctors/doctor-thumb-01.jpg'
  }

  // Get last message preview and time from conversation if available
  // Note: getDoctorsForChat doesn't return last message, so we'll fetch conversations separately if needed
  const getLastMessagePreview = (doctor) => {
    // Could be enhanced by fetching conversations and matching by doctorId
    return ''
  }

  // Get last message time
  const getLastMessageTime = (doctor) => {
    // Could be enhanced by fetching conversations and matching by doctorId
    return ''
  }

  // Check if message is from admin (not doctor)
  const isAdminMessage = (message) => {
    if (!message || !adminId || !selectedDoctor) return false
    
    // Handle both populated (object) and non-populated (ID) senderId
    let senderId = message.senderId
    if (senderId && typeof senderId === 'object' && senderId._id) {
      senderId = senderId._id
    }
    
    // Convert all IDs to strings for reliable comparison
    const senderIdStr = String(senderId || '')
    const adminIdStr = String(adminId || '')
    const doctorIdStr = String(selectedDoctor._id || selectedDoctor.id || '')
    
    // Debug logging (can be removed later)
    // console.log('Message check:', { senderIdStr, adminIdStr, doctorIdStr, isAdmin: senderIdStr === adminIdStr })
    
    // Message is from admin if senderId matches adminId
    // Message is from doctor if senderId matches doctorId
    return senderIdStr === adminIdStr
  }

  return (
    <>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Doctor Messages</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Doctor Chat</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="row g-0">
                {/* Doctor List Sidebar */}
                <div className="col-md-4 border-end">
                  <div className="chat-sidebar">
                    <div className="chat-sidebar-header p-3 border-bottom">
                      <h6 className="mb-0">Doctors</h6>
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search doctors..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="chat-sidebar-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {doctorsLoading ? (
                        <div className="text-center p-4">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0 small text-muted">Loading doctors...</p>
                        </div>
                      ) : doctors.length === 0 ? (
                        <div className="text-center p-4">
                          <p className="text-muted">No doctors found</p>
                        </div>
                      ) : (
                        doctors.map((doctor) => (
                          <div
                            key={doctor._id}
                            className={`chat-sidebar-item p-3 border-bottom ${
                              selectedDoctor?._id === doctor._id ? 'bg-light' : ''
                            }`}
                            onClick={() => handleSelectDoctor(doctor)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm me-3 position-relative">
                                <img
                                  src={getDoctorAvatar(doctor)}
                                  alt={getDoctorName(doctor)}
                                  className="rounded-circle"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = '/assets/img/doctors/doctor-thumb-01.jpg'
                                  }}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{getDoctorName(doctor)}</h6>
                                <p className="text-muted small mb-0">{getDoctorSpecialization(doctor)}</p>
                                {getLastMessagePreview(doctor) && (
                                  <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                                    {getLastMessagePreview(doctor)}
                                  </p>
                                )}
                                {getLastMessageTime(doctor) && (
                                  <span className="text-muted small">{getLastMessageTime(doctor)}</span>
                                )}
                              </div>
                              {doctor.unreadMessageCount > 0 && (
                                <span className="badge bg-danger">{doctor.unreadMessageCount}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="col-md-8">
                  {selectedDoctor ? (
                    <>
                      <div className="chat-header p-3 border-bottom">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-3 position-relative">
                              <img
                                src={getDoctorAvatar(selectedDoctor)}
                                alt={getDoctorName(selectedDoctor)}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/assets/img/doctors/doctor-thumb-01.jpg'
                                }}
                              />
                            </div>
                            <div>
                              <h6 className="mb-0">{getDoctorName(selectedDoctor)}</h6>
                              <span className="text-muted small">
                                {getDoctorSpecialization(selectedDoctor)}
                              </span>
                            </div>
                          </div>
                          <Link to={`/doctor-list`} className="btn btn-sm btn-outline-primary">
                            View Profile
                          </Link>
                        </div>
                      </div>

                      <div
                        className="chat-messages p-3"
                        ref={messagesContainerRef}
                        style={{ height: '500px', overflowY: 'auto' }}
                      >
                        {messagesLoading ? (
                          <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 mb-0 small text-muted">Loading messages...</p>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-muted">No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          <>
                            {messages.map((msg, idx) => {
                              // Check if message is from admin
                              const isAdminMsg = isAdminMessage(msg)
                              
                              // Debug: log first message to verify
                              if (idx === 0) {
                                console.log('First message debug:', {
                                  senderId: msg.senderId,
                                  senderIdType: typeof msg.senderId,
                                  senderId_id: msg.senderId?._id,
                                  adminId,
                                  selectedDoctorId: selectedDoctor._id,
                                  isAdminMsg
                                })
                              }
                              
                              const showDate = idx === 0 || 
                                (messages[idx - 1] && 
                                 formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt))

                              return (
                                <div key={msg._id || idx}>
                                  {showDate && (
                                    <div className="text-center my-2">
                                      <span className="badge bg-light text-muted">
                                        {formatDate(msg.createdAt)}
                                      </span>
                                    </div>
                                  )}
                                  <div
                                    className={`message-item mb-3 d-flex ${
                                      isAdminMsg ? 'justify-content-end' : 'justify-content-start'
                                    }`}
                                    style={{
                                      // Force alignment
                                      justifyContent: isAdminMsg ? 'flex-end' : 'flex-start'
                                    }}
                                  >
                                    <div
                                      className={`message-bubble ${
                                        isAdminMsg
                                          ? 'bg-primary text-white'
                                          : 'bg-light border'
                                      }`}
                                      style={{
                                        maxWidth: '70%',
                                        padding: '10px 15px',
                                        borderRadius: '18px',
                                        wordWrap: 'break-word'
                                      }}
                                    >
                                      {msg.message && (
                                        <p className="mb-1" style={{ marginBottom: msg.attachments?.length > 0 ? '12px' : '0' }}>
                                          {msg.message}
                                        </p>
                                      )}
                                      
                                      {/* Display attachments */}
                                      {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="chat-attachments" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: msg.message ? '8px' : '0' }}>
                                          {msg.attachments.map((attachment, attIndex) => {
                                            const fileUrl = attachment.url?.startsWith('http') 
                                              ? attachment.url 
                                              : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://mydoctoradmin.mydoctorplus.it'}${attachment.url}`
                                            const isImage = attachment.type === 'image' || 
                                                           ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(
                                                             attachment.url?.split('.').pop()?.toLowerCase() || ''
                                                           )
                                            
                                            return (
                                              <div key={attIndex} className="chat-attachment-item" style={{ 
                                                maxWidth: '100%',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                backgroundColor: isAdminMsg ? 'rgba(255, 255, 255, 0.1)' : '#fff'
                                              }}>
                                                {isImage ? (
                                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                                    <img 
                                                      src={fileUrl} 
                                                      alt={attachment.name || 'Attachment'} 
                                                      style={{ 
                                                        maxWidth: '100%', 
                                                        maxHeight: '300px', 
                                                        objectFit: 'contain',
                                                        display: 'block'
                                                      }}
                                                      onError={(e) => {
                                                        e.target.style.display = 'none'
                                                        e.target.nextSibling.style.display = 'flex'
                                                      }}
                                                    />
                                                    <div style={{ display: 'none', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', gap: '8px' }}>
                                                      <i className="fe fe-image" style={{ fontSize: '20px', color: isAdminMsg ? 'rgba(255, 255, 255, 0.8)' : '#999' }}></i>
                                                      <span style={{ fontSize: '12px', color: isAdminMsg ? 'rgba(255, 255, 255, 0.8)' : '#666' }}>Image preview unavailable</span>
                                                    </div>
                                                  </a>
                                                ) : (
                                                  <a 
                                                    href={fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ 
                                                      display: 'flex', 
                                                      alignItems: 'center', 
                                                      gap: '12px', 
                                                      padding: '12px',
                                                      backgroundColor: isAdminMsg ? 'rgba(255, 255, 255, 0.1)' : '#f5f5f5',
                                                      textDecoration: 'none',
                                                      color: isAdminMsg ? '#ffffff' : '#333'
                                                    }}
                                                  >
                                                    <i className="fe fe-file" style={{ fontSize: '24px', color: isAdminMsg ? '#ffffff' : '#2196F3' }}></i>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                      <div style={{ fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isAdminMsg ? '#ffffff' : '#333' }}>
                                                        {attachment.name || 'File'}
                                                      </div>
                                                      {attachment.size && (
                                                        <div style={{ fontSize: '12px', color: isAdminMsg ? 'rgba(255, 255, 255, 0.8)' : '#999', marginTop: '2px' }}>
                                                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                      )}
                                                    </div>
                                                    <i className="fe fe-download" style={{ color: isAdminMsg ? '#ffffff' : '#2196F3' }}></i>
                                                  </a>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      <span
                                        className={`message-time small d-block ${
                                          isAdminMsg ? 'text-white-50' : 'text-muted'
                                        }`}
                                        style={{ fontSize: '11px' }}
                                      >
                                        {formatTime(msg.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>

                      <form className="chat-input-area" onSubmit={handleSendMessage} style={{
                        padding: '15px',
                        borderTop: '1px solid #e5e5e5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0,
                        background: '#fff',
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 10
                      }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          style={{ display: 'none' }}
                          onChange={handleFileSelect}
                          accept="*/*"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="chat-attach-button"
                          style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '50%',
                            color: '#666',
                            cursor: (uploadingFiles || !conversationId) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                            opacity: (uploadingFiles || !conversationId) ? 0.5 : 1,
                            transition: 'color 0.2s ease',
                            padding: 0
                          }}
                          onMouseEnter={(e) => {
                            if (!uploadingFiles && conversationId) {
                              e.target.style.color = '#2196F3'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!uploadingFiles && conversationId) {
                              e.target.style.color = '#666'
                            }
                          }}
                          title="Attach file"
                          disabled={uploadingFiles || !conversationId}
                        >
                          <i className="fa-solid fa-paperclip" style={{ display: 'block', fontSize: '20px', lineHeight: '1' }}></i>
                        </button>
                        <input
                          type="text"
                          className="chat-input-field"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sendMessageMutation.isLoading || uploadingFiles || !conversationId}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            border: '1px solid #e5e5e5',
                            borderRadius: '24px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          className="chat-send-button"
                          disabled={(!newMessage.trim() && selectedFiles.length === 0) || sendMessageMutation.isLoading || uploadingFiles || !conversationId}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            background: (!newMessage.trim() && selectedFiles.length === 0) || sendMessageMutation.isLoading || uploadingFiles || !conversationId ? '#ccc' : '#2196F3',
                            borderRadius: '50%',
                            color: '#fff',
                            cursor: (!newMessage.trim() && selectedFiles.length === 0) || sendMessageMutation.isLoading || uploadingFiles || !conversationId ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!e.target.disabled) {
                              e.target.style.background = '#1976D2'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!e.target.disabled) {
                              e.target.style.background = '#2196F3'
                            }
                          }}
                          title="Send"
                        >
                          {uploadingFiles ? (
                            <span className="spinner-border spinner-border-sm" role="status" style={{ width: '16px', height: '16px', borderWidth: '2px' }}>
                              <span className="visually-hidden">Uploading...</span>
                            </span>
                          ) : sendMessageMutation.isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" style={{ width: '16px', height: '16px', borderWidth: '2px' }}>
                              <span className="visually-hidden">Sending...</span>
                            </span>
                          ) : (
                            <i className="fa-solid fa-paper-plane" style={{ fontSize: '16px', display: 'block', lineHeight: '1' }}></i>
                          )}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="chat-placeholder d-flex align-items-center justify-content-center" style={{ height: '600px' }}>
                      <div className="text-center">
                        <i className="fe fe-message-circle" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                        <h5 className="mt-3">Select a doctor</h5>
                        <p className="text-muted">Choose a doctor from the list to start a conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDoctorChat
