<template>
  <div class="loading-spinner" v-if="show">
    <div class="spinner"></div>
    <p v-if="text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({ show: { type: Boolean, default: true }, text: { type: String, default: '' } })
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>