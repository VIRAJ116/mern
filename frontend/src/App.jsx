import { Outlet } from 'react-router'
import { ThemeProvider } from '@/context/theme-provider'
import { AuthProvider } from '@/context/auth-provider'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
