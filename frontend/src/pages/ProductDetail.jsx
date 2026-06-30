import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaHeart, FaShoppingCart, FaStar, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import * as productService from '../services/productService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Spinner from '../components/ui/Spinner'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  useEffect(() => {
    setLoading(true)
    productService
      .getProduct(slug)
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-24 text-gray-500">Product not found.</div>
  }

  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = () => {
    addItem(product, quantity).catch(() => toast.error('Could not add to cart'))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-purple mb-6">
        <FaArrowLeft /> Back to all gifts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-purple-50 rounded-2xl overflow-hidden aspect-square">
          <img
            src={product.image || 'https://placehold.co/600x600?text=GiftGenius'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-brand-purple font-semibold mb-2">{product.category_name}</p>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4 text-amber-500">
            <FaStar /> <span className="font-medium">{Number(product.rating).toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({product.rating_count} reviews)</span>
          </div>
          <p className="text-3xl font-display font-bold text-brand-purple-dark mb-5">
            KSh {Number(product.price).toLocaleString()}
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <FaCheckCircle /> In stock ({product.stock} available)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                <FaTimesCircle /> Out of stock
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-purple-100 rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 text-lg text-gray-500">-</button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 text-lg text-gray-500">+</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-accent font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product).catch(() => toast.error('Could not update wishlist'))}
              className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
                wishlisted ? 'bg-orange-50 text-brand-pink border-orange-200' : 'border-purple-100 text-gray-500 hover:text-brand-pink'
              }`}
            >
              <FaHeart />
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-4 mt-8 text-sm border-t border-purple-50 pt-6">
            <div>
              <dt className="text-gray-400">Occasion</dt>
              <dd className="font-medium text-gray-800 capitalize">{product.occasion.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Gender</dt>
              <dd className="font-medium text-gray-800 capitalize">{product.gender}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Age Range</dt>
              <dd className="font-medium text-gray-800">{product.min_age} - {product.max_age} years</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
