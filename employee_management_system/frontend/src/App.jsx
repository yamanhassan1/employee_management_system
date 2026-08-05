import { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/common/Loader'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
