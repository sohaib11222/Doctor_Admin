import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdminDashboard, useAdminDoctors, useAdminPatients, useAdminAppointments } from '../../queries/adminQueries'

const AdminDashboard = () => {
  // Fetch dashboard statistics
  const { data: dashboardResponse, isLoading } = useAdminDashboard()

  // Fetch recent doctors (limit 5)
  const { data: doctorsResponse } = useAdminDoctors({ limit: 5, status: 'APPROVED' })

  // Fetch recent patients (limit 5)
  const { data: patientsResponse } = useAdminPatients({ limit: 5 })

  // Fetch recent appointments (limit 10)
  const { data: appointmentsResponse } = useAdminAppointments({ limit: 10 })

  // Extract dashboard stats
  const stats = dashboardResponse?.data || dashboardResponse || {}

  // Extract doctors data
  const doctors = useMemo(() => {
    if (!doctorsResponse) return []
    const responseData = doctorsResponse.data || doctorsResponse
    return Array.isArray(responseData) ? responseData : (responseData.doctors || responseData.users || [])
  }, [doctorsResponse])

  // Extract patients data
  const patients = useMemo(() => {
    if (!patientsResponse) return []
    const responseData = patientsResponse.data || patientsResponse
    return Array.isArray(responseData) ? responseData : (responseData.patients || responseData.users || [])
  }, [patientsResponse])

  // Extract appointments data
  const appointments = useMemo(() => {
    if (!appointmentsResponse) return []
    const responseData = appointmentsResponse.data || appointmentsResponse
    return Array.isArray(responseData) ? responseData : (responseData.appointments || [])
  }, [appointmentsResponse])

  // Calculate patient last visit and total paid from appointments
  const patientsWithData = useMemo(() => {
    return patients.map(patient => {
      const patientId = patient._id || patient.id
      // Find patient's appointments
      const patientAppointments = appointments.filter(apt => {
        const aptPatientId = apt.patientId?._id || apt.patientId || apt.patientId
        return String(aptPatientId) === String(patientId)
      })
      
      // Get last visit (most recent completed appointment)
      const completedAppointments = patientAppointments
        .filter(apt => apt.status === 'COMPLETED')
        .sort((a, b) => new Date(b.appointmentDate || b.createdAt) - new Date(a.appointmentDate || a.createdAt))
      
      const lastVisit = completedAppointments.length > 0 
        ? new Date(completedAppointments[0].appointmentDate || completedAppointments[0].createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'N/A'

      // Calculate total paid from transactions (if available in appointments)
      // For now, we'll use appointment amounts
      const totalPaid = patientAppointments
        .filter(apt => apt.status === 'COMPLETED' || apt.status === 'CONFIRMED')
        .reduce((sum, apt) => sum + (apt.amount || apt.fees || 0), 0)

      return {
        ...patient,
        lastVisit,
        totalPaid
      }
    })
  }, [patients, appointments])
  useEffect(() => {
    // Initialize Morris charts if available
    if (window.Morris) {
      // Revenue Chart
      if (document.getElementById('morrisArea')) {
        window.Morris.Area({
          element: 'morrisArea',
          data: [
            { y: '2010', a: 50, b: 90 },
            { y: '2011', a: 75, b: 65 },
            { y: '2012', a: 50, b: 40 },
            { y: '2013', a: 75, b: 65 },
            { y: '2014', a: 50, b: 40 },
            { y: '2015', a: 75, b: 65 },
            { y: '2016', a: 100, b: 50 }
          ],
          xkey: 'y',
          ykeys: ['a', 'b'],
          labels: ['Series A', 'Series B'],
          lineColors: ['#ff5b5b', '#ffc107'],
          resize: true
        })
      }

      // Status Chart
      if (document.getElementById('morrisLine')) {
        window.Morris.Line({
          element: 'morrisLine',
          data: [
            { y: '2010', a: 50, b: 90 },
            { y: '2011', a: 75, b: 65 },
            { y: '2012', a: 50, b: 40 },
            { y: '2013', a: 75, b: 65 },
            { y: '2014', a: 50, b: 40 },
            { y: '2015', a: 75, b: 65 },
            { y: '2016', a: 100, b: 50 }
          ],
          xkey: 'y',
          ykeys: ['a', 'b'],
          labels: ['Series A', 'Series B'],
          lineColors: ['#ff5b5b', '#ffc107'],
          resize: true
        })
      }
    }
  }, [])

  // Helper functions
  const getDoctorName = (doctor) => {
    if (!doctor) return 'Unknown Doctor'
    return doctor.fullName || doctor.email || 'Unknown Doctor'
  }

  const getDoctorSpecialization = (doctor) => {
    if (!doctor) return 'N/A'
    if (doctor.doctorProfile?.specialization) {
      const spec = doctor.doctorProfile.specialization
      return typeof spec === 'object' ? spec.name : spec
    }
    return 'N/A'
  }

  const getDoctorAvatar = (doctor) => {
    if (!doctor) return '/assets_admin/img/doctors/doctor-thumb-01.jpg'
    return doctor.profileImage || doctor.doctorProfile?.profileImage || '/assets_admin/img/doctors/doctor-thumb-01.jpg'
  }

  const getDoctorRating = (doctor) => {
    if (!doctor) return 0
    if (doctor.doctorProfile?.ratingAvg) {
      return Math.round(doctor.doctorProfile.ratingAvg * 10) / 10
    }
    return 0
  }

  const getDoctorEarnings = (doctor) => {
    // This would need to be calculated from transactions
    // For now, return 0 or a placeholder
    return '$0.00'
  }

  const getPatientName = (patient) => {
    if (!patient) return 'Unknown Patient'
    return patient.fullName || patient.email || 'Unknown Patient'
  }

  const getPatientPhone = (patient) => {
    if (!patient) return 'N/A'
    return patient.phone || 'N/A'
  }

  const getPatientAvatar = (patient) => {
    if (!patient) return '/assets_admin/img/patients/patient1.jpg'
    return patient.profileImage || '/assets_admin/img/patients/patient1.jpg'
  }

  const getPatientLastVisit = (patient) => {
    return patient.lastVisit || 'N/A'
  }

  const getPatientTotalPaid = (patient) => {
    return formatCurrency(patient.totalPaid || 0)
  }

  const getAppointmentDoctorName = (appointment) => {
    if (!appointment) return 'Unknown Doctor'
    if (appointment.doctorId) {
      if (typeof appointment.doctorId === 'object') {
        return appointment.doctorId.fullName || appointment.doctorId.email || 'Unknown Doctor'
      }
    }
    return 'Unknown Doctor'
  }

  const getAppointmentDoctorSpecialization = (appointment) => {
    if (!appointment || !appointment.doctorId) return 'N/A'
    if (typeof appointment.doctorId === 'object' && appointment.doctorId.doctorProfile?.specialization) {
      const spec = appointment.doctorId.doctorProfile.specialization
      return typeof spec === 'object' ? spec.name : spec
    }
    return 'N/A'
  }

  const getAppointmentPatientName = (appointment) => {
    if (!appointment) return 'Unknown Patient'
    if (appointment.patientId) {
      if (typeof appointment.patientId === 'object') {
        return appointment.patientId.fullName || appointment.patientId.email || 'Unknown Patient'
      }
    }
    return 'Unknown Patient'
  }

  const formatAppointmentDateTime = (appointment) => {
    if (!appointment) return 'N/A'
    const date = appointment.appointmentDate
    const time = appointment.appointmentTime
    if (!date) return 'N/A'
    
    const appointmentDate = new Date(date)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    return time ? `${formattedDate} ${time}` : formattedDate
  }

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary-light'
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-success-light'
      case 'PENDING':
        return 'bg-warning-light'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-danger-light'
      case 'COMPLETED':
        return 'bg-info-light'
      default:
        return 'bg-secondary-light'
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fe fe-star text-warning"></i>)
      } else {
        stars.push(<i key={i} className="fe fe-star-o text-secondary"></i>)
      }
    }
    return stars
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Welcome Admin!</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item active">Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}

        <div className="row">
          <div className="col-xl-3 col-sm-6 col-12">
            <div className="card">
              <div className="card-body">
                <div className="dash-widget-header">
                  <span className="dash-widget-icon text-primary border-primary">
                    <i className="fe fe-users"></i>
                  </span>
                  <div className="dash-count">
                    <h3>{isLoading ? '...' : (stats.totalDoctors || 0)}</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Doctors</h6>
                  {stats.doctorsPendingApproval > 0 && (
                    <small className="text-warning">({stats.doctorsPendingApproval} pending approval)</small>
                  )}
                  <div className="progress progress-sm">
                    <div className="progress-bar bg-primary w-50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-sm-6 col-12">
            <div className="card">
              <div className="card-body">
                <div className="dash-widget-header">
                  <span className="dash-widget-icon text-success">
                    <i className="fe fe-credit-card"></i>
                  </span>
                  <div className="dash-count">
                    <h3>{isLoading ? '...' : (stats.totalPatients || 0)}</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Patients</h6>
                  <div className="progress progress-sm">
                    <div className="progress-bar bg-success w-50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-sm-6 col-12">
            <div className="card">
              <div className="card-body">
                <div className="dash-widget-header">
                  <span className="dash-widget-icon text-danger border-danger">
                    <i className="fe fe-money"></i>
                  </span>
                  <div className="dash-count">
                    <h3>{isLoading ? '...' : (stats.totalAppointments || 0)}</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Appointments</h6>
                  {stats.todaysAppointmentsCount > 0 && (
                    <small className="text-info">({stats.todaysAppointmentsCount} today)</small>
                  )}
                  <div className="progress progress-sm">
                    <div className="progress-bar bg-danger w-50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-sm-6 col-12">
            <div className="card">
              <div className="card-body">
                <div className="dash-widget-header">
                  <span className="dash-widget-icon text-warning border-warning">
                    <i className="fe fe-folder"></i>
                  </span>
                  <div className="dash-count">
                    <h3>{isLoading ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalEarnings || 0)}</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Total Revenue</h6>
                  {stats.activeSubscriptionsCount > 0 && (
                    <small className="text-success">({stats.activeSubscriptionsCount} active subscriptions)</small>
                  )}
                  <div className="progress progress-sm">
                    <div className="progress-bar bg-warning w-50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 col-lg-6">
            {/* Sales Chart */}
            <div className="card card-chart">
              <div className="card-header">
                <h4 className="card-title">Revenue</h4>
              </div>
              <div className="card-body">
                <div id="morrisArea"></div>
              </div>
            </div>
            {/* /Sales Chart */}
          </div>
          <div className="col-md-12 col-lg-6">
            {/* Invoice Chart */}
            <div className="card card-chart">
              <div className="card-header">
                <h4 className="card-title">Status</h4>
              </div>
              <div className="card-body">
                <div id="morrisLine"></div>
              </div>
            </div>
            {/* /Invoice Chart */}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 d-flex">
            {/* Recent Orders */}
            <div className="card card-table flex-fill">
              <div className="card-header">
                <h4 className="card-title">Doctors List</h4>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Doctor Name</th>
                        <th>Speciality</th>
                        <th>Earned</th>
                        <th>Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-3">
                            <p className="text-muted mb-0">No doctors found</p>
                          </td>
                        </tr>
                      ) : (
                        doctors.map((doctor) => (
                          <tr key={doctor._id || doctor.id}>
                            <td>
                              <h2 className="table-avatar">
                                <Link to={`/doctor-list`} className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={getDoctorAvatar(doctor)} 
                                    alt="Doctor Image"
                                    onError={(e) => {
                                      e.target.src = '/assets_admin/img/doctors/doctor-thumb-01.jpg'
                                    }}
                                  />
                                </Link>
                                <Link to={`/doctor-list`}>{getDoctorName(doctor)}</Link>
                              </h2>
                            </td>
                            <td>{getDoctorSpecialization(doctor)}</td>
                            <td>{getDoctorEarnings(doctor)}</td>
                            <td>{renderStars(getDoctorRating(doctor))}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* /Recent Orders */}
          </div>
          <div className="col-md-6 d-flex">
            {/* Feed Activity */}
            <div className="card card-table flex-fill">
              <div className="card-header">
                <h4 className="card-title">Patients List</h4>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Last Visit</th>
                        <th>Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientsWithData.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-3">
                            <p className="text-muted mb-0">No patients found</p>
                          </td>
                        </tr>
                      ) : (
                        patientsWithData.map((patient) => (
                          <tr key={patient._id || patient.id}>
                            <td>
                              <h2 className="table-avatar">
                                <Link to={`/patient-list`} className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={getPatientAvatar(patient)} 
                                    alt="Patient Image"
                                    onError={(e) => {
                                      e.target.src = '/assets_admin/img/patients/patient1.jpg'
                                    }}
                                  />
                                </Link>
                                <Link to={`/patient-list`}>{getPatientName(patient)}</Link>
                              </h2>
                            </td>
                            <td>{getPatientPhone(patient)}</td>
                            <td>{getPatientLastVisit(patient)}</td>
                            <td>{getPatientTotalPaid(patient)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* /Feed Activity */}
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            {/* Recent Orders */}
            <div className="card card-table">
              <div className="card-header">
                <h4 className="card-title">Appointment List</h4>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0" id="index_admin_data">
                    <thead>
                      <tr>
                        <th>Doctor Name</th>
                        <th>Speciality</th>
                        <th>Patient Name</th>
                        <th>Apointment Time</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-3">
                            <p className="text-muted mb-0">No appointments found</p>
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr key={appointment._id || appointment.id}>
                            <td>
                              <h2 className="table-avatar">
                                <Link to={`/doctor-list`} className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={appointment.doctorId?.profileImage || '/assets_admin/img/doctors/doctor-thumb-01.jpg'} 
                                    alt="Doctor Image"
                                    onError={(e) => {
                                      e.target.src = '/assets_admin/img/doctors/doctor-thumb-01.jpg'
                                    }}
                                  />
                                </Link>
                                <Link to={`/doctor-list`}>{getAppointmentDoctorName(appointment)}</Link>
                              </h2>
                            </td>
                            <td>{getAppointmentDoctorSpecialization(appointment)}</td>
                            <td>
                              <h2 className="table-avatar">
                                <Link to={`/patient-list`} className="avatar avatar-sm me-2">
                                  <img 
                                    className="avatar-img rounded-circle" 
                                    src={appointment.patientId?.profileImage || '/assets_admin/img/patients/patient1.jpg'} 
                                    alt="Patient Image"
                                    onError={(e) => {
                                      e.target.src = '/assets_admin/img/patients/patient1.jpg'
                                    }}
                                  />
                                </Link>
                                <Link to={`/patient-list`}>{getAppointmentPatientName(appointment)}</Link>
                              </h2>
                            </td>
                            <td>{formatAppointmentDateTime(appointment)}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status || 'N/A'}
                              </span>
                            </td>
                            <td>{formatCurrency(appointment.amount || appointment.fees || 0)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* /Recent Orders */}
          </div>
        </div>
    </>
  )
}

export default AdminDashboard

