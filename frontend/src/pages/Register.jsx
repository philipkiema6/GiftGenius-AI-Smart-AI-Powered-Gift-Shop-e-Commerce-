import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'
import Logo from '../components/Logo'

const initialForm = { username: '', email: '', first_name: '', last_name: '', password: '', password2: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to GiftGenius AI.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed'))
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
          <h1 className="text-2xl font-display font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join GiftGenius AI and never miss a gift again</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name"
              className="px-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
              className="px-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
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
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
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
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password2"
              required
              value={form.password2}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-purple font-semibold hover:underline">
            Sign in
          </Link>
        </p>
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
