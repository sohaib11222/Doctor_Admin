import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
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

  const doctors = [
    {
      id: 1,
      name: 'Dr. Ruby Perrin',
      speciality: 'Dental',
      earned: '$3200.00',
      rating: 4,
      image: '/assets_admin/img/doctors/doctor-thumb-01.jpg'
    },
    {
      id: 2,
      name: 'Dr. Darren Elder',
      speciality: 'Dental',
      earned: '$3100.00',
      rating: 4,
      image: '/assets_admin/img/doctors/doctor-thumb-02.jpg'
    },
    {
      id: 3,
      name: 'Dr. Deborah Angel',
      speciality: 'Cardiology',
      earned: '$4000.00',
      rating: 4,
      image: '/assets_admin/img/doctors/doctor-thumb-03.jpg'
    },
    {
      id: 4,
      name: 'Dr. Sofia Brient',
      speciality: 'Urology',
      earned: '$3200.00',
      rating: 4,
      image: '/assets_admin/img/doctors/doctor-thumb-04.jpg'
    },
    {
      id: 5,
      name: 'Dr. Marvin Campbell',
      speciality: 'Orthopaedics',
      earned: '$3500.00',
      rating: 4,
      image: '/assets_admin/img/doctors/doctor-thumb-05.jpg'
    }
  ]

  const patients = [
    {
      id: 1,
      name: 'Charlene Reed',
      phone: '8286329170',
      lastVisit: '20 Oct 2023',
      paid: '$100.00',
      image: '/assets_admin/img/patients/patient1.jpg'
    },
    {
      id: 2,
      name: 'Travis Trimble',
      phone: '2077299974',
      lastVisit: '22 Oct 2023',
      paid: '$200.00',
      image: '/assets_admin/img/patients/patient2.jpg'
    },
    {
      id: 3,
      name: 'Carl Kelly',
      phone: '2607247769',
      lastVisit: '21 Oct 2023',
      paid: '$250.00',
      image: '/assets_admin/img/patients/patient3.jpg'
    },
    {
      id: 4,
      name: 'Michelle Fairfax',
      phone: '5043686874',
      lastVisit: '21 Sep 2023',
      paid: '$150.00',
      image: '/assets_admin/img/patients/patient4.jpg'
    },
    {
      id: 5,
      name: 'Gina Moore',
      phone: '9548207887',
      lastVisit: '18 Sep 2023',
      paid: '$350.00',
      image: '/assets_admin/img/patients/patient5.jpg'
    }
  ]

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
                    <h3>168</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Doctors</h6>
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
                    <h3>487</h3>
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
                    <h3>485</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Appointment</h6>
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
                    <h3>$62523</h3>
                  </div>
                </div>
                <div className="dash-widget-info">
                  <h6 className="text-muted">Revenue</h6>
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
                      {doctors.map((doctor) => (
                        <tr key={doctor.id}>
                          <td>
                            <h2 className="table-avatar">
                              <Link to="/profile" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src={doctor.image} alt="User Image" />
                              </Link>
                              <Link to="/profile">{doctor.name}</Link>
                            </h2>
                          </td>
                          <td>{doctor.speciality}</td>
                          <td>{doctor.earned}</td>
                          <td>{renderStars(doctor.rating)}</td>
                        </tr>
                      ))}
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
                      {patients.map((patient) => (
                        <tr key={patient.id}>
                          <td>
                            <h2 className="table-avatar">
                              <Link to="/profile" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src={patient.image} alt="User Image" />
                              </Link>
                              <Link to="/profile">{patient.name}</Link>
                            </h2>
                          </td>
                          <td>{patient.phone}</td>
                          <td>{patient.lastVisit}</td>
                          <td>{patient.paid}</td>
                        </tr>
                      ))}
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
                      {/* Data will be loaded dynamically */}
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

