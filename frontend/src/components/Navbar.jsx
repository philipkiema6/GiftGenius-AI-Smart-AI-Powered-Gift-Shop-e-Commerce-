import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaShoppingCart, FaHeart, FaUserCircle, FaBars, FaTimes, FaSearch,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Logo from './Logo'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/gift-finder', label: 'AI Gift Finder' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { isAuthenticated, isAdmin, isVendor, user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(search)}`)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center shrink-0">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-pink ${
                  isActive ? 'text-brand-purple' : 'text-gray-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-xs relative">
          <FaSearch className="absolute left-3 text-gray-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for gifts..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-purple-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
          />
        </form>

        <div className="flex items-center gap-3">
          <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-brand-pink transition-colors">
            <FaHeart />
          </Link>
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-brand-purple transition-colors">
            <FaShoppingCart />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-2 text-gray-700">
                <FaUserCircle className="text-xl" />
                <span className="text-sm font-medium">{user?.first_name || user?.username}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-purple-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {isVendor ? (
                  <Link to="/vendor" className="block px-4 py-2 text-sm hover:bg-purple-50">Vendor Dashboard</Link>
                ) : (
                  <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-purple-50">Dashboard</Link>
                )}
                {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-purple-50">Admin Panel</Link>}
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-red-500">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex btn-accent text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}

          <button className="md:hidden p-2 text-gray-700" onClick={() => setOpen(!open)}>
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-purple-100 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <form onSubmit={handleSearch} className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for gifts..."
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-purple-50 text-sm focus:outline-none"
                />
              </form>
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-gray-700 font-medium">
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  {isVendor ? (
                    <Link to="/vendor" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Vendor Dashboard</Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Dashboard</Link>
                  )}
                  {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Admin Panel</Link>}
                  <button onClick={() => { logout(); setOpen(false) }} className="text-left text-red-500 font-medium">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="btn-accent text-center font-semibold py-2 rounded-full">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
