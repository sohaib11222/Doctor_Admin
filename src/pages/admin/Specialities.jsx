const Specialities = () => {
  const specialities = [
    { id: 1, name: 'Cardiology', image: '/assets/img/specialities/specialities-01.png' },
    { id: 2, name: 'Urology', image: '/assets/img/specialities/specialities-02.png' },
    { id: 3, name: 'Neurology', image: '/assets/img/specialities/specialities-03.png' },
    { id: 4, name: 'Orthopedics', image: '/assets/img/specialities/specialities-04.png' },
  ]

  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-7 col-auto">
                <h3 className="page-title">Specialities</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Specialities</li>
                </ul>
              </div>
              <div className="col-sm-5 col">
                <a href="#Add_Specialities_details" data-bs-toggle="modal" className="btn btn-primary float-end mt-2">
                  Add
                </a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="datatable table table-hover table-center mb-0" id="specialities_data">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Specialities</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specialities.map((speciality, idx) => (
                          <tr key={speciality.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="javascript:void(0);" className="avatar avatar-sm me-2">
                                  <img className="avatar-img" src={speciality.image} alt="Speciality" />
                                </a>
                                <a href="javascript:void(0);">{speciality.name}</a>
                              </h2>
                            </td>
                            <td>
                              <div className="actions">
                                <a className="btn btn-sm bg-success-light me-2" href="#edit_specialities_details" data-bs-toggle="modal">
                                  <i className="feather-edit"></i>
                                </a>
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

      {/* Add Modal */}
      <div className="modal fade" id="Add_Specialities_details" aria-hidden="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Specialities</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Specialities</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Image</label>
                      <input type="file" className="form-control" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <div className="modal fade" id="edit_specialities_details" aria-hidden="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Specialities</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Specialities</label>
                      <input type="text" className="form-control" defaultValue="Cardiology" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Image</label>
                      <input type="file" className="form-control" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Save Changes
                </button>
              </form>
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

export default Specialities

