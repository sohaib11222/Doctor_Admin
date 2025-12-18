const Reviews = () => {
  const reviews = [
    {
      id: 1,
      patientName: 'Charlene Reed',
      doctorName: 'Dr. Ruby Perrin',
      rating: 4,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      date: '12 Nov 2019',
      patientImage: '/assets/img/patients/patient1.jpg',
      doctorImage: '/assets/img/doctors/doctor-thumb-01.jpg',
    },
    {
      id: 2,
      patientName: 'Travis Trimble',
      doctorName: 'Dr. Darren Elder',
      rating: 5,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      date: '11 Nov 2019',
      patientImage: '/assets/img/patients/patient2.jpg',
      doctorImage: '/assets/img/doctors/doctor-thumb-02.jpg',
    },
    {
      id: 3,
      patientName: 'Carl Kelly',
      doctorName: 'Dr. Deborah Angel',
      rating: 4,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      date: '10 Nov 2019',
      patientImage: '/assets/img/patients/patient3.jpg',
      doctorImage: '/assets/img/doctors/doctor-thumb-03.jpg',
    },
  ]

  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Reviews</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Reviews</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="datatable table table-hover table-center mb-0" id="review_data">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Doctor Name</th>
                          <th>Ratings</th>
                          <th>Description</th>
                          <th>Date</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((review) => (
                          <tr key={review.id}>
                            <td>
                              <h2 className="table-avatar">
                                <a href="/patient-profile" className="avatar avatar-sm me-2">
                                  <img className="avatar-img rounded-circle" src={review.patientImage} alt="User Image" />
                                </a>
                                <a href="/patient-profile">{review.patientName}</a>
                              </h2>
                            </td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="/doctor-profile" className="avatar avatar-sm me-2">
                                  <img className="avatar-img rounded-circle" src={review.doctorImage} alt="User Image" />
                                </a>
                                <a href="/doctor-profile">{review.doctorName}</a>
                              </h2>
                            </td>
                            <td>
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}></i>
                              ))}
                            </td>
                            <td>{review.description}</td>
                            <td>{review.date}</td>
                            <td className="text-end">
                              <div className="actions">
                                <a className="btn btn-sm bg-danger-light" href="#delete_modal" data-bs-toggle="modal">
                                  <i className="feather-trash-2"></i>
                                </a>
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
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal" aria-hidden="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-content p-2">
                <h4 className="modal-title">Delete</h4>
                <p className="mb-4">Are you sure want to delete?</p>
                <button type="button" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Reviews

