import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useReaderAuthStore = defineStore('readerAuth', () => {
  const token = ref(null)
  const reader = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function initFromStorage() {
    const saved = localStorage.getItem('blog_reader_token')
    if (saved) {
      token.value = saved
      // Set default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      // Verify token is still valid
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
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.token}`
    return res
  }

  async function login(data) {
    const { data: res } = await axios.post('/api/reader/login', data)
    token.value = res.token
    reader.value = res.reader
    localStorage.setItem('blog_reader_token', res.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.token}`
    return res
  }

  function logout() {
    token.value = null
    reader.value = null
    localStorage.removeItem('blog_reader_token')
    delete axios.defaults.headers.common['Authorization']
  }

  async function checkAuth() {
    const { data } = await axios.get('/api/reader/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    reader.value = data.reader
    return data
  }

  return { token, reader, isAuthenticated, initFromStorage, register, login, logout, checkAuth }
})