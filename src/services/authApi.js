import axiosInstance from '../lib/axiosInstance.js'

export async function registerAccount(payload) {
  const { data } = await axiosInstance.post('/api/auth/register', payload)
  return data
}

export async function loginAccount(payload) {
  const { data } = await axiosInstance.post('/api/auth/login', payload)
  return data
}

export async function getCurrentUser() {
  const { data } = await axiosInstance.get('/api/auth/me')
  return data.user
}

export async function logoutAccount() {
  const { data } = await axiosInstance.post('/api/auth/logout')
  return data
}
