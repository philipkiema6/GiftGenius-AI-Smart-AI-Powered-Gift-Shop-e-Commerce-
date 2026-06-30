import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FaStore, FaBoxOpen, FaExclamationTriangle, FaCheckCircle, FaShoppingBag, FaMoneyCheckAlt } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import * as vendorService from '../services/vendorService'

const LINKS = [
  { to: '/vendor', label: 'Company Profile', icon: <FaStore />, end: true },
  { to: '/vendor/products', label: 'My Products', icon: <FaBoxOpen /> },
  { to: '/vendor/sales', label: 'Sales', icon: <FaShoppingBag /> },
  { to: '/vendor/earnings', label: 'Earnings', icon: <FaMoneyCheckAlt /> },
]

const STATUS_BANNER = {
  pending: {
    icon: <FaExclamationTriangle />,
    className: 'bg-amber-50 border-amber-200 text-amber-700',
    message: "Your company is pending admin approval. You'll be able to list products once approved.",
  },
  rejected: {
    icon: <FaExclamationTriangle />,
    className: 'bg-red-50 border-red-200 text-red-700',
    message: 'Your company application was rejected. Contact support for more details.',
  },
  approved: {
    icon: <FaCheckCircle />,
    className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    message: 'Your company is approved! You can now list products for review.',
  },
}

export default function VendorLayout() {
  const [company, setCompany] = useState(null)

  useEffect(() => {
    vendorService.getCompanyProfile().then(setCompany).catch(() => {})
  }, [])

  const banner = company ? STATUS_BANNER[company.status] : null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {banner && (
          <div className={`flex items-center gap-3 border rounded-2xl p-4 mb-6 text-sm font-medium ${banner.className}`}>
            {banner.icon}
            {banner.message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 h-fit">
            <nav className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-purple-100 text-brand-purple-dark' : 'text-gray-600 hover:bg-purple-50'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <section>
            <Outlet context={{ company, setCompany }} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
