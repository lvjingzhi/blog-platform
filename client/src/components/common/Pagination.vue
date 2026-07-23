<template>
  <div class="pagination" v-if="totalPages > 1">
    <button :disabled="page <= 1" @click="$emit('change', page - 1)">上一页</button>
    <span v-for="p in visiblePages" :key="p"
      :class="{ active: p === page }"
      @click="p !== page && $emit('change', p)">
      {{ p }}
    </span>
    <button :disabled="page >= totalPages" @click="$emit('change', page + 1)">下一页</button>
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
  margin-top: 2rem;
}
.pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  color: #333;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}
.pagination span {
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  color: #555;
}
.pagination span.active {
  background: #2563eb;
  color: #fff;
}
</style>