import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaFilter, FaTimes } from 'react-icons/fa'
import * as productService from '../services/productService'
import ProductCard from '../components/ProductCard'
import ProductGridSkeleton from '../components/ui/ProductGridSkeleton'
import EmptyState from '../components/ui/EmptyState'
import useDebounce from '../hooks/useDebounce'

const OCCASIONS = [
  ['birthday', 'Birthday'], ['anniversary', 'Anniversary'], ['wedding', 'Wedding'],
  ['graduation', 'Graduation'], ['valentine', "Valentine's Day"], ['christmas', 'Christmas'],
  ['mothers_day', "Mother's Day"], ['fathers_day', "Father's Day"], ['baby_shower', 'Baby Shower'],
  ['general', 'General'],
]
const GENDERS = [['male', 'Male'], ['female', 'Female'], ['unisex', 'Unisex'], ['kids', 'Kids']]
const SORT_OPTIONS = [
  ['-created_at', 'Newest'], ['price', 'Price: Low to High'], ['-price', 'Price: High to Low'],
  ['-rating', 'Top Rated'], ['name', 'Name: A-Z'],
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchInput, 400)

  const category = searchParams.get('category') || ''
  const occasion = searchParams.get('occasion') || ''
  const gender = searchParams.get('gender') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const ordering = searchParams.get('ordering') || '-created_at'

  useEffect(() => {
    productService.getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('search') || '')) {
      updateParam('search', debouncedSearch)
    }
  }, [debouncedSearch])

  useEffect(() => {
    setLoading(true)
    const params = {
      page,
      search: searchParams.get('search') || undefined,
      category: category || undefined,
      occasion: occasion || undefined,
      gender: gender || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      ordering,
    }
    productService
      .getProducts(params)
      .then((data) => {
        setProducts(data.results)
        setCount(data.count)
      })
      .finally(() => setLoading(false))
  }, [searchParams, page])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
    setPage(1)
  }

  const activeFilterCount = [category, occasion, gender, minPrice, maxPrice].filter(Boolean).length
  const totalPages = Math.ceil(count / 12) || 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Shop All Gifts</h1>
          <p className="text-gray-500 mt-1">{count} gifts found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 bg-white border border-purple-100 rounded-full px-4 py-2 text-sm font-medium"
        >
          <FaFilter /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block bg-white rounded-2xl border border-purple-50 shadow-sm p-5 h-fit space-y-6`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-brand-purple flex items-center gap-1">
                <FaTimes /> Clear all
              </button>
            )}
          </div>

          <div>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2.5 rounded-xl bg-purple-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-light"
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.slug}
                    onChange={() => updateParam('category', cat.slug)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Occasion</h4>
            <select
              value={occasion}
              onChange={(e) => updateParam('occasion', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-purple-50 text-sm focus:outline-none"
            >
              <option value="">All occasions</option>
              {OCCASIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Gender</h4>
            <select
              value={gender}
              onChange={(e) => updateParam('gender', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-purple-50 text-sm focus:outline-none"
            >
              <option value="">Any</option>
              {GENDERS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Range (KSh)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => updateParam('min_price', e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 rounded-xl bg-purple-50 text-sm focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => updateParam('max_price', e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 rounded-xl bg-purple-50 text-sm focus:outline-none"
              />
            </div>
          </div>
        </aside>

        <div>
          <div className="flex justify-end mb-4">
            <select
              value={ordering}
              onChange={(e) => updateParam('ordering', e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-purple-100 text-sm focus:outline-none"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState title="No gifts found" message="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-full text-sm font-medium ${
                        page === i + 1 ? 'btn-accent' : 'bg-white border border-purple-100 text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
