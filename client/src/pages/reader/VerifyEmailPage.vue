<template>
  <div class="reader-auth-page">
    <div class="auth-card">
      <!-- 加载中 -->
      <div v-if="loading" class="status-state">
        <div class="spinner"></div>
        <h2>正在验证邮箱...</h2>
      </div>

      <!-- 验证成功 -->
      <div v-else-if="success" class="status-state success">
        <div class="auth-icon">✅</div>
        <h2>邮箱验证成功！</h2>
        <p>{{ message }}</p>
        <button class="submit-btn" @click="goHome">进入首页</button>
      </div>

      <!-- 验证失败 -->
      <div v-else class="status-state error">
        <div class="auth-icon">❌</div>
        <h2>验证失败</h2>
        <p>{{ error }}</p>
        <button class="submit-btn" @click="$router.push('/login')">返回登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderAuthStore } from '@/stores/readerAuth'

const route = useRoute()
const router = useRouter()
const authStore = useReaderAuthStore()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const message = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    loading.value = false
    error.value = '缺少验证令牌'
    return
  }

  try {
    const res = await authStore.verifyEmail(token)
    loading.value = false
    success.value = true
    message.value = res.message || '您现在可以登录了'
  } catch (err) {
    loading.value = false
    error.value = err.response?.data?.error || '验证失败，链接可能已过期'
  }
})

function goHome() {
  router.push('/')
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
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--color-border-light);
  text-align: center;
}

.status-state {
  padding: 1rem 0;
}

.status-state h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0.8rem 0 0.5rem;
}

.status-state p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.auth-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
}

.status-state.success .auth-icon {
  background: var(--color-success-bg);
}
.status-state.error .auth-icon {
  background: var(--color-error-bg);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .auth-card { padding: 1.5rem; }
}
</style>