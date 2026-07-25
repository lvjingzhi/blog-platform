<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">静志书屋</span>
      </router-link>
      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/library" v-if="readerAuth.isAuthenticated">
          <span class="nav-icon">📚</span> 我的书库
        </router-link>
        <template v-if="readerAuth.isAuthenticated">
          <span class="user-info">
            <span class="avatar">{{ readerAuth.reader?.nickname?.[0] || '?' }}</span>
            {{ readerAuth.reader?.nickname }}
          </span>
          <a href="#" @click.prevent="handleLogout" class="logout-link">退出</a>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">登录</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useReaderAuthStore } from '@/stores/readerAuth'
import { useRouter } from 'vue-router'

const readerAuth = useReaderAuthStore()
const router = useRouter()

function handleLogout() {
  readerAuth.logout()
  router.push('/')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-text);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  border-radius: 10px;
  font-size: 0.9rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.92rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.nav-links a:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.nav-links a.router-link-active {
  color: var(--color-primary);
  font-weight: 500;
}

.login-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff !important;
  padding: 0.45rem 1.2rem !important;
  border-radius: 20px !important;
  font-weight: 500;
}

.login-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-dark)) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light));
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.logout-link {
  font-size: 0.82rem !important;
  color: var(--color-text-muted) !important;
}

.logout-link:hover {
  color: var(--color-error) !important;
  background: var(--color-error-bg) !important;
}

.nav-icon {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .header-inner {
    padding: 0 1rem;
    height: 56px;
  }
  .logo-text {
    font-size: 1rem;
  }
  .nav-links a {
    font-size: 0.82rem;
    padding: 0.35rem 0.6rem;
  }
}
</style>