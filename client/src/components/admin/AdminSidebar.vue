<template>
  <aside class="admin-sidebar" :class="{ collapsed: !isOpen }">
    <div class="sidebar-header">
      <h2>📝 管理后台</h2>
      <button class="menu-toggle" @click="$emit('toggle')" aria-label="切换菜单">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
    </div>
    <nav class="sidebar-nav" v-show="isOpen">
      <router-link to="/admin" exact-active-class="active" @click="closeOnMobile">
        <span>📊</span> 仪表盘
      </router-link>
      <router-link to="/admin/posts" active-class="active" @click="closeOnMobile">
        <span>📄</span> 文章管理
      </router-link>
      <router-link to="/admin/posts/new" active-class="active" @click="closeOnMobile">
        <span>✏️</span> 新建文章
      </router-link>
    </nav>
    <div class="sidebar-footer" v-show="isOpen">
      <router-link to="/" class="view-site">🏠 查看网站</router-link>
      <button @click="authStore.logout()" class="logout-btn">🚪 退出登录</button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isOpen = ref(true)

defineEmits(['toggle'])

function closeOnMobile() {
  // On mobile, close menu after navigation
  if (window.innerWidth <= 768) {
    isOpen.value = false
  }
}

// Listen for toggle events from parent
function toggle() {
  isOpen.value = !isOpen.value
}

defineExpose({ toggle })
</script>

<style scoped>
.admin-sidebar {
  width: 220px;
  min-height: 100vh;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
  transition: width 0.3s;
}
.admin-sidebar.collapsed {
  width: 100%;
  min-height: auto;
}
.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sidebar-header h2 { margin: 0; font-size: 1.1rem; }
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.menu-toggle .bar {
  width: 20px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: transform 0.3s;
}
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: opacity 0.2s;
}
.sidebar-nav a {
  color: #ccc;
  text-decoration: none;
  padding: 0.7rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.sidebar-nav a:hover, .sidebar-nav a.active {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.view-site {
  color: #aaa;
  text-decoration: none;
  font-size: 0.85rem;
}
.view-site:hover { color: #fff; }
.logout-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.2);
  color: #ccc;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.logout-btn:hover { background: rgba(255,255,255,0.1); }

/* Mobile: show hamburger, collapse sidebar */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    min-height: auto;
  }
  .menu-toggle {
    display: flex;
  }
  .sidebar-header {
    padding: 0.8rem 1rem;
  }
  .sidebar-nav {
    padding: 0.5rem;
  }
  .sidebar-nav a {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
  .sidebar-footer {
    padding: 0.8rem 1rem;
    flex-direction: row;
    gap: 0.8rem;
  }
}
</style>