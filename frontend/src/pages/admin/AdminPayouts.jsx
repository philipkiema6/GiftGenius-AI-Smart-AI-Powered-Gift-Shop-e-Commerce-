import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaMoneyCheckAlt } from 'react-icons/fa'
import * as paymentService from '../../services/paymentService'
import { getErrorMessage } from '../../services/api'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const STATUS_STYLES = {
  owed: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)

  const load = () => paymentService.getVendorPayouts().then(setPayouts).finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const handlePay = async (payout) => {
    if (!window.confirm(`Release KSh ${Number(payout.net_amount).toLocaleString()} to ${payout.company_name} via ${payout.payout_method}?`)) return
    setPayingId(payout.id)
    try {
      const updated = await paymentService.payVendorPayout(payout.id)
      setPayouts((prev) => prev.map((p) => (p.id === payout.id ? updated : p)))
      toast.success(`Paid ${payout.company_name}`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Payout failed'))
      load()
    } finally {
      setPayingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const totalOwed = payouts.filter((p) => p.status === 'owed').reduce((sum, p) => sum + Number(p.net_amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Vendor Payouts</h1>
        <span className="text-sm font-semibold bg-amber-50 text-amber-700 px-4 py-2 rounded-full">
          KSh {totalOwed.toLocaleString()} currently owed
        </span>
      </div>

      {payouts.length === 0 ? (
        <EmptyState icon={<FaMoneyCheckAlt />} title="No payouts yet" message="Vendor payouts appear here once a sale of their product is paid for." />
      ) : (
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50/60 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Net Owed</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-t border-purple-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{payout.company_name}</td>
                  <td className="px-4 py-3 text-gray-600">#{payout.order_id}</td>
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
                  <td className="px-4 py-3 text-right">
                    {payout.status !== 'paid' && (
                      <button
                        onClick={() => handlePay(payout)}
                        disabled={payingId === payout.id}
                        className="text-xs font-semibold btn-accent px-4 py-2 rounded-full disabled:opacity-50"
                      >
                        {payingId === payout.id ? 'Paying...' : 'Pay Now'}
                      </button>
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
