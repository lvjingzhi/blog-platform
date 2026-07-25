import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const username = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function initFromStorage() {
    const saved = localStorage.getItem('blog_admin_token')
    const savedUser = localStorage.getItem('blog_admin_user')

    if (saved) {
      token.value = saved
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }

    if (savedUser) {
      username.value = savedUser
    }

    if (token.value) {
      checkAuth().catch(() => {
        logout()
      })
    }
  }

  async function login(credentials) {
    const { data } = await axios.post('/api/auth/login', credentials)
    token.value = data.token
    username.value = data.username
    localStorage.setItem('blog_admin_token', data.token)
    localStorage.setItem('blog_admin_user', data.username)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  function logout() {
    token.value = null
    username.value = null
    localStorage.removeItem('blog_admin_token')
    localStorage.removeItem('blog_admin_user')
    delete axios.defaults.headers.common['Authorization']
    router.push('/admin/login')
  }

  async function checkAuth() {
    const { data } = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    username.value = data.username
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    return data
  }

  return { token, username, isAuthenticated, initFromStorage, login, logout, checkAuth }
})