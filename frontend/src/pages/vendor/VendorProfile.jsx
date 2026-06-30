import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaSave } from 'react-icons/fa'
import * as vendorService from '../../services/vendorService'
import Spinner from '../../components/ui/Spinner'

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function VendorProfile() {
  const { company, setCompany } = useOutletContext()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        description: company.description,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        logo_url: company.logo_url,
        payout_method: company.payout_method || 'mpesa',
        mpesa_phone: company.mpesa_phone || '',
        paypal_email: company.paypal_email || '',
      })
    }
  }, [company])

  if (!form) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await vendorService.updateCompanyProfile(form)
      setCompany(updated)
      toast.success('Company profile updated')
    } catch {
      toast.error('Could not update company profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Company Profile</h1>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_BADGE[company.status]}`}>
          {company.status}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Company name" className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <textarea
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description" rows={3} className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none resize-none"
        />
        <input
          type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          placeholder="Contact email" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          placeholder="Contact phone" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />
        <input
          value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          placeholder="Logo URL (optional)" className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        />

        <div className="sm:col-span-2 border-t border-purple-50 pt-4 mt-1">
          <h3 className="font-semibold text-gray-900 mb-1">Payout Details</h3>
          <p className="text-xs text-gray-400 mb-3">
            Where your share of each sale (after the platform commission) is sent when the admin releases a payout.
          </p>
        </div>
        <select
          value={form.payout_method} onChange={(e) => setForm({ ...form, payout_method: e.target.value })}
          className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
        >
          <option value="mpesa">M-Pesa</option>
          <option value="paypal">PayPal</option>
        </select>
        {form.payout_method === 'mpesa' ? (
          <input
            value={form.mpesa_phone} onChange={(e) => setForm({ ...form, mpesa_phone: e.target.value })}
            placeholder="M-Pesa phone, e.g. 0712345678" className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
        ) : (
          <input
            type="email" value={form.paypal_email} onChange={(e) => setForm({ ...form, paypal_email: e.target.value })}
            placeholder="PayPal email" className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
        )}

        <button
          type="submit" disabled={saving}
          className="sm:col-span-2 btn-accent font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
