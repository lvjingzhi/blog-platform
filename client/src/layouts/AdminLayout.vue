<template>
  <div class="admin-layout">
    <AdminSidebar ref="sidebarRef" />
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const sidebarRef = ref(null)
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}
.admin-main {
  flex: 1;
  padding: 2rem;
  background: #f5f5f5;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  .admin-main {
    padding: 1rem;
  }
}
</style>