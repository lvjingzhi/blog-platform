<template>
  <div class="paid-blocks-editor">
    <div class="editor-header">
      <span class="editor-title">🔒 付费区块</span>
      <span class="editor-hint" v-if="blocks.length === 0">
        在内容中使用 <code>&lt;!--paid--&gt;</code> 和 <code>&lt;!--/paid--&gt;</code> 标记付费内容
      </span>
    </div>
    <div v-if="blocks.length > 0" class="blocks-list">
      <div v-for="(block, i) in blocks" :key="i" class="block-item">
        <span class="block-index">区块 {{ i + 1 }}</span>
        <span class="block-range">位置 {{ block.start }} - {{ block.end }}</span>
        <span class="block-preview">{{ previewText(block) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: String, default: '' },
})

const blocks = computed(() => {
  const result = []
  const regex = /<!--paid-->([\s\S]*?)<!--\/paid-->/g
  let match
  let offset = 0
  let tempContent = props.content

  while ((match = regex.exec(props.content)) !== null) {
    const originalStart = match.index
    const paidText = match[1]
    const adjustedStart = originalStart - offset
    const adjustedEnd = adjustedStart + paidText.length

    result.push({ start: adjustedStart, end: adjustedEnd, text: paidText })
    offset += '<!--paid-->'.length + '<!--/paid-->'.length
  }

  return result
})

function previewText(block) {
  const text = block.text.replace(/\n/g, ' ').trim()
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}
</script>

<style scoped>
.paid-blocks-editor {
  margin-bottom: 1.2rem;
  padding: 0.8rem 1rem;
  background: #fef9e7;
  border: 1px solid #f0d77b;
  border-radius: 8px;
}
.editor-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.editor-title { font-weight: 600; font-size: 0.9rem; color: #856404; }
.editor-hint { font-size: 0.8rem; color: #997404; }
.editor-hint code {
  background: #fdf0c2;
  padding: 0.1em 0.4em;
  border-radius: 3px;
  font-size: 0.85em;
}
.blocks-list { margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }
.block-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.3rem 0.6rem;
  background: #fff;
  border-radius: 6px;
  font-size: 0.8rem;
}
.block-index { font-weight: 600; color: #856404; }
.block-range { color: #999; font-family: monospace; }
.block-preview { color: #666; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>