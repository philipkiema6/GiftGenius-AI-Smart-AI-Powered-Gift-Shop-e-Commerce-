import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaClock, FaCheckCircle } from 'react-icons/fa'
import * as vendorService from '../../services/vendorService'
import * as productService from '../../services/productService'
import VendorProductFormModal from '../../components/vendor/VendorProductFormModal'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

export default function VendorProducts() {
  const { company } = useOutletContext()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const loadProducts = () => vendorService.getVendorProducts().then(setProducts)

  useEffect(() => {
    Promise.all([loadProducts(), productService.getCategories().then(setCategories)]).finally(() => setLoading(false))
  }, [])

  const isApproved = company?.status === 'approved'

  const openCreate = () => {
    if (!isApproved) {
      toast.error('Your company must be approved before you can list products.')
      return
    }
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
        await vendorService.updateVendorProduct(editingProduct.id, form)
        toast.success('Listing updated and sent for re-review')
      } else {
        await vendorService.createVendorProduct(form)
        toast.success('Product submitted for admin review')
      }
      setModalOpen(false)
      loadProducts()
    } catch (err) {
      const data = err.response?.data
      toast.error(data ? Object.values(data).flat()[0] : 'Could not save product')
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}"?`)) return
    await vendorService.deleteVendorProduct(product.id)
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
    toast.success('Product removed')
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
        <h1 className="text-2xl font-display font-bold text-gray-900">My Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 btn-accent text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <FaPlus /> List Product
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products listed yet"
          message={isApproved ? 'Click "List Product" to submit your first item for review.' : 'Once your company is approved, you can start listing products here.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50/60 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-purple-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-gray-800">KSh {Number(product.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    {product.is_approved ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <FaCheckCircle /> Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                        <FaClock /> Pending review
                      </span>
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
      )}

      {modalOpen && (
        <VendorProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
