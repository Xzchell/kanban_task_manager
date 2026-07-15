import './App.css'
import { AlertProvider } from './context/alert_provider'
import { AuthProvider } from './context/auth_provider'
import { BrowserRouter } from 'react-router-dom'
import PagesControl from './pages/pages_control'
import { DesignProvider } from './context/design_context'
import { BoardProvider } from './context/board_сontext'


function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <AuthProvider>
          <DesignProvider>
            <BoardProvider>
              <AlertProvider>
                <PagesControl />
              </AlertProvider>
            </BoardProvider>
          </DesignProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App;