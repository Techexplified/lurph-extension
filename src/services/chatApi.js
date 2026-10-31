import axiosInstance from '../lib/axiosInstance.js'

export async function sendChatMessage(payload) {
  const { data } = await axiosInstance.post('/api/chat/completions', payload, {
    timeout: 120000,
  })
  return data
}
