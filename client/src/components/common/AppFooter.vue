<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">✦</span>
        <span>静志书屋</span>
      </div>
      <p class="footer-copy">© {{ year }} 静志书屋 · 记录思考，分享知识</p>
      <p class="footer-tech">Powered by Vue 3 + Express + SQLite</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  margin-top: 4rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  border-radius: 6px;
  font-size: 0.7rem;
}

.footer-copy {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

.footer-tech {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  margin: 0.3rem 0 0;
}
</style>