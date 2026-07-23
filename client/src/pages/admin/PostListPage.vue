<template>
  <div class="post-list-page">
    <div class="page-header">
      <h1>📄 文章管理</h1>
      <router-link to="/admin/posts/new" class="new-btn">+ 新建文章</router-link>
    </div>

    <LoadingSpinner :show="postsStore.isLoading" text="加载中..." />

    <div v-if="!postsStore.isLoading && postsStore.posts.length === 0" class="empty-state">
      <p>还没有文章，点击上方按钮创建第一篇</p>
    </div>

    <table v-if="postsStore.posts.length > 0" class="post-table">
      <thead>
        <tr>
          <th>标题</th>
          <th>状态</th>
          <th>价格</th>
          <th>更新时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <PostTableRow
          v-for="post in postsStore.posts"
          :key="post.id"
          :post="post"
          @edit="editPost"
          @delete="confirmDelete"
        />
      </tbody>
    </table>

    <Pagination
      :page="postsStore.currentPage"
      :totalPages="Math.ceil(postsStore.totalPosts / postsStore.pageSize)"
      @change="goToPage"
    />

    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除文章"
      :message="`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`"
      confirm-text="删除"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import PostTableRow from '@/components/admin/PostTableRow.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()
const postsStore = usePostsStore()

const showDeleteDialog = ref(false)
const deleteTarget = ref(null)

function editPost(post) {
  router.push(`/admin/posts/${post.id}/edit`)
}

function confirmDelete(post) {
  deleteTarget.value = post
  showDeleteDialog.value = true
}

async function handleDelete() {
  try {
    await postsStore.deletePost(deleteTarget.value.id)
    showDeleteDialog.value = false
    deleteTarget.value = null
    postsStore.fetchAdminPosts(postsStore.currentPage)
  } catch { /* error handled in store */ }
}

function goToPage(page) {
  postsStore.fetchAdminPosts(page)
}

onMounted(() => {
  postsStore.fetchAdminPosts()
})
</script>

<style scoped>
.post-list-page { max-width: 100%; }
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.page-header h1 { margin: 0; color: #1a1a2e; }
.new-btn {
  padding: 0.5rem 1.2rem;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
}
.post-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eee;
}
.post-table th {
  text-align: left;
  padding: 0.8rem 1rem;
  background: #fafafa;
  color: #666;
  font-weight: 600;
  font-size: 0.85rem;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}
</style>