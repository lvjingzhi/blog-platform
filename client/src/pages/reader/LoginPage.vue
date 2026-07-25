<template>
  <div class="reader-auth-page">
    <div class="auth-card">

      <!-- 注册成功提示 -->
      <div v-if="showSuccess" class="success-state">
        <div class="auth-icon">✉️</div>
        <h2>注册成功！</h2>
        <p>验证邮件已发送至 <strong>{{ registeredEmail }}</strong></p>
        <p class="success-hint">请查收邮件并点击验证链接激活账号</p>
        <button class="submit-btn" @click="switchMode('login')">返回登录</button>
      </div>

      <!-- 登录/注册表单 -->
      <template v-else>
        <div class="auth-header">
          <div class="auth-icon">✦</div>
          <h2>欢迎回来</h2>
          <p>{{ mode === 'login' ? '登录你的账号继续阅读' : '创建账号以购买付费内容' }}</p>
        </div>

        <div class="auth-tabs">
          <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
          <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label>邮箱</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input v-model="email" type="email" placeholder="请输入邮箱" required />
            </div>
          </div>

          <div class="form-group" v-if="mode === 'register'">
            <label>昵称</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input v-model="nickname" type="text" placeholder="怎么称呼你？（可选）" />
            </div>
          </div>

          <div class="form-group">
            <label>密码</label>
            <div class="input-wrapper">
              <span class="input-icon">🔑</span>
              <input v-model="password" type="password" placeholder="密码（至少6位）" required minlength="6" />
            </div>
          </div>

          <div v-if="error" class="error-msg">
            {{ error }}
            <a v-if="errorCode === 'EMAIL_NOT_VERIFIED'" href="#" class="resend-link" @click.prevent="handleResend">重新发送验证邮件</a>
          </div>

          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '创建账号') }}
          </button>
        </form>

        <p class="auth-hint" v-if="mode === 'login'">
          <a href="#" @click.prevent="$router.push('/forgot-password')">忘记密码？</a>
        </p>
        <p class="auth-hint" v-if="mode === 'login'">
          还没有账号？<a href="#" @click.prevent="switchMode('register')">立即注册</a>
        </p>
        <p class="auth-hint" v-else>
          已有账号？<a href="#" @click.prevent="switchMode('login')">立即登录</a>
        </p>
      </template>
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
const errorCode = ref('')
const showSuccess = ref(false)
const registeredEmail = ref('')

function switchMode(m) {
  mode.value = m
  error.value = ''
  errorCode.value = ''
  showSuccess.value = false
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  errorCode.value = ''
  try {
    if (mode.value === 'register') {
      const res = await authStore.register({
        email: email.value,
        password: password.value,
        nickname: nickname.value || undefined,
      })
      // 注册成功 → 显示提示
      registeredEmail.value = email.value
      showSuccess.value = true
    } else {
      await authStore.login({
        email: email.value,
        password: password.value,
      })
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (err) {
    error.value = err.response?.data?.error || '操作失败，请重试'
    errorCode.value = err.response?.data?.code || ''
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  try {
    await authStore.resendVerification(email.value)
    error.value = '验证邮件已重新发送，请查收。'
    errorCode.value = ''
  } catch (err) {
    error.value = err.response?.data?.error || '发送失败'
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

.auth-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  background: var(--color-bg);
  border-radius: var(--radius);
  padding: 3px;
}

.auth-tabs button {
  flex: 1;
  padding: 0.55rem;
  background: none;
  border: none;
  border-radius: 7px;
  font-size: 0.92rem;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition);
  font-weight: 500;
}

.auth-tabs button.active {
  background: var(--color-surface);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
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

.resend-link {
  color: var(--color-primary);
  margin-left: 0.5rem;
  font-weight: 500;
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
  margin-top: 0.6rem;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.auth-hint a {
  color: var(--color-primary);
  font-weight: 500;
}

/* 注册成功 */
.success-state {
  text-align: center;
  padding: 1rem 0;
}

.success-state h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0.8rem 0 0.5rem;
}

.success-state p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin: 0 0 0.3rem;
}

.success-state p strong {
  color: var(--color-primary);
}

.success-hint {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>