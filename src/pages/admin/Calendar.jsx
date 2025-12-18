const Calendar = () => {
  return (
    <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Calendar</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Calendar</li>
                </ul>
              </div>
              <div className="col-auto text-end float-end ms-auto">
                <a href="javascript:;" className="add-btn" data-bs-toggle="modal" data-bs-target="#add_event">
                  <span>
                    <i className="fe fe-plus"></i>
                  </span>{' '}
                  Create New
                </a>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3 col-md-4">
              <h4 className="card-title">Drag & Drop Event</h4>
              <div id="calendar-events" className="mb-3">
                <div className="calendar-events" data-class="bg-info">
                  <i className="fa fa-circle text-info"></i> My Event One
                </div>
                <div className="calendar-events" data-class="bg-success">
                  <i className="fa fa-circle text-success"></i> My Event Two
                </div>
                <div className="calendar-events" data-class="bg-danger">
                  <i className="fa fa-circle text-danger"></i> My Event Three
                </div>
                <div className="calendar-events" data-class="bg-warning">
                  <i className="fa fa-circle text-warning"></i> My Event Four
                </div>
              </div>
              <div className="checkbox mb-3">
                <input id="drop-remove" type="checkbox" />
                <label htmlFor="drop-remove">Remove after drop</label>
              </div>
              <a href="javascript:;" data-bs-toggle="modal" data-bs-target="#add_new_event" className="btn mb-3 btn-primary w-100">
                <i className="fa fa-plus"></i> Add Category
              </a>
            </div>
            <div className="col-lg-9 col-md-8">
              <div className="card">
                <div className="card-body">
                  <div id="calendar"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Event Modal */}
          <div id="add_event" className="modal fade" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Event</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="mb-2">
                        Event Name <span className="text-danger">*</span>
                      </label>
                      <input className="form-control" type="text" />
                    </div>
                    <div className="mb-3">
                      <label className="mb-2">
                        Event Date <span className="text-danger">*</span>
                      </label>
                      <div className="cal-icon">
                        <input className="form-control datetimepicker" type="text" />
                      </div>
                    </div>
                    <div className="submit-section">
                      <button className="btn btn-primary submit-btn">Submit</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Add Event Modal */}
          <div className="modal fade none-border" id="my_event">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Event</h4>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div className="modal-body"></div>
                <div className="modal-footer justify-content-center">
                  <button type="button" className="btn btn-success save-event submit-btn">
                    Create event
                  </button>
                  <button type="button" className="btn btn-danger delete-event submit-btn" data-bs-dismiss="modal">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Category Modal */}
          <div className="modal fade" id="add_new_event">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Category</h4>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="mb-2">Category Name</label>
                      <input className="form-control form-white" placeholder="Enter name" type="text" name="category-name" />
                    </div>
                    <div className="mb-0">
                      <label className="mb-2">Choose Category Color</label>
                      <select className="form-select form-control form-white select" data-placeholder="Choose a color..." name="category-color">
                        <option value="success">Success</option>
                        <option value="danger">Danger</option>
                        <option value="info">Info</option>
                        <option value="primary">Primary</option>
                        <option value="warning">Warning</option>
                        <option value="inverse">Inverse</option>
                      </select>
                    </div>
                    <div className="submit-section">
                      <button type="button" className="btn btn-primary save-category submit-btn" data-bs-dismiss="modal">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Calendar

