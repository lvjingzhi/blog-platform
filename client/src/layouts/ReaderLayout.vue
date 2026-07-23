<template>
  <div class="reader-layout">
    <AppHeader />
    <main class="reader-main">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
</script>

<style scoped>
.reader-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.reader-main {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>