// import { NavLink, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import {
//   LayoutDashboard, Tag, Package, Users, ShoppingCart,
//   CreditCard, BookOpen, BarChart2, LogOut
// } from 'lucide-react'

// const navItems = [
//   { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
//   { to: '/new-sale',   label: 'New Sale',     icon: ShoppingCart },
//   { to: '/payments',   label: 'Payments',     icon: CreditCard },
//   { to: '/customers',  label: 'Customers',    icon: Users },
//   { to: '/products',   label: 'Products',     icon: Package },
//   { to: '/categories', label: 'Categories',   icon: Tag },
//   { to: '/reports',    label: 'Reports',      icon: BarChart2 },
// ]

// export default function Sidebar() {
//   const { signOut, user } = useAuth()
//   const navigate = useNavigate()

//   const handleSignOut = async () => {
//     await signOut()
//     navigate('/login')
//   }

//   return (
//     <aside className="fixed left-0 top-0 h-screen w-60 bg-charcoal flex flex-col z-30">

//       {/* Brand */}
//       <div className="px-6 pt-8 pb-6 border-b border-white/10">
//         <h1 className="font-display text-white text-2xl font-semibold leading-tight">
//           Boutique
//         </h1>
//         <p className="text-white/40 text-xs mt-1 font-body tracking-widest uppercase">
//           Point of Sale
//         </p>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto">
//         {navItems.map(({ to, label, icon: Icon }) => (
//           <NavLink
//             key={to}
//             to={to}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-body font-medium transition-colors duration-150 ${
//                 isActive
//                   ? 'bg-rose text-white'
//                   : 'text-white/60 hover:text-white hover:bg-white/8'
//               }`
//             }
//           >
//             <Icon size={17} strokeWidth={1.8} />
//             {label}
//           </NavLink>
//         ))}
//       </nav>

//       {/* User footer */}
//       <div className="px-4 py-4 border-t border-white/10">
//         <div className="flex items-center gap-3 mb-3">
//           <div className="w-8 h-8 rounded-full bg-rose/30 flex items-center justify-center">
//             <span className="text-rose text-xs font-semibold uppercase">
//               {user?.email?.[0] || 'U'}
//             </span>
//           </div>
//           <div className="min-w-0">
//             <p className="text-white text-xs font-medium truncate">{user?.email}</p>
//             <p className="text-white/40 text-xs capitalize">
//               {user?.user_metadata?.role || 'admin'}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={handleSignOut}
//           className="flex items-center gap-2 text-white/50 hover:text-white text-xs w-full transition-colors"
//         >
//           <LogOut size={14} />
//           Sign out
//         </button>
//       </div>
//     </aside>
//   )
// }


import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Tag, Package, Users, ShoppingCart,
  CreditCard, BarChart2, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/new-sale',   label: 'New Sale',   icon: ShoppingCart },
  { to: '/payments',   label: 'Payments',   icon: CreditCard },
  { to: '/customers',  label: 'Customers',  icon: Users },
  { to: '/products',   label: 'Products',   icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/reports',    label: 'Reports',    icon: BarChart2 },
]

const bottomNavItems = [
  { to: '/dashboard',  label: 'Home',      icon: LayoutDashboard },
  { to: '/new-sale',   label: 'Sale',      icon: ShoppingCart },
  { to: '/payments',   label: 'Payments',  icon: CreditCard },
  { to: '/customers',  label: 'Customers', icon: Users },
  { to: '/products',   label: 'Products',  icon: Package },
]

export default function Sidebar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-charcoal flex-col z-30">
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <h1 className="font-display text-white text-2xl font-semibold">Boutique</h1>
          <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">Point of Sale</p>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive ? 'bg-rose text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-rose/30 flex items-center justify-center">
              <span className="text-rose text-xs font-semibold uppercase">{user?.email?.[0] || 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.email}</p>
              <p className="text-white/40 text-xs">{user?.user_metadata?.role || 'admin'}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-white/50 hover:text-white text-xs w-full">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-charcoal flex items-center justify-between px-4 z-40 shadow-lg">
        <h1 className="font-display text-white text-xl font-semibold">Boutique POS</h1>
        <button onClick={() => setDrawerOpen(true)} className="text-white/70 hover:text-white p-1">
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 bg-charcoal h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/10">
              <div>
                <h1 className="font-display text-white text-xl font-semibold">Boutique POS</h1>
                <p className="text-white/40 text-xs mt-0.5 truncate">{user?.email}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-white/50 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors ${
                      isActive ? 'bg-rose text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-5 border-t border-white/10">
              <button onClick={handleSignOut} className="flex items-center gap-2 text-white/50 hover:text-white text-sm w-full">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 z-40 flex">
        {bottomNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-rose' : 'text-white/50 hover:text-white'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
