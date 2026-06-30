import { useState } from 'react'
import toast from 'react-hot-toast'
import { FaSave, FaLock } from 'react-icons/fa'
import * as authService from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function DashboardProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
  })
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await authService.updateProfile(form)
      updateUser(updated)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await authService.changePassword(passwordForm)
      toast.success('Password updated successfully')
      setPasswordForm({ old_password: '', new_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || 'Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Profile Information</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal details</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          placeholder="First name" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          placeholder="Last name" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          placeholder="Phone number" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <button
          type="submit" disabled={savingProfile}
          className="sm:col-span-2 btn-accent font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <FaSave /> {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="password" required value={passwordForm.old_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
            placeholder="Current password" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
          <input
            type="password" required value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            placeholder="New password" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
          <button
            type="submit" disabled={savingPassword}
            className="sm:col-span-2 border border-purple-200 text-brand-purple-dark font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <FaLock /> {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
