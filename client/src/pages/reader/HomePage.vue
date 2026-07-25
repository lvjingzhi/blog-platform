<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-badge">📝 个人博客</div>
      <h1 class="hero-title">读书博客</h1>
      <p class="hero-desc">记录思考，分享知识。</p>
      <div class="hero-stats" v-if="postsStore.totalPosts > 0">
        <div class="hero-stat">
          <span class="hero-stat-num">{{ postsStore.totalPosts }}</span>
          <span class="hero-stat-label">篇文章</span>
        </div>
      </div>
    </section>

    <!-- Tag Filter -->
    <div class="tag-filter" v-if="allTags.length > 0">
      <button :class="{ active: !activeTag }" @click="setTag(null)">
        <span class="tag-icon">📋</span> 全部
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        :class="{ active: activeTag === tag }"
        @click="setTag(tag)"
      >{{ tag }}</button>
    </div>

    <LoadingSpinner :show="postsStore.isLoading" text="加载中..." />

    <div v-if="!postsStore.isLoading && postsStore.posts.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>还没有文章</p>
      <span>博主正在酝酿精彩内容，敬请期待 ✨</span>
    </div>

    <TransitionGroup name="post-list" tag="div" class="post-list">
      <PostCard v-for="post in postsStore.posts" :key="post.id" :post="post" />
    </TransitionGroup>

    <Pagination
      v-if="postsStore.totalPosts > postsStore.pageSize"
      :page="postsStore.currentPage"
      :totalPages="Math.ceil(postsStore.totalPosts / postsStore.pageSize)"
      @change="goToPage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePostsStore } from '@/stores/posts'
import PostCard from '@/components/reader/PostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const postsStore = usePostsStore()
const activeTag = ref(null)

const allTags = computed(() => {
  const tagSet = new Set()
  postsStore.posts.forEach(p => p.tags.forEach(t => tagSet.add(t)))
  return [...tagSet]
})

function setTag(tag) {
  activeTag.value = tag
  postsStore.fetchPosts(1, tag)
}

function goToPage(page) {
  postsStore.fetchPosts(page, activeTag.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  postsStore.fetchPosts()
})
</script>

<style scoped>
.home-page {
  padding: 1rem 0;
}

/* === Hero === */
.hero {
  text-align: center;
  padding: 3rem 1rem 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, #faf5ff 50%, #f0f9ff 100%);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.hero-badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  backdrop-filter: blur(8px);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-stat-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
}

.hero-stat-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* === Tag Filter === */
.tag-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 0 0.2rem;
}

.tag-filter button {
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  transition: all var(--transition);
  white-space: nowrap;
}

.tag-filter button:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-filter button.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.tag-icon {
  font-size: 0.8rem;
}

/* === Post List === */
.post-list {
  display: flex;
  flex-direction: column;
}

/* === Empty State === */
.empty-state {
  text-align: center;
  padding: 5rem 1rem;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.empty-state span {
  font-size: 0.9rem;
}

/* === Transition === */
.post-list-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* === Responsive === */
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem 1.5rem;
    border-radius: var(--radius-lg);
  }
  .hero-title {
    font-size: 1.8rem;
  }
  .hero-desc {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 1.5rem 1rem 1rem;
  }
  .hero-title {
    font-size: 1.5rem;
  }
  .hero-stat-num {
    font-size: 1.4rem;
  }
}
</style>