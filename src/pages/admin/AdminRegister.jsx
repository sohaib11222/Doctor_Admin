import { Link } from 'react-router-dom'

const AdminRegister = () => {
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
                <h1>Register</h1>
                <p className="account-subtitle">Access to our dashboard</p>

                <form action="#" method="POST">
                  <div className="mb-3">
                    <input className="form-control" type="text" placeholder="Name" name="name" id="name" />
                  </div>
                  <div className="mb-3">
                    <input className="form-control" type="text" placeholder="Email" name="email" id="email" />
                  </div>
                  <div className="mb-3">
                    <div className="pass-group">
                      <input className="form-control pass-input" type="password" placeholder="Password" name="password" id="password" />
                      <span className="feather-eye-off toggle-password"></span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="pass-group">
                      <input className="form-control pass-new-input" type="password" placeholder="Confirm Password" name="confirm_password" id="confirm_password" />
                      <span className="feather-eye-off toggle-password1"></span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <button className="btn btn-primary w-100" type="submit">
                      Register
                    </button>
                  </div>
                </form>

                <div className="login-or">
                  <span className="or-line"></span>
                  <span className="span-or">or</span>
                </div>

                <div className="social-login">
                  <span>Login with</span>
                  <a href="javascript:;" className="facebook">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                  <a href="javascript:;" className="google">
                    <i className="fa-brands fa-google"></i>
                  </a>
                </div>

                <div className="text-center dont-have">
                  Already have an account? <Link to="/admin/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister

