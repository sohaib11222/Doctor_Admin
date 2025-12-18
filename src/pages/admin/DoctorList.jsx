const DoctorList = () => {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Ruby Perrin',
      speciality: 'Dental',
      memberSince: '08 Jan 2019',
      earned: '$3200.00',
      status: 'Active',
      image: '/assets/img/doctors/doctor-thumb-01.jpg',
    },
    {
      id: 2,
      name: 'Dr. Darren Elder',
      speciality: 'Cardiology',
      memberSince: '05 Jan 2019',
      earned: '$3100.00',
      status: 'Active',
      image: '/assets/img/doctors/doctor-thumb-02.jpg',
    },
    {
      id: 3,
      name: 'Dr. Deborah Angel',
      speciality: 'Cardiology',
      memberSince: '04 Jan 2019',
      earned: '$4000.00',
      status: 'Active',
      image: '/assets/img/doctors/doctor-thumb-03.jpg',
    },
  ]

  return (
    <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">List of Doctors</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="javascript:(0);">Users</a></li>
                  <li className="breadcrumb-item active">Doctor</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="datatable table table-hover table-center mb-0" id="doctor_data">
                      <thead>
                        <tr>
                          <th>Doctor Name</th>
                          <th>Speciality</th>
                          <th>Member Since</th>
                          <th>Earned</th>
                          <th>Account Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doctor) => (
                          <tr key={doctor.id}>
                            <td>
                              <h2 className="table-avatar">
                                <a href="/doctor-profile" className="avatar avatar-sm me-2">
                                  <img className="avatar-img rounded-circle" src={doctor.image} alt="User Image" />
                                </a>
                                <a href="/doctor-profile">{doctor.name}</a>
                              </h2>
                            </td>
                            <td>{doctor.speciality}</td>
                            <td>{doctor.memberSince}</td>
                            <td>{doctor.earned}</td>
                            <td>
                              <span className="badge bg-success-light">{doctor.status}</span>
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
        </div>
      </div>
  )
}

export default DoctorList

