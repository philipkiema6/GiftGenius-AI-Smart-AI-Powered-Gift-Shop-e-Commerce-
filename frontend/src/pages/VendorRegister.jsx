import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaStore, FaUser, FaLock, FaEnvelope } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

const initialForm = {
  username: '', email: '', password: '', password2: '',
  company_name: '', company_description: '', contact_phone: '',
}

export default function VendorRegister() {
  const { registerVendor } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registerVendor(form)
      toast.success('Company account created! Your listing is pending admin approval.')
      navigate('/vendor', { replace: true })
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
          <span className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white text-xl mb-3">
            <FaStore />
          </span>
          <h1 className="text-2xl font-display font-bold text-gray-900">Sell on GiftGenius AI</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Register your company to list products. New companies are reviewed by our team before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="company_name" required value={form.company_name} onChange={handleChange}
            placeholder="Company name" className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
          />
          <textarea
            name="company_description" value={form.company_description} onChange={handleChange}
            placeholder="What does your company sell? (optional)" rows={2}
            className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none resize-none"
          />
          <input
            name="contact_phone" value={form.contact_phone} onChange={handleChange}
            placeholder="Contact phone (optional)" className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none"
          />
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="username" required value={form.username} onChange={handleChange}
              placeholder="Username" className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              placeholder="Business email" className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password" name="password" required value={form.password} onChange={handleChange}
              placeholder="Password" className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password" name="password2" required value={form.password2} onChange={handleChange}
              placeholder="Confirm password" className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full btn-accent font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating company account...' : 'Register Company'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Just shopping?{' '}
          <Link to="/register" className="text-brand-purple font-semibold hover:underline">
            Create a customer account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
