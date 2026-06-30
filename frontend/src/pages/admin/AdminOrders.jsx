import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as orderService from '../../services/orderService'
import Spinner from '../../components/ui/Spinner'

const STATUSES = ['awaiting_payment', 'payment_failed', 'paid', 'processing', 'completed', 'cancelled']
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrders(true).then((data) => setOrders(data.results ?? data)).finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (order, status) => {
    try {
      const updated = await orderService.updateOrderStatus(order.id, status)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
      toast.success(`Order #${order.id} marked as ${status}`)
    } catch {
      toast.error('Could not update order status')
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
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Orders</h1>
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-purple-50/60 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-purple-50">
                <td className="px-4 py-3 font-medium text-gray-800">#{order.id}</td>
                <td className="px-4 py-3 text-gray-600">{order.username}</td>
                <td className="px-4 py-3 font-medium text-gray-800">KSh {Number(order.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600 uppercase text-xs">{order.payment_method}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
