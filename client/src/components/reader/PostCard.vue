<template>
  <article class="post-card" @click="$router.push(`/post/${post.slug}`)">
    <div class="post-card-header">
      <h2>{{ post.title }}</h2>
      <span v-if="post.price > 0" class="price-badge">¥{{ (post.price / 100).toFixed(2) }}</span>
    </div>
    <p class="post-excerpt" v-if="post.excerpt">{{ post.excerpt }}</p>
    <div class="post-card-footer">
      <div class="tags">
        <TagBadge v-for="tag in post.tags" :key="tag" :tag="tag" />
      </div>
      <time>{{ formatDate(post.created_at) }}</time>
    </div>
  </article>
</template>

<script setup>
import TagBadge from '@/components/common/TagBadge.vue'

defineProps({ post: { type: Object, required: true } })

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.post-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.post-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.post-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.post-card-header h2 { margin: 0; font-size: 1.2rem; color: #1a1a2e; }
.price-badge {
  padding: 0.2rem 0.7rem;
  background: #fff3e0;
  color: #e65100;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}
.post-excerpt {
  color: #666;
  margin: 0.8rem 0;
  line-height: 1.6;
}
.post-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.8rem;
}
.tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
time { color: #aaa; font-size: 0.85rem; }
</style>