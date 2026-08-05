import PasswordResetForm from '../../components/auth/PasswordResetForm'
import AuthPage from '../../components/auth/AuthPage'

export default function ResetPassword() {
  return (
    <AuthPage footerLinks={[{ to: '/auth/login', label: 'Back to login' }]}> 
      <PasswordResetForm mode="reset" />
    </AuthPage>
  )
}
