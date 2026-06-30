import api from './api'

export const registerVendor = (payload) => api.post('/vendors/register/', payload).then((r) => r.data)
export const getCompanyProfile = () => api.get('/vendors/me/').then((r) => r.data)
export const updateCompanyProfile = (payload) => api.patch('/vendors/me/', payload).then((r) => r.data)

export const getVendorProducts = () => api.get('/vendors/products/').then((r) => r.data)
export const createVendorProduct = (payload) => api.post('/vendors/products/', payload).then((r) => r.data)
export const updateVendorProduct = (id, payload) => api.patch(`/vendors/products/${id}/`, payload).then((r) => r.data)
export const deleteVendorProduct = (id) => api.delete(`/vendors/products/${id}/`)

export const getVendorSales = () => api.get('/vendors/sales/').then((r) => r.data)

// Admin-only
export const adminListCompanies = () => api.get('/vendors/companies/').then((r) => r.data)
export const adminUpdateCompanyStatus = (id, status) =>
  api.patch(`/vendors/companies/${id}/status/`, { status }).then((r) => r.data)
