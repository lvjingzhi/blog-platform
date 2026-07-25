<template>
  <div class="reader-auth-page">
    <div class="auth-card">
      <!-- 发送成功 -->
      <div v-if="sent" class="status-state success">
        <div class="auth-icon">✉️</div>
        <h2>邮件已发送</h2>
        <p>如果 <strong>{{ email }}</strong> 已注册，您将收到一封密码重置邮件。</p>
        <p class="hint">请检查收件箱和垃圾邮件文件夹</p>
        <button class="submit-btn" @click="$router.push('/login')">返回登录</button>
      </div>

      <!-- 输入邮箱 -->
      <template v-else>
        <div class="auth-header">
          <div class="auth-icon">🔑</div>
          <h2>忘记密码</h2>
          <p>输入注册邮箱，我们将发送重置链接</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label>邮箱</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input v-model="email" type="email" placeholder="请输入注册邮箱" required />
            </div>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? '发送中...' : '发送重置链接' }}
          </button>
        </form>

        <p class="auth-hint">
          <a href="#" @click.prevent="$router.push('/login')">返回登录</a>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReaderAuthStore } from '@/stores/readerAuth'

const authStore = useReaderAuthStore()

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authStore.forgotPassword(email.value)
    sent.value = true
  } catch (err) {
    error.value = err.response?.data?.error || '发送失败，请稍后重试'
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

.auth-hint {
  text-align: center;
  margin-top: 1rem;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.auth-hint a {
  color: var(--color-primary);
  font-weight: 500;
}

/* 发送成功 */
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
  margin: 0 0 0.3rem;
}

.status-state p strong {
  color: var(--color-primary);
}

.hint {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .auth-card { padding: 1.5rem; }
}
</style>