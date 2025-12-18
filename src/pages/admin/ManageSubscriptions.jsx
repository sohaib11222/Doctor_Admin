import { useState } from 'react'
import { Link } from 'react-router-dom'

const ManageSubscriptions = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')

  const doctors = [
    {
      id: 1,
      name: 'Dr. Ruby Perrin',
      email: 'ruby.perrin@example.com',
      currentPlan: 'Basic Plan',
      planPrice: '$29/month',
      status: 'Active',
      startDate: '01 Nov 2024',
      endDate: '01 Dec 2024',
      nextBilling: '01 Dec 2024',
      image: '/assets/img/doctors/doctor-thumb-01.jpg'
    },
    {
      id: 2,
      name: 'Dr. Darren Elder',
      email: 'darren.elder@example.com',
      currentPlan: 'Professional Plan',
      planPrice: '$79/month',
      status: 'Active',
      startDate: '15 Oct 2024',
      endDate: '15 Nov 2024',
      nextBilling: '15 Nov 2024',
      image: '/assets/img/doctors/doctor-thumb-02.jpg'
    },
    {
      id: 3,
      name: 'Dr. Deborah Angel',
      email: 'deborah.angel@example.com',
      currentPlan: 'Enterprise Plan',
      planPrice: '$199/month',
      status: 'Active',
      startDate: '01 Oct 2024',
      endDate: '01 Jan 2025',
      nextBilling: '01 Dec 2024',
      image: '/assets/img/doctors/doctor-thumb-03.jpg'
    },
    {
      id: 4,
      name: 'Dr. Sofia Brient',
      email: 'sofia.brient@example.com',
      currentPlan: 'Basic Plan',
      planPrice: '$29/month',
      status: 'Expired',
      startDate: '01 Sep 2024',
      endDate: '01 Oct 2024',
      nextBilling: '-',
      image: '/assets/img/doctors/doctor-thumb-04.jpg'
    }
  ]

  const plans = [
    { id: 'basic', name: 'Basic Plan', price: '$29/month' },
    { id: 'professional', name: 'Professional Plan', price: '$79/month' },
    { id: 'enterprise', name: 'Enterprise Plan', price: '$199/month' }
  ]

  const handleChangePlan = (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedPlan(doctor.currentPlan)
    setShowModal(true)
  }

  const handleSavePlan = () => {
    // TODO: API call to update subscription
    console.log('Updating plan for:', selectedDoctor.name, 'to:', selectedPlan)
    alert(`Subscription plan updated successfully for ${selectedDoctor.name}`)
    setShowModal(false)
    setSelectedDoctor(null)
    setSelectedPlan('')
  }

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? <span className="badge bg-success-light">Active</span>
      : <span className="badge bg-danger-light">Expired</span>
  }

  return (
    <>
      <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Manage Subscriptions</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Subscriptions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Total Subscriptions</h6>
                <h3>{doctors.length}</h3>
                <p className="text-muted mb-0">All doctors</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Active Subscriptions</h6>
                <h3>{doctors.filter(d => d.status === 'Active').length}</h3>
                <p className="text-muted mb-0">Currently active</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Monthly Revenue</h6>
                <h3>$2,340</h3>
                <p className="text-muted mb-0">This month</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Expired</h6>
                <h3>{doctors.filter(d => d.status === 'Expired').length}</h3>
                <p className="text-muted mb-0">Need renewal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="datatable table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Current Plan</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Next Billing</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor.id}>
                          <td>
                            <h2 className="table-avatar">
                              <Link to="#" className="avatar avatar-sm me-2">
                                <img className="avatar-img rounded-circle" src={doctor.image} alt="User Image" />
                              </Link>
                              <div>
                                <Link to="#">{doctor.name}</Link>
                                <small className="d-block text-muted">{doctor.email}</small>
                              </div>
                            </h2>
                          </td>
                          <td>
                            <strong>{doctor.currentPlan}</strong>
                            <small className="d-block text-muted">{doctor.planPrice}</small>
                          </td>
                          <td>{getStatusBadge(doctor.status)}</td>
                          <td>{doctor.startDate}</td>
                          <td>{doctor.endDate}</td>
                          <td>{doctor.nextBilling}</td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn btn-sm bg-primary-light"
                                onClick={() => handleChangePlan(doctor)}
                                title="Change Plan"
                              >
                                <i className="fe fe-edit"></i> Change Plan
                              </button>
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

        {/* Change Plan Modal */}
        {showModal && selectedDoctor && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Change Subscription Plan</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedDoctor(null)
                      setSelectedPlan('')
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label"><strong>Doctor:</strong></label>
                    <p>{selectedDoctor.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Current Plan:</strong></label>
                    <p>{selectedDoctor.currentPlan} ({selectedDoctor.planPrice})</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Select New Plan:</strong></label>
                    <select
                      className="form-select"
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                    >
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.name}>
                          {plan.name} - {plan.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="alert alert-info">
                    <strong>Note:</strong> The billing will be prorated based on the remaining days in the current billing cycle.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedDoctor(null)
                      setSelectedPlan('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSavePlan}
                  >
                    <i className="fe fe-save me-2"></i>
                    Update Plan
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" onClick={() => {
              setShowModal(false)
              setSelectedDoctor(null)
              setSelectedPlan('')
            }}></div>
          </div>
        )}
    </>
  )
}

export default ManageSubscriptions

