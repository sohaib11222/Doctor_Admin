const PatientList = () => {
  const patients = [
    {
      id: 1,
      patientId: 'PT001',
      name: 'Charlene Reed',
      age: 29,
      address: '4417 Goosetown Drive, Taylorsville, North Carolina, 28681',
      phone: '+1 828 632 9170',
      lastVisit: '12 Nov 2019',
      paid: '$100.00',
      image: '/assets/img/patients/patient1.jpg',
    },
    {
      id: 2,
      patientId: 'PT002',
      name: 'Travis Trimble',
      age: 23,
      address: '5557 Front Street, Hamilton, Ohio, 45011',
      phone: '+1 513 876 0913',
      lastVisit: '11 Nov 2019',
      paid: '$200.00',
      image: '/assets/img/patients/patient2.jpg',
    },
    {
      id: 3,
      patientId: 'PT003',
      name: 'Carl Kelly',
      age: 29,
      address: '1307 Desert Broom Court, Newark, New Jersey, 07102',
      phone: '+1 973 321 2173',
      lastVisit: '10 Nov 2019',
      paid: '$250.00',
      image: '/assets/img/patients/patient3.jpg',
    },
  ]

  return (
    <>
      <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">List of Patient</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="javascript:(0);">Users</a></li>
                  <li className="breadcrumb-item active">Patient</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="datatable table table-hover table-center mb-0" id="patient_data">
                      <thead>
                        <tr>
                          <th>Patient ID</th>
                          <th>Patient Name</th>
                          <th>Age</th>
                          <th>Address</th>
                          <th>Phone</th>
                          <th>Last Visit</th>
                          <th className="text-end">Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient) => (
                          <tr key={patient.id}>
                            <td>{patient.patientId}</td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="/patient-profile" className="avatar avatar-sm me-2">
                                  <img className="avatar-img rounded-circle" src={patient.image} alt="User Image" />
                                </a>
                                <a href="/patient-profile">{patient.name}</a>
                              </h2>
                            </td>
                            <td>{patient.age}</td>
                            <td>{patient.address}</td>
                            <td>{patient.phone}</td>
                            <td>{patient.lastVisit}</td>
                            <td className="text-end">{patient.paid}</td>
                          </tr>
                        ))}
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

export default PatientList

