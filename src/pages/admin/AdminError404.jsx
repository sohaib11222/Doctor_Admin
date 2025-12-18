import { Link } from 'react-router-dom'

const AdminError404 = () => {
  return (
    <div className="main-wrapper error-page">
      <div className="error-box">
        <h1>404</h1>
        <h3 className="h2 mb-3">
          <i className="fa fa-warning"></i> Oops! Page not found!
        </h3>
        <p className="h4 fw-medium">The page you requested was not found.</p>
        <Link to="/admin/dashboard" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default AdminError404

