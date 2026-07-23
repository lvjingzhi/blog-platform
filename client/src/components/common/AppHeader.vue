<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">📝 我的博客</router-link>
      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/library" v-if="readerAuth.isAuthenticated">我的书库</router-link>
        <template v-if="readerAuth.isAuthenticated">
          <span class="user-info">👤 {{ readerAuth.reader?.nickname }}</span>
          <a href="#" @click.prevent="handleLogout" class="logout-link">退出</a>
        </template>
        <template v-else>
          <router-link to="/login">登录</router-link>
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
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-links a {
  color: #555;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: #2563eb;
}
.user-info {
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
}
.logout-link {
  color: #999 !important;
  font-size: 0.85rem !important;
}
.logout-link:hover {
  color: #e53e3e !important;
}
</style>