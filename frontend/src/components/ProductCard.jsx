import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    addItem(product, 1).catch(() => toast.error('Could not add to cart'))
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggleWishlist(product).catch(() => toast.error('Could not update wishlist'))
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-purple-50 overflow-hidden"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-purple-50">
          <img
            src={product.image || 'https://placehold.co/500x500?text=GiftGenius'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.is_trending && (
            <span className="absolute top-3 left-3 bg-brand-pink text-white text-[11px] font-semibold px-2 py-1 rounded-full">
              Trending
            </span>
          )}
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur bg-white/80 shadow transition-colors ${
              wishlisted ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-pink'
            }`}
          >
            <FaHeart />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-brand-purple font-semibold mb-1">
            {product.category_name}
          </p>
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
            <FaStar />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span className="text-gray-400">({product.rating_count})</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-display font-bold text-brand-purple-dark">
              KSh {Number(product.price).toLocaleString()}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-9 h-9 rounded-full btn-accent flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity"
              aria-label="Add to cart"
            >
              <FaShoppingCart className="text-sm" />
            </button>
          </div>
          {product.stock === 0 && <p className="text-xs text-red-500 mt-1">Out of stock</p>}
        </div>
      </Link>
    </motion.div>
  )
}
