<template>
  <div class="post-content">
    <div v-for="(segment, i) in segments" :key="i">
      <div v-if="segment.type === 'free'" v-html="renderMarkdown(segment.text)" class="free-content"></div>
      <PaidContentBlocker
        v-else-if="!purchased"
        :price="price"
        @purchase="$emit('purchase')"
      />
      <div v-else v-html="renderMarkdown(segment.text)" class="paid-content-unlocked"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import PaidContentBlocker from './PaidContentBlocker.vue'

const props = defineProps({
  content: { type: String, required: true },
  paidBlocks: { type: Array, default: () => [] },
  purchased: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
})
defineEmits(['purchase'])

const segments = computed(() => {
  if (!props.paidBlocks || props.paidBlocks.length === 0) {
    return [{ type: 'free', text: props.content }]
  }

  const result = []
  let cursor = 0

  // Sort paid blocks by start position
  const sorted = [...props.paidBlocks].sort((a, b) => a.start - b.start)

  for (const block of sorted) {
    if (block.start > cursor) {
      result.push({ type: 'free', text: props.content.slice(cursor, block.start) })
    }
    result.push({ type: 'paid', text: props.content.slice(block.start, block.end) })
    cursor = block.end
  }

  if (cursor < props.content.length) {
    result.push({ type: 'free', text: props.content.slice(cursor) })
  }

  return result
})

function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
</script>

<style scoped>
.post-content {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #333;
}
.free-content :deep(p) { margin: 0.8em 0; }
.free-content :deep(h1), .free-content :deep(h2), .free-content :deep(h3) {
  margin: 1.2em 0 0.6em;
}
.free-content :deep(code) {
  background: #f5f5f5;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
.free-content :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}
.paid-content-unlocked {
  border-left: 3px solid #2563eb;
  padding-left: 1rem;
  margin: 1rem 0;
}
</style>