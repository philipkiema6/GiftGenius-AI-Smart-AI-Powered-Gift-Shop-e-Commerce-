import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import toast from 'react-hot-toast'
import { FaMobileAlt, FaPaypal, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'
import * as orderService from '../services/orderService'
import * as paymentService from '../services/paymentService'
import { getErrorMessage } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const initialForm = { full_name: '', phone_number: '', address: '', city: '', notes: '', payment_method: 'mpesa' }
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

export default function Checkout() {
  const { items, total, refreshFromBackend } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...initialForm, full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() })
  const [loading, setLoading] = useState(false)
  // 'form' -> 'awaiting_mpesa' | 'awaiting_paypal' -> 'success' | 'failed'
  const [phase, setPhase] = useState('form')
  const [order, setOrder] = useState(null)
  const [paypalOrderId, setPaypalOrderId] = useState(null)
  const [failureReason, setFailureReason] = useState('')
  const pollRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const pollMpesaStatus = (orderId) => {
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts += 1
      try {
        const payment = await paymentService.getPaymentStatus(orderId)
        if (payment.status === 'completed') {
          clearInterval(pollRef.current)
          setPhase('success')
          refreshFromBackend().catch(() => {})
        } else if (payment.status === 'failed' || payment.status === 'cancelled') {
          clearInterval(pollRef.current)
          setFailureReason(payment.failure_reason || 'Payment was not completed.')
          setPhase('failed')
        } else if (attempts >= 30) {
          clearInterval(pollRef.current)
          setFailureReason('We did not receive confirmation in time. Check your phone or try again.')
          setPhase('failed')
        }
      } catch {
        // a single failed poll is not fatal - keep trying until the attempt cap
      }
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setLoading(true)
    try {
      const data = await orderService.checkout(form)
      setOrder(data.order)
      if (form.payment_method === 'mpesa') {
        setPhase('awaiting_mpesa')
        pollMpesaStatus(data.order.id)
      } else {
        setPaypalOrderId(data.paypal_order_id)
        setPhase('awaiting_paypal')
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Checkout failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handlePaypalApprove = async () => {
    try {
      await paymentService.capturePaypalOrder(order.id)
      setPhase('success')
      refreshFromBackend().catch(() => {})
    } catch (err) {
      setFailureReason(getErrorMessage(err))
      setPhase('failed')
    }
  }

  const retry = () => {
    setPhase('form')
    setOrder(null)
    setPaypalOrderId(null)
    setFailureReason('')
  }

  if (phase === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FaCheckCircle className="text-6xl text-emerald-500 mx-auto mb-5" />
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Order #{order.id} for KSh {Number(order.total_amount).toLocaleString()} has been paid via{' '}
          {order.payment_method === 'mpesa' ? 'M-Pesa' : 'PayPal'}.
        </p>
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="btn-accent font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          View My Orders
        </button>
      </div>
    )
  }

  if (phase === 'failed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-5" />
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Payment Didn't Go Through</h1>
        <p className="text-gray-500 mb-6">{failureReason}</p>
        <button onClick={retry} className="btn-accent font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
          Try Again
        </button>
      </div>
    )
  }

  if (phase === 'awaiting_mpesa') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FaSpinner className="text-6xl text-brand-purple mx-auto mb-5 animate-spin" />
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Check Your Phone</h1>
        <p className="text-gray-500">
          We sent an M-Pesa prompt to {form.phone_number}. Enter your PIN to complete the
          KSh {Number(order?.total_amount).toLocaleString()} payment.
        </p>
      </div>
    )
  }

  if (phase === 'awaiting_paypal') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2 text-center">Complete with PayPal</h1>
        <p className="text-gray-500 text-center mb-6">
          Order #{order.id} - approve the payment below to finish checkout.
        </p>
        {PAYPAL_CLIENT_ID && !PAYPAL_CLIENT_ID.startsWith('REPLACE_') ? (
          <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
            <PayPalButtons
              createOrder={() => Promise.resolve(paypalOrderId)}
              onApprove={handlePaypalApprove}
              onError={() => {
                setFailureReason('PayPal could not process this payment.')
                setPhase('failed')
              }}
            />
          </PayPalScriptProvider>
        ) : (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            PayPal isn't configured yet - set VITE_PAYPAL_CLIENT_ID in frontend/.env.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
          <input
            name="full_name" required value={form.full_name} onChange={handleChange}
            placeholder="Full name" className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none"
          />
          <input
            name="phone_number" required value={form.phone_number} onChange={handleChange}
            placeholder={form.payment_method === 'mpesa' ? 'M-Pesa phone, e.g. 0712345678' : 'Phone number'}
            className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none"
          />
          <input
            name="address" required value={form.address} onChange={handleChange}
            placeholder="Delivery address" className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none"
          />
          <input
            name="city" required value={form.city} onChange={handleChange}
            placeholder="City / Town" className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none"
          />
          <textarea
            name="notes" value={form.notes} onChange={handleChange}
            placeholder="Delivery notes (optional)" rows={3}
            className="w-full px-4 py-3 rounded-xl bg-purple-50 focus:outline-none resize-none"
          />

          <h3 className="font-semibold text-gray-900 pt-2">Payment Method</h3>
          <p className="text-xs text-gray-400">Payment is required up front - there is no pay-on-delivery option.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${form.payment_method === 'mpesa' ? 'border-brand-purple bg-purple-50' : 'border-purple-100'}`}>
              <input type="radio" name="payment_method" value="mpesa" checked={form.payment_method === 'mpesa'} onChange={handleChange} className="hidden" />
              <FaMobileAlt className="text-emerald-600" />
              <span className="text-sm font-medium">M-Pesa</span>
            </label>
            <label className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${form.payment_method === 'paypal' ? 'border-brand-purple bg-purple-50' : 'border-purple-100'}`}>
              <input type="radio" name="payment_method" value="paypal" checked={form.payment_method === 'paypal'} onChange={handleChange} className="hidden" />
              <FaPaypal className="text-blue-600" />
              <span className="text-sm font-medium">PayPal</span>
            </label>
          </div>
          {form.payment_method === 'mpesa' ? (
            <p className="text-xs text-gray-500 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              You'll get an M-Pesa STK push prompt on your phone to enter your PIN and confirm payment.
            </p>
          ) : (
            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              You'll be shown PayPal's checkout button next to approve the payment (charged in USD).
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent font-semibold py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Starting payment...' : `Pay KSh ${total.toLocaleString()}`}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 line-clamp-1">{item.product.name} x{item.quantity}</span>
                <span className="font-medium text-gray-800">
                  KSh {(Number(item.product.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-display font-bold text-lg border-t border-purple-50 pt-4 mt-4">
            <span>Total</span>
            <span>KSh {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
