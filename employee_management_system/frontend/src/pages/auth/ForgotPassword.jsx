import PasswordResetForm from '../../components/auth/PasswordResetForm'
import AuthPage from '../../components/auth/AuthPage'

export default function ForgotPassword() {
  return (
    <AuthPage
      footerLinks={[
        { to: '/auth/login', label: 'Remember your password? Login here' },
        { to: '/auth/register', label: "Don't have an account? Register here" },
      ]}
    >
      <PasswordResetForm mode="forgot" />
    </AuthPage>
  )
}
