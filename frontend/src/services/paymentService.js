import api from './api'

export const getPaymentStatus = (orderId) => api.get(`/payments/status/${orderId}/`).then((r) => r.data)
export const capturePaypalOrder = (orderId) =>
  api.post('/payments/paypal/capture/', { order: orderId }).then((r) => r.data)

// Admin
export const getVendorPayouts = (statusFilter) =>
  api.get('/payments/vendor-payouts/', { params: statusFilter ? { status: statusFilter } : {} }).then((r) => r.data)
export const payVendorPayout = (id) => api.post(`/payments/vendor-payouts/${id}/pay/`).then((r) => r.data)

// Vendor's own earnings
export const getMyPayouts = () => api.get('/payments/my-payouts/').then((r) => r.data)
