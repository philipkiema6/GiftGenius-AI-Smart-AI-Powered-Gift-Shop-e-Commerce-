import { useEffect, useState } from 'react'
import { FaBoxOpen } from 'react-icons/fa'
import * as orderService from '../services/orderService'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

const STATUS_LABELS = {
  awaiting_payment: 'Awaiting Payment',
  payment_failed: 'Payment Failed',
  paid: 'Paid',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_STYLES = {
  awaiting_payment: 'bg-amber-100 text-amber-700',
  payment_failed: 'bg-red-100 text-red-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function DashboardOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrders().then((data) => setOrders(data.results ?? data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<FaBoxOpen />}
        title="No orders yet"
        message="Your order history will show up here once you place your first order."
        actionLabel="Start Shopping"
        actionTo="/products"
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">Order #{order.id}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.product_detail?.name || 'Product'} x{item.quantity}</span>
                  <span>KSh {Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t border-purple-50 pt-3">
              <span>Total</span>
              <span>KSh {Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
