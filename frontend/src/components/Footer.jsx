import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa'
import Logo from './Logo'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success("You're subscribed! Watch your inbox for gift ideas.")
    setEmail('')
  }

  return (
    <footer className="bg-[#131921] text-purple-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="mb-3">
            <Logo variant="light" />
          </div>
          <p className="text-sm text-purple-300">
            Discover the perfect gift for every person and every occasion, powered by smart recommendations.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-purple-300">
            <li><Link to="/products" className="hover:text-white">Shop All Gifts</Link></li>
            <li><Link to="/gift-finder" className="hover:text-white">AI Gift Finder</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">My Wishlist</Link></li>
            <li><Link to="/dashboard" className="hover:text-white">My Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Occasions</h4>
          <ul className="space-y-2 text-sm text-purple-300">
            <li><Link to="/products?occasion=birthday" className="hover:text-white">Birthdays</Link></li>
            <li><Link to="/products?occasion=anniversary" className="hover:text-white">Anniversaries</Link></li>
            <li><Link to="/products?occasion=wedding" className="hover:text-white">Weddings</Link></li>
            <li><Link to="/products?occasion=valentine" className="hover:text-white">Valentine's Day</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Stay in the loop</h4>
          <p className="text-sm text-purple-300 mb-3">Get gift ideas and exclusive offers in your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <div className="relative flex-1">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-8 pr-2 py-2 rounded-full text-sm text-gray-900 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-accent text-sm font-semibold px-4 py-2 rounded-full">
              Join
            </button>
          </form>
          <div className="flex gap-4 mt-4 text-purple-300">
            <a href="#" aria-label="Facebook" className="hover:text-white"><FaFacebook /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white"><FaInstagram /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><FaTwitter /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-purple-400 py-4">
        © {new Date().getFullYear()} GiftGenius AI. Final-year Computer Science project. All rights reserved.
      </div>
    </footer>
  )
}
