<template>
  <article class="post-card" @click="$router.push(`/post/${post.slug}`)">
    <div class="post-card-body">
      <div class="post-card-header">
        <h2>{{ post.title }}</h2>
        <span v-if="post.price > 0" class="price-badge">
          <span class="price-icon">💎</span> ¥{{ (post.price / 100).toFixed(2) }}
        </span>
      </div>
      <p class="post-excerpt" v-if="post.excerpt">{{ post.excerpt }}</p>
      <div class="post-card-footer">
        <div class="tags">
          <TagBadge v-for="tag in post.tags" :key="tag" :tag="tag" />
        </div>
        <div class="footer-right">
          <span class="read-more">查看完整 →</span>
          <time>{{ formatDate(post.created_at) }}</time>
        </div>
      </div>
    </div>
    <div class="post-card-arrow">→</div>
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
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius);
  padding: 1.4rem 1.5rem;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-slow);
  position: relative;
}

.post-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.post-card-body {
  flex: 1;
  min-width: 0;
}

.post-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.post-card-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.price-icon {
  font-size: 0.7rem;
}

.post-excerpt {
  color: var(--color-text-secondary);
  margin: 0.6rem 0 0;
  line-height: 1.6;
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.8rem;
}

.tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
}

.read-more {
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition);
}

.post-card:hover .read-more {
  transform: translateX(3px);
}

time {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  flex-shrink: 0;
}

.post-card-arrow {
  color: var(--color-text-muted);
  font-size: 1.2rem;
  transition: all var(--transition);
  flex-shrink: 0;
}

.post-card:hover .post-card-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .post-card {
    padding: 1rem;
  }
  .post-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .post-card-header h2 {
    font-size: 1.05rem;
    white-space: normal;
  }
  .post-card-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  .post-card-arrow {
    display: none;
  }
}
</style>