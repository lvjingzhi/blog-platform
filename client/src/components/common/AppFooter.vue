<template>
  <footer class="app-footer">
    <p>© {{ year }} 我的博客. Powered by Vue + Express.</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: 1.5rem;
  color: #999;
  font-size: 0.85rem;
  border-top: 1px solid #eee;
  margin-top: 3rem;
}
</style>