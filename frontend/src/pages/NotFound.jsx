import { Link } from 'react-router-dom'
import { FaGift } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <FaGift className="text-6xl text-purple-200 mb-5" />
      <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page wandered off looking for its own gift.</p>
      <Link to="/" className="btn-accent font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
        Back to Home
      </Link>
    </div>
  )
}
