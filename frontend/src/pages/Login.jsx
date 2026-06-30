import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaUser, FaLock } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form)
      toast.success('Welcome back!')
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true })
      } else if (user.is_vendor) {
        navigate('/vendor', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid username or password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-purple-50/40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-purple-50 p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <span className="mb-3">
            <Logo />
          </span>
          <h1 className="text-2xl font-display font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue to GiftGenius AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="username"
              required
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-purple font-semibold hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-3">Demo login: demo / Demo@123</p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Own a gift business?{' '}
          <Link to="/vendor/register" className="text-brand-purple font-semibold hover:underline">
            Sell on GiftGenius
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
