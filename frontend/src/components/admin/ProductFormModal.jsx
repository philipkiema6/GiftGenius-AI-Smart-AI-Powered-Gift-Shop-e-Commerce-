import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

const OCCASIONS = [
  'birthday', 'anniversary', 'wedding', 'graduation', 'valentine',
  'christmas', 'mothers_day', 'fathers_day', 'baby_shower', 'general',
]
const GENDERS = ['male', 'female', 'unisex', 'kids']

const emptyForm = {
  name: '', description: '', price: '', category: '', occasion: 'general', gender: 'unisex',
  stock: 0, image_url: '', rating: 0, min_age: 0, max_age: 100, is_trending: false, is_featured: false,
  is_approved: true,
}

export default function ProductFormModal({ product, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, description: product.description, price: product.price,
        category: product.category, occasion: product.occasion, gender: product.gender,
        stock: product.stock, image_url: product.image_url || '', rating: product.rating,
        min_age: product.min_age, max_age: product.max_age,
        is_trending: product.is_trending, is_featured: product.is_featured,
        is_approved: product.is_approved,
      })
    } else {
      setForm({ ...emptyForm, category: categories[0]?.id || '' })
    }
  }, [product, categories])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-gray-900">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
        </div>

        {product?.company_name && (
          <p className="text-xs text-gray-500 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2 mb-4">
            Supplied by vendor: <span className="font-semibold">{product.company_name}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="name" required value={form.name} onChange={handleChange} placeholder="Product name" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none sm:col-span-2" />
          <textarea name="description" required value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none sm:col-span-2 resize-none" />
          <input type="number" step="0.01" name="price" required value={form.price} onChange={handleChange} placeholder="Price (KSh)" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none" />
          <input type="number" name="stock" required value={form.stock} onChange={handleChange} placeholder="Stock quantity" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none" />
          <select name="category" required value={form.category} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="occasion" value={form.occasion} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none">
            {OCCASIONS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
          </select>
          <select name="gender" value={form.gender} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none">
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="url" name="image_url" value={form.image_url} onChange={handleChange} placeholder="Image URL" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none" />
          <input type="number" min="0" max="120" name="min_age" value={form.min_age} onChange={handleChange} placeholder="Min age" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none" />
          <input type="number" min="0" max="120" name="max_age" value={form.max_age} onChange={handleChange} placeholder="Max age" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none" />
          <input type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={handleChange} placeholder="Rating (0-5)" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none" />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="is_trending" checked={form.is_trending} onChange={handleChange} /> Trending
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="is_approved" checked={form.is_approved} onChange={handleChange} /> Approved (visible to shoppers)
          </label>

          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-purple-100 text-gray-600 font-semibold py-3 rounded-full">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-accent font-semibold py-3 rounded-full hover:opacity-90 transition-opacity">
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
