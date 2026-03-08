import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      {/* Desktop: offset for sidebar. Mobile: offset for top bar + bottom nav */}
      <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
