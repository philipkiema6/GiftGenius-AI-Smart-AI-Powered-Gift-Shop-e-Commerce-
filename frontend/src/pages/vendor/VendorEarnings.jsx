import { useEffect, useState } from 'react'
import { FaMoneyCheckAlt } from 'react-icons/fa'
import * as paymentService from '../../services/paymentService'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const STATUS_STYLES = {
  owed: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
}

export default function VendorEarnings() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentService.getMyPayouts().then(setPayouts).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const totalOwed = payouts.filter((p) => p.status === 'owed').reduce((sum, p) => sum + Number(p.net_amount), 0)
  const totalPaid = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.net_amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-gray-900">Earnings</h1>
        <div className="flex gap-2">
          <span className="text-sm font-semibold bg-amber-50 text-amber-700 px-4 py-2 rounded-full">
            KSh {totalOwed.toLocaleString()} owed to you
          </span>
          <span className="text-sm font-semibold bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
            KSh {totalPaid.toLocaleString()} received
          </span>
        </div>
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon={<FaMoneyCheckAlt />}
          title="No earnings yet"
          message="Once a customer's payment for one of your products clears, your share appears here - the admin releases it to your M-Pesa or PayPal."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50/60 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Your Share</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-t border-purple-50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{payout.order_id}</td>
                  <td className="px-4 py-3 text-gray-600">KSh {Number(payout.gross_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">
                    KSh {Number(payout.commission_amount).toLocaleString()} ({Number(payout.commission_percent)}%)
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">KSh {Number(payout.net_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600 uppercase text-xs">{payout.payout_method}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[payout.status]}`}>
                      {payout.status}
                    </span>
                    {payout.status === 'failed' && payout.failure_reason && (
                      <p className="text-[11px] text-red-500 mt-1 max-w-[180px]">{payout.failure_reason}</p>
                    )}
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
