<template>
  <tr class="post-row">
    <td class="title-cell">
      <strong>{{ post.title }}</strong>
      <span class="slug">{{ post.slug }}</span>
    </td>
    <td>
      <span :class="['status', post.is_published ? 'published' : 'draft']">
        {{ post.is_published ? '已发布' : '草稿' }}
      </span>
    </td>
    <td>{{ post.price > 0 ? `¥${(post.price / 100).toFixed(2)}` : '免费' }}</td>
    <td class="date-cell">{{ formatDate(post.updated_at) }}</td>
    <td class="actions">
      <button class="edit-btn" @click="$emit('edit', post)">编辑</button>
      <button class="delete-btn" @click="$emit('delete', post)">删除</button>
    </td>
  </tr>
</template>

<script setup>
defineProps({ post: { type: Object, required: true } })
defineEmits(['edit', 'delete'])

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.post-row { border-bottom: 1px solid #f0f0f0; }
.post-row td { padding: 0.8rem 1rem; }
.title-cell strong { display: block; color: #1a1a2e; }
.slug { font-size: 0.78rem; color: #aaa; }
.status {
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
}
.status.published { background: #e6f7ed; color: #1a7f4b; }
.status.draft { background: #fff3cd; color: #856404; }
.date-cell { color: #999; font-size: 0.85rem; }
.actions { display: flex; gap: 0.5rem; }
.edit-btn, .delete-btn {
  padding: 0.25rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 0.8rem;
}
.edit-btn { background: #fff; color: #2563eb; }
.delete-btn { background: #fff; color: #e53e3e; }
.edit-btn:hover { background: #e8f0fe; }
.delete-btn:hover { background: #fef2f2; }
</style>