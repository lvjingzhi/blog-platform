<template>
  <span class="tag-badge">{{ tag }}</span>
</template>

<script setup>
defineProps({ tag: { type: String, required: true } })
</script>

<style scoped>
.tag-badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  font-size: 0.78rem;
  border-radius: 12px;
  background: #e8f0fe;
  color: #2563eb;
  font-weight: 500;
}
</style>