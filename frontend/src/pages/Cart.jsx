import { Link } from 'react-router-dom'
import { FaTrash, FaShoppingBag, FaArrowRight } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

export default function Cart() {
  const { items, loading, total, updateQuantity, removeItem, clearCart } = useCart()

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<FaShoppingBag />}
        title="Your cart is empty"
        message="Browse our gift collection or try the AI Gift Finder to discover something special."
        actionLabel="Shop Gifts"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl border border-purple-50 shadow-sm p-4">
              <img
                src={item.product.image || 'https://placehold.co/100x100?text=Gift'}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover bg-purple-50"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                <p className="text-brand-purple-dark font-semibold mt-1">
                  KSh {Number(item.product.price).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center border border-purple-100 rounded-full">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 text-gray-500">-</button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 text-gray-500">+</button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-2">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal</span>
            <span>KSh {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg border-t border-purple-50 pt-4 mb-6">
            <span>Total</span>
            <span>KSh {total.toLocaleString()}</span>
          </div>
          <Link
            to="/checkout"
            className="w-full btn-accent font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  )
}
