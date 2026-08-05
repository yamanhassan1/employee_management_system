import RegisterForm from '../../components/auth/RegisterForm'
import AuthPage from '../../components/auth/AuthPage'

export default function Register() {
  return (
    <AuthPage footerLinks={[{ to: '/auth/login', label: 'Already have an account? Login here' }]}> 
      <RegisterForm />
    </AuthPage>
  )
}
