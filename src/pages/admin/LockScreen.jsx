import { Link } from 'react-router-dom'

const LockScreen = () => {
  return (
    <div className="main-wrapper login-body">
      <div className="login-wrapper">
        <div className="container">
          <div className="loginbox">
            <div className="login-left">
              <img className="img-fluid" src="/assets_admin/img/logo.png" alt="Logo" />
            </div>
            <div className="login-right">
              <div className="login-right-wrap">
                <div className="lock-user">
                  <img className="rounded-circle" src="/assets_admin/img/profiles/avatar-02.jpg" alt="User Image" />
                  <h4>John Doe</h4>
                </div>

                <form action="/admin/dashboard">
                  <div className="mb-3">
                    <input className="form-control" type="password" placeholder="Password" />
                  </div>
                  <div className="mb-0">
                    <button className="btn btn-primary w-100" type="submit">
                      Enter
                    </button>
                  </div>
                </form>

                <div className="text-center dont-have">
                  Sign in as a different user? <Link to="/admin/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LockScreen

