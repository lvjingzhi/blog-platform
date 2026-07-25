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

  async function register(data) {
    const { data: res } = await axios.post('/api/reader/register', data)
    token.value = res.token
    reader.value = res.reader
    localStorage.setItem('blog_reader_token', res.token)
    localStorage.setItem('blog_reader_info', JSON.stringify(res.reader))
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.token}`
    return res
  }

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

  return { token, reader, isAuthenticated, initFromStorage, register, login, logout, checkAuth }
})