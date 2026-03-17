import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Outlet } from 'react-router'

const CustomerLayout = () => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default CustomerLayout
