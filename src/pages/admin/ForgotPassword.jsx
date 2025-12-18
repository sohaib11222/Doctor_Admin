import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  return (
    <div className="main-wrapper login-body">
      <div className="login-wrapper">
        <div className="container">
          <div className="loginbox">
            <div className="login-left">
              <img className="img-fluid" src="/assets_admin/img/logo-white.png" alt="Logo" />
            </div>
            <div className="login-right">
              <div className="login-right-wrap">
                <h1>Forgot Password?</h1>
                <p className="account-subtitle">Enter your email to get a password reset link</p>
                <form action="/admin/login">
                  <div className="mb-3">
                    <input className="form-control" type="text" placeholder="Email" />
                  </div>
                  <div className="mb-0">
                    <button className="btn btn-primary w-100" type="submit">
                      Reset Password
                    </button>
                  </div>
                </form>

                <div className="text-center dont-have">
                  Remember your password? <Link to="/admin/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

