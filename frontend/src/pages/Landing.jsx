import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaGem, FaSeedling, FaPenFancy, FaLaptop, FaGifts, FaQuoteLeft, FaArrowRight,
} from 'react-icons/fa'
import * as productService from '../services/productService'
import ProductCard from '../components/ProductCard'
import ProductGridSkeleton from '../components/ui/ProductGridSkeleton'
import HeroCarousel from '../components/HeroCarousel'

const CATEGORY_ICONS = {
  jewelry: <FaGem />,
  flowers: <FaSeedling />,
  personalized: <FaPenFancy />,
  electronics: <FaLaptop />,
  'gift-box': <FaGifts />,
}

const TESTIMONIALS = [
  {
    name: 'Wanjiru K.',
    role: 'Happy Customer',
    quote: 'The AI Gift Finder found the perfect birthday gift for my sister in under a minute. She loved it!',
  },
  {
    name: 'Brian O.',
    role: 'Repeat Buyer',
    quote: "I never know what to get for anniversaries. GiftGenius AI takes the guesswork out completely.",
  },
  {
    name: 'Amina H.',
    role: 'Verified Buyer',
    quote: 'Fast delivery, beautiful packaging, and the recommendations actually made sense for my budget.',
  },
]

export default function Landing() {
  const [trending, setTrending] = useState([])
  const [categories, setCategories] = useState([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([productService.getTrending(), productService.getCategories()])
      .then(([trendingData, categoryData]) => {
        setTrending(trendingData)
        setCategories(categoryData.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <div>
      {/* Hero */}
      <HeroCarousel />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Curated gift categories for every kind of person</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-purple-50 shadow-sm hover:shadow-lg p-6 text-center transition-shadow"
              >
                <span className="w-12 h-12 rounded-full gradient-brand text-white flex items-center justify-center text-xl">
                  {CATEGORY_ICONS[cat.slug] || <FaGifts />}
                </span>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="bg-purple-50/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900">Trending Gifts</h2>
              <p className="text-gray-500 mt-2">What everyone's adding to their cart this week</p>
            </div>
            <Link to="/products" className="text-brand-purple font-semibold hidden sm:flex items-center gap-1 hover:gap-2 transition-all">
              View all <FaArrowRight />
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-gray-900">Loved by Gift-Givers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6"
            >
              <FaQuoteLeft className="text-brand-pink text-xl mb-3" />
              <p className="text-gray-600 text-sm mb-4">{t.quote}</p>
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-400">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA + Newsletter */}
      <section className="gradient-brand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-3">Never run out of gift ideas again</h2>
          <p className="text-purple-100 mb-8">Subscribe for fresh, AI-curated gift ideas every month.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none"
            />
            <button type="submit" className="btn-accent font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
