<template>
  <div class="pagination" v-if="totalPages > 1">
    <button :disabled="page <= 1" @click="$emit('change', page - 1)" class="page-btn-nav">
      ← 上一页
    </button>
    <div class="page-numbers">
      <span v-for="p in visiblePages" :key="p"
        :class="{ active: p === page }"
        @click="p !== page && $emit('change', p)">
        {{ p }}
      </span>
    </div>
    <button :disabled="page >= totalPages" @click="$emit('change', page + 1)" class="page-btn-nav">
      下一页 →
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
defineEmits(['change'])

const visiblePages = computed(() => {
  const pages = []
  const max = 5
  let start = Math.max(1, props.page - Math.floor(max / 2))
  let end = Math.min(props.totalPages, start + max - 1)
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding: 1rem 0;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.page-btn-nav {
  padding: 0.45rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  transition: all var(--transition);
}

.page-btn-nav:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn-nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.pagination span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition);
  border: 1px solid transparent;
}

.pagination span:hover {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.pagination span.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

@media (max-width: 768px) {
  .page-btn-nav {
    padding: 0.35rem 0.7rem;
    font-size: 0.82rem;
  }
  .pagination span {
    min-width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }
}
</style>