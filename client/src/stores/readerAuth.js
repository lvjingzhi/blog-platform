import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useReaderAuthStore = defineStore('readerAuth', () => {
  const token = ref(null)
  const reader = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  // 🔑 页面加载时立即从 localStorage 恢复登录状态
  function initFromStorage() {
    const saved = localStorage.getItem('blog_reader_token')
    const savedReader = localStorage.getItem('blog_reader_info')

    if (saved) {
      token.value = saved
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }

    if (savedReader) {
      try {
        reader.value = JSON.parse(savedReader)
      } catch {
        // ignore
      }
    }

    // 后台验证 token 是否仍然有效
    if (token.value) {
      checkAuth().catch(() => {
        logout()
      })
    }
  }

  /**
   * 注册 → 不再直接返回 JWT，而是返回提示信息
   */
  async function register(data) {
    const { data: res } = await axios.post('/api/reader/register', data)
    // 注册成功后不自动登录，需要验证邮箱
    return res
  }

  /**
   * 登录
   */
  async function login(data) {
    const { data: res } = await axios.post('/api/reader/login', data)
    token.value = res.token
    reader.value = res.reader
    localStorage.setItem('blog_reader_token', res.token)
    localStorage.setItem('blog_reader_info', JSON.stringify(res.reader))
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.token}`
    return res
  }

  function logout() {
    token.value = null
    reader.value = null
    localStorage.removeItem('blog_reader_token')
    localStorage.removeItem('blog_reader_info')
    delete axios.defaults.headers.common['Authorization']
  }

  async function checkAuth() {
    const { data } = await axios.get('/api/reader/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    reader.value = data.reader
    localStorage.setItem('blog_reader_info', JSON.stringify(data.reader))
    return data
  }

  /**
   * 验证邮箱 → 返回 JWT 自动登录
   */
  async function verifyEmail(token) {
    const { data } = await axios.get(`/api/reader/verify-email/${token}`)
    // 验证成功后自动登录
    token.value = data.token
    reader.value = data.reader
    localStorage.setItem('blog_reader_token', data.token)
    localStorage.setItem('blog_reader_info', JSON.stringify(data.reader))
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  /**
   * 重新发送验证邮件
   */
  async function resendVerification(email) {
    const { data } = await axios.post('/api/reader/resend-verification', { email })
    return data
  }

  /**
   * 忘记密码 → 发送重置邮件
   */
  async function forgotPassword(email) {
    const { data } = await axios.post('/api/reader/forgot-password', { email })
    return data
  }

  /**
   * 重置密码
   */
  async function resetPassword(token, newPassword) {
    const { data } = await axios.post('/api/reader/reset-password', { token, newPassword })
    return data
  }

  return {
    token, reader, isAuthenticated,
    initFromStorage, register, login, logout, checkAuth,
    verifyEmail, resendVerification, forgotPassword, resetPassword,
  }
})