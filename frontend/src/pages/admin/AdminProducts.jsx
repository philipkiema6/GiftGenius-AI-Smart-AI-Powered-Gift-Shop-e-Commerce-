import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaCheck, FaClock } from 'react-icons/fa'
import * as productService from '../../services/productService'
import ProductFormModal from '../../components/admin/ProductFormModal'
import Spinner from '../../components/ui/Spinner'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [pendingOnly, setPendingOnly] = useState(false)

  const loadProducts = () =>
    productService.getProducts({ page_size: 100 }).then((data) => setProducts(data.results ?? data))

  const visibleProducts = useMemo(
    () => (pendingOnly ? products.filter((p) => !p.is_approved) : products),
    [products, pendingOnly]
  )
  const pendingCount = useMemo(() => products.filter((p) => !p.is_approved).length, [products])

  useEffect(() => {
    Promise.all([loadProducts(), productService.getCategories().then(setCategories)]).finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleSubmit = async (form) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.slug, form)
        toast.success('Product updated')
      } else {
        await productService.createProduct(form)
        toast.success('Product created')
      }
      setModalOpen(false)
      loadProducts()
    } catch {
      toast.error('Could not save product')
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    await productService.deleteProduct(product.slug)
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
    toast.success('Product deleted')
  }

  const handleApprove = async (product) => {
    try {
      await productService.updateProduct(product.slug, { is_approved: true })
      toast.success(`${product.name} approved`)
      loadProducts()
    } catch {
      toast.error('Could not approve product')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPendingOnly((v) => !v)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full border transition-colors ${
              pendingOnly ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-gray-600 border-purple-100'
            }`}
          >
            <FaClock /> Pending review {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 btn-accent text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity">
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-purple-50/60 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr key={product.id} className="border-t border-purple-50">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img src={product.image || 'https://placehold.co/40x40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-purple-50" />
                  <span className="font-medium text-gray-800 line-clamp-1">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{product.category_name}</td>
                <td className="px-4 py-3 text-gray-600">{product.company_name || <span className="text-gray-300">Store</span>}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">KSh {Number(product.price).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={product.stock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-600'}>{product.stock}</span>
                </td>
                <td className="px-4 py-3">
                  {product.is_approved ? (
                    <span className="text-xs font-semibold text-emerald-600">Live</span>
                  ) : (
                    <button onClick={() => handleApprove(product)} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-emerald-600">
                      <FaCheck /> Approve
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(product)} className="text-brand-purple hover:text-brand-purple-dark p-1.5"><FaEdit /></button>
                  <button onClick={() => handleDelete(product)} className="text-red-400 hover:text-red-600 p-1.5"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
