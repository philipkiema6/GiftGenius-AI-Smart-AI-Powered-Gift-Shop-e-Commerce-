import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaMagic, FaShoppingCart, FaLightbulb, FaRedo } from 'react-icons/fa'
import * as recommendationService from '../services/recommendationService'
import { useCart } from '../context/CartContext'
import ProductGridSkeleton from '../components/ui/ProductGridSkeleton'
import EmptyState from '../components/ui/EmptyState'

const RELATIONSHIPS = [
  ['partner', 'Partner'], ['spouse', 'Spouse'], ['parent', 'Parent'], ['sibling', 'Sibling'],
  ['friend', 'Friend'], ['colleague', 'Colleague'], ['child', 'Child'],
]
const OCCASIONS = [
  ['birthday', 'Birthday'], ['anniversary', 'Anniversary'], ['wedding', 'Wedding'],
  ['graduation', 'Graduation'], ['valentine', "Valentine's Day"], ['christmas', 'Christmas'],
  ['mothers_day', "Mother's Day"], ['fathers_day', "Father's Day"], ['baby_shower', 'Baby Shower'],
  ['general', 'Just Because'],
]
const GENDERS = [['female', 'Female'], ['male', 'Male'], ['unisex', 'Doesn\'t matter'], ['kids', 'Kids']]

const initialForm = {
  age: 25, gender: 'female', relationship: 'friend', occasion: 'birthday', min_budget: 1000, max_budget: 5000,
}

export default function GiftFinder() {
  const [form, setForm] = useState(initialForm)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addItem } = useCart()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResults(null)
    try {
      const data = await recommendationService.getGiftRecommendations(form)
      setResults(data.recommendations)
      if (data.recommendations.length === 0) {
        toast('No exact matches — try widening your budget or occasion.', { icon: '🎁' })
      }
    } catch {
      toast.error('Could not generate recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setForm(initialForm)
    setResults(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-purple-100 text-brand-purple-dark px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <FaMagic /> AI Gift Finder
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
          Tell us about them, we'll find the gift
        </h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Answer five quick questions and our recommendation engine will suggest gifts tailored to the recipient.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Age</label>
          <input
            type="number" name="age" min="0" max="120" required
            value={form.age} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none">
            {GENDERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
          <select name="relationship" value={form.relationship} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none">
            {RELATIONSHIPS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Occasion</label>
          <select name="occasion" value={form.occasion} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none">
            {OCCASIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (KSh)</label>
          <div className="flex items-center gap-2">
            <input
              type="number" name="min_budget" min="0" required value={form.min_budget} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-purple-50 focus:outline-none text-sm"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number" name="max_budget" min="0" required value={form.max_budget} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-purple-50 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-5 flex justify-center gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-accent font-semibold px-8 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <FaMagic /> {loading ? 'Finding gifts...' : 'Find My Gift'}
          </button>
          {results && (
            <button type="button" onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-full border border-purple-100 text-gray-600 font-medium">
              <FaRedo /> Start Over
            </button>
          )}
        </div>
      </form>

      {loading && <ProductGridSkeleton count={4} />}

      <AnimatePresence>
        {results && !loading && (
          results.length === 0 ? (
            <EmptyState
              icon={<FaLightbulb />}
              title="No gifts matched those criteria"
              message="Try a wider budget range or a different occasion to see more suggestions."
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.map((rec, i) => (
                <motion.div
                  key={rec.product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden flex flex-col sm:flex-row"
                >
                  <img
                    src={rec.product.image || 'https://placehold.co/300x300?text=Gift'}
                    alt={rec.product.name}
                    className="w-full sm:w-40 h-40 object-cover"
                  />
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900">{rec.product.name}</h3>
                    <p className="font-display font-bold text-brand-purple-dark mt-1">
                      KSh {Number(rec.product.price).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rec.reasons.slice(0, 3).map((reason) => (
                        <span key={reason} className="text-[11px] bg-purple-50 text-brand-purple px-2 py-0.5 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => addItem(rec.product, 1).catch(() => toast.error('Could not add to cart'))}
                      className="mt-auto flex items-center justify-center gap-2 btn-accent text-sm font-semibold py-2 rounded-full mt-3 hover:opacity-90 transition-opacity"
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
