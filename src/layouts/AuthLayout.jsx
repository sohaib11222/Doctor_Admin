import LanguageToggle from '../components/common/LanguageToggle'

const AuthLayout = ({ children }) => {
  return (
    <div className="main-wrapper">
      <div className="admin-auth-language-toggle">
        <LanguageToggle />
      </div>
      {children}
    </div>
  )
}

export default AuthLayout

