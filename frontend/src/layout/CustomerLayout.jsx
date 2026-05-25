import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Outlet } from 'react-router'
import ChatWidget from '@/components/chat-widget'

const CustomerLayout = () => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default CustomerLayout
