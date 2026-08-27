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

    <!-- Filter & Search -->
    <div class="filter-bar">
      <div class="tag-filter" v-if="allTags.length > 0">
        <button class="tag-trigger" @click="toggleTagDropdown">
          <span class="tag-icon">📋</span>
          <span class="tag-current">{{ activeTag || '全部标签' }}</span>
          <span class="tag-caret" :class="{ open: tagDropdownOpen }">▾</span>
        </button>

        <Transition name="tag-drop">
          <div class="tag-panel" v-if="tagDropdownOpen">
            <input
              class="tag-search"
              v-model="tagSearch"
              placeholder="搜索标签..."
              @click.stop
            />
            <div class="tag-options">
              <button class="tag-option" :class="{ active: !activeTag }" @click="pickTag(null)">
                全部
              </button>
              <button
                v-for="tag in filteredTags"
                :key="tag"
                class="tag-option"
                :class="{ active: activeTag === tag }"
                @click="pickTag(tag)"
              >{{ tag }}</button>
            </div>
            <div v-if="filteredTags.length === 0" class="tag-empty">没有匹配的标签</div>
          </div>
        </Transition>
      </div>

      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索文章标题..."
          @keyup.enter="applySearchNow"
        />
        <button v-if="searchKeyword" class="search-clear" @click="clearSearch">✕</button>
      </div>
    </div>

    <div class="tag-backdrop" v-if="tagDropdownOpen" @click="tagDropdownOpen = false"></div>

    <LoadingSpinner :show="isInitialLoading" text="加载中..." />

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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { usePostsStore } from '@/stores/posts'
import PostCard from '@/components/reader/PostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const postsStore = usePostsStore()
const activeTag = ref(null)
const tagDropdownOpen = ref(false)
const tagSearch = ref('')
const searchKeyword = ref('')
const isInitialLoading = ref(true)

const allTags = computed(() => {
  const tagSet = new Set()
  postsStore.posts.forEach(p => p.tags.forEach(t => tagSet.add(t)))
  return [...tagSet]
})

const filteredTags = computed(() => {
  const kw = tagSearch.value.trim().toLowerCase()
  if (!kw) return allTags.value
  return allTags.value.filter(t => t.toLowerCase().includes(kw))
})

function setTag(tag) {
  activeTag.value = tag
  postsStore.fetchPosts(1, tag, currentSearch())
}

function currentSearch() {
  return searchKeyword.value.trim() || null
}

// 输入防抖：停止输入 350ms 后自动搜索
let searchTimer = null
watch(searchKeyword, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    postsStore.fetchPosts(1, activeTag.value, currentSearch())
  }, 350)
})

function applySearchNow() {
  clearTimeout(searchTimer)
  postsStore.fetchPosts(1, activeTag.value, currentSearch())
}

function clearSearch() {
  searchKeyword.value = ''
  applySearchNow()
}

function toggleTagDropdown() {
  tagDropdownOpen.value = !tagDropdownOpen.value
  if (tagDropdownOpen.value) tagSearch.value = ''
}

function pickTag(tag) {
  setTag(tag)
  tagDropdownOpen.value = false
  tagSearch.value = ''
}

function goToPage(page) {
  postsStore.fetchPosts(page, activeTag.value, currentSearch())
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await postsStore.fetchPosts()
  isInitialLoading.value = false
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
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

/* === Filter Bar === */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

/* === Tag Filter === */
.tag-filter {
  position: relative;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  max-width: 320px;
  margin-left: auto;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  transition: border-color var(--transition);
}

.search-box:focus-within {
  border-color: var(--color-primary-light);
}

.search-icon {
  font-size: 0.85rem;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--color-text);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-clear {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all var(--transition);
}

.search-clear:hover {
  background: var(--color-text-muted);
  color: #fff;
}

.tag-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  transition: all var(--transition);
  white-space: nowrap;
}

.tag-trigger:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-current {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-caret {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  transition: transform var(--transition);
}

.tag-caret.open {
  transform: rotate(180deg);
}

.tag-panel {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  z-index: 110;
  width: 300px;
  max-height: 340px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xl);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
}

.tag-search {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
  transition: border-color var(--transition);
  flex-shrink: 0;
}

.tag-search:focus {
  border-color: var(--color-primary-light);
  background: var(--color-surface);
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
  overflow-y: auto;
  padding-right: 2px;
}

.tag-option {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  transition: all var(--transition);
  white-space: nowrap;
}

.tag-option:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-option.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  font-weight: 500;
}

.tag-empty {
  padding: 1.2rem 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.tag-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
}

/* dropdown transition */
.tag-drop-enter-active,
.tag-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tag-drop-enter-from,
.tag-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
  .tag-panel {
    width: calc(100vw - 2rem);
    max-width: 340px;
  }
  .filter-bar {
    flex-wrap: wrap;
  }
  .search-box {
    order: -1;
    flex: 1 1 100%;
    max-width: none;
    margin-left: 0;
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