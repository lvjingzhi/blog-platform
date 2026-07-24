<template>
  <span class="tag-badge">{{ tag }}</span>
</template>

<script setup>
defineProps({ tag: { type: String, required: true } })
</script>

<style scoped>
.tag-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  font-size: 0.76rem;
  border-radius: 12px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all var(--transition);
}
</style>