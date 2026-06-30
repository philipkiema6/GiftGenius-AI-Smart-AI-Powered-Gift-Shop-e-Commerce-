import { Link, NavLink, Outlet } from 'react-router-dom'
import { FaTachometerAlt, FaBoxOpen, FaShoppingBag, FaUsers, FaArrowLeft, FaStore, FaMoneyCheckAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const LINKS = [
  { to: '/admin', label: 'Overview', icon: <FaTachometerAlt />, end: true },
  { to: '/admin/products', label: 'Products', icon: <FaBoxOpen /> },
  { to: '/admin/vendors', label: 'Vendors', icon: <FaStore /> },
  { to: '/admin/payouts', label: 'Vendor Payouts', icon: <FaMoneyCheckAlt /> },
  { to: '/admin/orders', label: 'Orders', icon: <FaShoppingBag /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-[#f3f3f3]">
      <aside className="w-64 bg-[#131921] text-purple-100 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Logo variant="light" />
        </div>
        <p className="px-6 -mt-1 mb-2 text-xs text-purple-400 font-medium tracking-wide uppercase">Admin Panel</p>
        <nav className="flex-1 flex flex-col gap-1 p-4">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-2 ${
                  isActive ? 'bg-white/10 text-white border-[#FF9900]' : 'text-purple-300 hover:bg-white/5 border-transparent'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-purple-300 hover:text-white">
            <FaArrowLeft /> Back to Store
          </Link>
          <p className="text-xs text-purple-400">Signed in as {user?.username}</p>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}
