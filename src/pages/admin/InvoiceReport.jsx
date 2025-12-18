const InvoiceReport = () => {
  const invoices = [
    {
      id: 1,
      invoiceNumber: '#INV-0010',
      patientId: 'PT001',
      patientName: 'Charlene Reed',
      totalAmount: '$150.00',
      createdDate: '14 Nov 2019',
      status: 'Paid',
      patientImage: '/assets/img/patients/patient1.jpg',
    },
    {
      id: 2,
      invoiceNumber: '#INV-0009',
      patientId: 'PT002',
      patientName: 'Travis Trimble',
      totalAmount: '$200.00',
      createdDate: '12 Nov 2019',
      status: 'Paid',
      patientImage: '/assets/img/patients/patient2.jpg',
    },
    {
      id: 3,
      invoiceNumber: '#INV-0008',
      patientId: 'PT003',
      patientName: 'Carl Kelly',
      totalAmount: '$250.00',
      createdDate: '10 Nov 2019',
      status: 'Pending',
      patientImage: '/assets/img/patients/patient3.jpg',
    },
  ]

  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Invoice Report</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Invoice Report</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="datatable table table-hover table-center mb-0" id="invoice_data">
                      <thead>
                        <tr>
                          <th>Invoice Number</th>
                          <th>Patient ID</th>
                          <th>Patient Name</th>
                          <th>Total Amount</th>
                          <th>Created Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td>
                              <a href="/invoice-view">{invoice.invoiceNumber}</a>
                            </td>
                            <td>{invoice.patientId}</td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="/patient-profile" className="avatar avatar-sm me-2">
                                  <img className="avatar-img rounded-circle" src={invoice.patientImage} alt="User Image" />
                                </a>
                                <a href="/patient-profile">{invoice.patientName}</a>
                              </h2>
                            </td>
                            <td>{invoice.totalAmount}</td>
                            <td>{invoice.createdDate}</td>
                            <td>
                              <span className={`badge ${invoice.status === 'Paid' ? 'bg-success-light' : 'bg-warning-light'}`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <a className="btn btn-sm bg-success-light me-2" href="#edit_invoice_report" data-bs-toggle="modal">
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

      {/* Edit Modal */}
      <div className="modal fade" id="edit_invoice_report" aria-hidden="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Invoice Report</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Invoice Number</label>
                      <input type="text" className="form-control" defaultValue="#INV-0001" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Patient ID</label>
                      <input type="text" className="form-control" defaultValue="#PT002" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Patient Name</label>
                      <input type="text" className="form-control" defaultValue="R Amer" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Patient Image</label>
                      <input type="file" className="form-control" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Total Amount</label>
                      <input type="text" className="form-control" defaultValue="$200.00" />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label className="mb-2">Created Date</label>
                      <input type="text" className="form-control" defaultValue="29th Jun 2023" />
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

export default InvoiceReport

