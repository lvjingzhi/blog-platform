<template>
  <div class="reader-auth-page">
    <div class="auth-card">
      <!-- 重置成功 -->
      <div v-if="done" class="status-state success">
        <div class="auth-icon">✅</div>
        <h2>密码重置成功！</h2>
        <p>请使用新密码登录</p>
        <button class="submit-btn" @click="$router.push('/login')">去登录</button>
      </div>

      <!-- 输入新密码 -->
      <template v-else>
        <div class="auth-header">
          <div class="auth-icon">🔒</div>
          <h2>重置密码</h2>
          <p>请输入新密码</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label>新密码</label>
            <div class="input-wrapper">
              <span class="input-icon">🔑</span>
              <input v-model="newPassword" type="password" placeholder="新密码（至少6位）" required minlength="6" />
            </div>
          </div>

          <div class="form-group">
            <label>确认密码</label>
            <div class="input-wrapper">
              <span class="input-icon">🔑</span>
              <input v-model="confirmPassword" type="password" placeholder="再次输入新密码" required minlength="6" />
            </div>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? '处理中...' : '重置密码' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useReaderAuthStore } from '@/stores/readerAuth'

const route = useRoute()
const authStore = useReaderAuthStore()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)

async function handleSubmit() {
  error.value = ''

  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = '密码至少需要6个字符'
    return
  }

  const token = route.query.token
  if (!token) {
    error.value = '缺少重置令牌'
    return
  }

  loading.value = true
  try {
    await authStore.resetPassword(token, newPassword.value)
    done.value = true
  } catch (err) {
    error.value = err.response?.data?.error || '重置失败，请稍后重试'
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
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--color-border-light);
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  border-radius: 14px;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
}

.auth-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.3rem;
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.88rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.8rem;
  font-size: 0.9rem;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 0.65rem 0.8rem 0.65rem 2.5rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all var(--transition);
  background: var(--color-bg);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.error-msg {
  color: var(--color-error);
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  background: var(--color-error-bg);
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.15);
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
  margin-top: 0.5rem;
  transition: all var(--transition);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: default;
  transform: none;
}

/* 成功 */
.status-state {
  text-align: center;
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

@media (max-width: 768px) {
  .auth-card { padding: 1.5rem; }
}
</style>