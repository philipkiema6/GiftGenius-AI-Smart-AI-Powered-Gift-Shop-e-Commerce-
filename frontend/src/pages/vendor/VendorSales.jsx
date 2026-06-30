import { useEffect, useState } from 'react'
import { FaShoppingBag } from 'react-icons/fa'
import * as vendorService from '../../services/vendorService'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const STATUS_LABELS = {
  paid: 'Paid',
  processing: 'Processing',
  completed: 'Completed',
}

const STATUS_STYLES = {
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

export default function VendorSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorService.getVendorSales().then(setSales).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0)
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.subtotal), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Sales</h1>
        <span className="text-sm font-semibold bg-purple-50 text-brand-purple-dark px-4 py-2 rounded-full">
          {totalUnits} units · KSh {totalRevenue.toLocaleString()} gross
        </span>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={<FaShoppingBag />}
          title="No sales yet"
          message="Items from your listings show up here once a customer's payment for them clears."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50/60 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-purple-50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{sale.order_id}</td>
                  <td className="px-4 py-3 text-gray-700">{sale.product_name}</td>
                  <td className="px-4 py-3 text-gray-600">{sale.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">KSh {Number(sale.price).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">KSh {Number(sale.subtotal).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(sale.order_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[sale.order_status]}`}>
                      {STATUS_LABELS[sale.order_status] || sale.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
