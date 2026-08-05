import Navbar from '../../components/common/Navbar'
import { Link } from 'react-router-dom'

export default function AuthPage({ children, footerLinks = [] }) {
  return (
    <div className="page-container">
      <Navbar />
      <main className="page-main">
        {children}
        {footerLinks.length > 0 && (
          <div className="auth-footer">
            {footerLinks.map((link, index) => (
              <p key={index}>
                <Link to={link.to}>{link.label}</Link>
              </p>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
