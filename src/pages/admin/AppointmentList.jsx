const AppointmentList = () => {
  return (
    <>
      <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Appointments</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Appointments</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive" id="index_admin_table_wrapper">
                    <table className="datatable table table-hover table-center mb-0" id="appointment_data">
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
                        <tr>
                          <td>
                            <h2 className="table-avatar">
                              <a href="/doctor-profile" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src="/assets/img/doctors/doctor-thumb-01.jpg" alt="User Image" />
                              </a>
                              <a href="/doctor-profile">Dr. Ruby Perrin</a>
                            </h2>
                          </td>
                          <td>Dental</td>
                          <td>
                            <h2 className="table-avatar">
                              <a href="/patient-profile" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src="/assets/img/patients/patient1.jpg" alt="User Image" />
                              </a>
                              <a href="/patient-profile">Charlene Reed</a>
                            </h2>
                          </td>
                          <td>14 Nov 2019 <span className="text-primary d-block">10.00 AM</span></td>
                          <td><span className="badge bg-success-light">Confirm</span></td>
                          <td>$160.00</td>
                        </tr>
                        <tr>
                          <td>
                            <h2 className="table-avatar">
                              <a href="/doctor-profile" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src="/assets/img/doctors/doctor-thumb-02.jpg" alt="User Image" />
                              </a>
                              <a href="/doctor-profile">Dr. Darren Elder</a>
                            </h2>
                          </td>
                          <td>Cardiology</td>
                          <td>
                            <h2 className="table-avatar">
                              <a href="/patient-profile" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src="/assets/img/patients/patient2.jpg" alt="User Image" />
                              </a>
                              <a href="/patient-profile">Travis Trimble</a>
                            </h2>
                          </td>
                          <td>12 Nov 2019 <span className="text-primary d-block">11.00 AM</span></td>
                          <td><span className="badge bg-warning-light">Pending</span></td>
                          <td>$200.00</td>
                        </tr>
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

export default AppointmentList

