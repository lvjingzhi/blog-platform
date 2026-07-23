<template>
  <div class="reader-auth-page">
    <div class="auth-card">
      <div class="auth-tabs">
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="email" type="email" placeholder="请输入邮箱" required />
        </div>

        <div class="form-group" v-if="mode === 'register'">
          <label>昵称</label>
          <input v-model="nickname" type="text" placeholder="怎么称呼你？（可选）" />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="密码（至少6位）" required minlength="6" />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>

      <p class="auth-hint" v-if="mode === 'login'">
        还没有账号？<a href="#" @click.prevent="switchMode('register')">立即注册</a>
      </p>
      <p class="auth-hint" v-else>
        已有账号？<a href="#" @click.prevent="switchMode('login')">立即登录</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useReaderAuthStore } from '@/stores/readerAuth'

const router = useRouter()
const route = useRoute()
const authStore = useReaderAuthStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const nickname = ref('')
const loading = ref(false)
const error = ref('')

function switchMode(m) {
  mode.value = m
  error.value = ''
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    if (mode.value === 'register') {
      await authStore.register({
        email: email.value,
        password: password.value,
        nickname: nickname.value || undefined,
      })
    } else {
      await authStore.login({
        email: email.value,
        password: password.value,
      })
    }
    // Redirect to the page they came from, or home
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.error || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reader-auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.auth-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
}
.auth-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}
.auth-tabs button {
  flex: 1;
  padding: 0.6rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
  transition: all 0.2s;
}
.auth-tabs button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 600;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}
.form-group input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: #2563eb;
}
.error-msg {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  background: #fef2f2;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
}
.submit-btn {
  width: 100%;
  padding: 0.7rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}
.submit-btn:hover { background: #1d4ed8; }
.submit-btn:disabled { opacity: 0.6; cursor: default; }
.auth-hint {
  text-align: center;
  margin-top: 1rem;
  color: #888;
  font-size: 0.9rem;
}
.auth-hint a {
  color: #2563eb;
  text-decoration: none;
}
</style>