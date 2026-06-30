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
  stock: 0, image_url: '', min_age: 0, max_age: 100,
}

export default function VendorProductFormModal({ product, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, description: product.description, price: product.price,
        category: product.category, occasion: product.occasion, gender: product.gender,
        stock: product.stock, image_url: product.image_url || '',
        min_age: product.min_age, max_age: product.max_age,
      })
    } else {
      setForm({ ...emptyForm, category: categories[0]?.id || '' })
    }
  }, [product, categories])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
          <h2 className="text-xl font-display font-bold text-gray-900">{product ? 'Edit Product' : 'List New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
        </div>

        {product && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4">
            Editing this listing will send it back for admin re-review before it's visible to shoppers again.
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

          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-purple-100 text-gray-600 font-semibold py-3 rounded-full">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-accent font-semibold py-3 rounded-full hover:opacity-90 transition-opacity">
              {product ? 'Save Changes' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
