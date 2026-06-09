import './App.css'
import { AlertProvider } from './context/alert_provider'
import { AuthProvider } from './context/auth_provider'
import { BrowserRouter } from 'react-router-dom'
import PagesControl from './pages/pages_control'


function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <AuthProvider>
          <AlertProvider>
            <PagesControl />
          </AlertProvider>  
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App;