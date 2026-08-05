import LoginForm from '../../components/auth/LoginForm'
import AuthPage from '../../components/auth/AuthPage'

export default function Login() {
  return (
    <AuthPage
      footerLinks={[
        { to: '/auth/register', label: "Don't have an account? Register here" },
        { to: '/auth/forgot-password', label: 'Forgot password?' },
      ]}
    >
      <LoginForm />
    </AuthPage>
  )
}
