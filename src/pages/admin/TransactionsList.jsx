const TransactionsList = () => {
  const transactions = [
    {
      id: 1,
      invoiceNumber: '#INV-0010',
      patientId: 'PT001',
      patientName: 'Charlene Reed',
      totalAmount: '$150.00',
      status: 'Paid',
      patientImage: '/assets/img/patients/patient1.jpg',
    },
    {
      id: 2,
      invoiceNumber: '#INV-0009',
      patientId: 'PT002',
      patientName: 'Travis Trimble',
      totalAmount: '$200.00',
      status: 'Paid',
      patientImage: '/assets/img/patients/patient2.jpg',
    },
    {
      id: 3,
      invoiceNumber: '#INV-0008',
      patientId: 'PT003',
      patientName: 'Carl Kelly',
      totalAmount: '$250.00',
      status: 'Pending',
      patientImage: '/assets/img/patients/patient3.jpg',
    },
  ]

  return (
    <>
      <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Transactions</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item active">Transactions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="datatable table table-hover table-center mb-0" id="transactions-list_data">
                      <thead>
                        <tr>
                          <th>Invoice Number</th>
                          <th>Patient ID</th>
                          <th>Patient Name</th>
                          <th>Total Amount</th>
                          <th className="text-center">Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              <a href="/invoice-view">{transaction.invoiceNumber}</a>
                            </td>
                            <td>{transaction.patientId}</td>
                            <td>
                              <h2 className="table-avatar">
                                <a href="/patient-profile" className="avatar avatar-sm me-2">
                                  <img className="avatar-img rounded-circle" src={transaction.patientImage} alt="User Image" />
                                </a>
                                <a href="/patient-profile">{transaction.patientName}</a>
                              </h2>
                            </td>
                            <td>{transaction.totalAmount}</td>
                            <td className="text-center">
                              <span className={`badge ${transaction.status === 'Paid' ? 'bg-success-light' : 'bg-warning-light'}`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="actions">
                                <a className="btn btn-sm bg-success-light me-2" href="/invoice-view">
                                  <i className="feather-eye"></i>
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

export default TransactionsList

