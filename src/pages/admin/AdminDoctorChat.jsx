import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const AdminDoctorChat = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const messagesEndRef = useRef(null)

  const doctors = [
    {
      id: 1,
      name: 'Dr. Ruby Perrin',
      avatar: '/assets/img/doctors/doctor-thumb-01.jpg',
      lastMessage: 'Thank you for your help with the verification.',
      lastMessageTime: '10:30 AM',
      unread: 2,
      online: true,
      speciality: 'Dental'
    },
    {
      id: 2,
      name: 'Dr. Darren Elder',
      avatar: '/assets/img/doctors/doctor-thumb-02.jpg',
      lastMessage: 'I have a question about my subscription.',
      lastMessageTime: 'Yesterday',
      unread: 0,
      online: false,
      speciality: 'Cardiology'
    },
    {
      id: 3,
      name: 'Dr. Deborah Angel',
      avatar: '/assets/img/doctors/doctor-thumb-03.jpg',
      lastMessage: 'The payment was processed successfully.',
      lastMessageTime: '2 days ago',
      unread: 1,
      online: true,
      speciality: 'Cardiology'
    }
  ]

  const sampleMessages = [
    {
      id: 1,
      sender: 'doctor',
      message: 'Hello, I have a question about my subscription plan.',
      time: '10:00 AM',
      date: '15 Nov 2024'
    },
    {
      id: 2,
      sender: 'admin',
      message: 'Hello! How can we assist you today?',
      time: '10:05 AM',
      date: '15 Nov 2024'
    },
    {
      id: 3,
      sender: 'doctor',
      message: 'Can I upgrade my plan mid-month?',
      time: '10:06 AM',
      date: '15 Nov 2024'
    },
    {
      id: 4,
      sender: 'admin',
      message: 'Yes, you can upgrade at any time. The billing will be prorated.',
      time: '10:10 AM',
      date: '15 Nov 2024'
    },
    {
      id: 5,
      sender: 'doctor',
      message: 'Thank you for the clarification!',
      time: '10:15 AM',
      date: '15 Nov 2024'
    }
  ]

  useEffect(() => {
    if (selectedDoctor) {
      setMessages(sampleMessages)
      scrollToBottom()
    }
  }, [selectedDoctor])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'admin',
        message: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }
      setMessages([...messages, message])
      setNewMessage('')
      scrollToBottom()
    }
  }

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    // Mark as read
    // TODO: Update unread count via API
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
                      </div>
                      <div className="chat-sidebar-list">
                        {doctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className={`chat-sidebar-item p-3 border-bottom ${selectedDoctor?.id === doctor.id ? 'bg-light' : ''}`}
                            onClick={() => handleSelectDoctor(doctor)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm me-3 position-relative">
                                <img
                                  src={doctor.avatar}
                                  alt={doctor.name}
                                  className="rounded-circle"
                                />
                                {doctor.online && (
                                  <span className="status online"></span>
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{doctor.name}</h6>
                                <p className="text-muted small mb-0">{doctor.speciality}</p>
                                <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                                  {doctor.lastMessage}
                                </p>
                                <span className="text-muted small">{doctor.lastMessageTime}</span>
                              </div>
                              {doctor.unread > 0 && (
                                <span className="badge bg-danger">{doctor.unread}</span>
                              )}
                            </div>
                          </div>
                        ))}
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
                                  src={selectedDoctor.avatar}
                                  alt={selectedDoctor.name}
                                  className="rounded-circle"
                                />
                                {selectedDoctor.online && (
                                  <span className="status online"></span>
                                )}
                              </div>
                              <div>
                                <h6 className="mb-0">{selectedDoctor.name}</h6>
                                <span className="text-muted small">
                                  {selectedDoctor.speciality} • {selectedDoctor.online ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </div>
                            <Link to={`/doctor-list`} className="btn btn-sm btn-outline-primary">
                              View Profile
                            </Link>
                          </div>
                        </div>

                        <div className="chat-messages p-3" style={{ height: '500px', overflowY: 'auto' }}>
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`message-item mb-3 ${msg.sender === 'admin' ? 'message-sent' : 'message-received'}`}
                            >
                              <div className={`message-bubble ${msg.sender === 'admin' ? 'bg-primary text-white' : 'bg-light'}`}>
                                <p className="mb-0">{msg.message}</p>
                                <span className={`message-time small ${msg.sender === 'admin' ? 'text-white-50' : 'text-muted'}`}>
                                  {msg.time}
                                </span>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input p-3 border-top">
                          <form onSubmit={handleSendMessage}>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                              />
                              <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={!newMessage.trim()}
                              >
                                <i className="fe fe-send"></i>
                              </button>
                            </div>
                          </form>
                        </div>
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

