<template>
  <div class="reader-auth-page">
    <div class="auth-card">
      <div class="status-state" :class="status">
        <div class="spinner" v-if="status === 'loading'"></div>
        <div class="auth-icon" v-else-if="status === 'success'">✅</div>
        <div class="auth-icon" v-else-if="status === 'error'">❌</div>
        <div class="auth-icon" v-else>📧</div>

        <h2 v-if="status === 'loading'">正在验证邮箱...</h2>
        <h2 v-else-if="status === 'success'">邮箱验证成功！</h2>
        <h2 v-else-if="status === 'error'">验证失败</h2>
        <h2 v-else>验证您的邮箱</h2>

        <p>{{ msg }}</p>

        <button
          class="submit-btn"
          @click="verify"
          v-if="status === 'idle'"
        >
          确认验证
        </button>
        <button
          class="submit-btn"
          @click="goLogin"
          v-if="status === 'success' || status === 'error'"
        >
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const status = ref('idle') // idle | loading | success | error
const msg = ref('')

onMounted(() => {
  const token = route.query.token
  if (!token) {
    status.value = 'error'
    msg.value = '缺少验证令牌，请检查邮件中的链接是否完整'
    return
  }
  // 显示初始提示，让用户点击按钮确认
  msg.value = '请点击下方按钮完成邮箱验证'
})

async function verify() {
  const token = route.query.token
  if (!token) return

  status.value = 'loading'
  msg.value = ''

  try {
    const { data } = await axios.post('/api/reader/verify-email', { token })
    if (data.token) {
      // 保存登录状态
      localStorage.setItem('blog_reader_token', data.token)
      localStorage.setItem('blog_reader_info', JSON.stringify(data.reader))
    }
    status.value = 'success'
    msg.value = data.message || '您现在可以登录了'
    // 2 秒后自动跳转首页
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    status.value = 'error'
    const errMsg = err.response?.data?.error || '验证失败，链接可能已过期'
    msg.value = errMsg
  }
}

function goLogin() {
  router.push('/login')
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
  line-height: 1.6;
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