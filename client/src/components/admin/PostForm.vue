<template>
  <form @submit.prevent="$emit('submit', submitData)" class="post-form">
    <div class="form-group">
      <label>标题 *</label>
      <input v-model="form.title" type="text" placeholder="文章标题" required />
    </div>

    <div class="form-group">
      <label>摘要</label>
      <textarea v-model="form.excerpt" rows="2" placeholder="简短的文章摘要（可选）"></textarea>
    </div>

    <div class="form-group">
      <label>标签</label>
      <input v-model="tagsInput" type="text" placeholder="用逗号分隔，如：技术,教程,前端" />
    </div>

    <div class="form-group">
      <label>内容 * (Markdown)</label>
      <textarea
        v-model="form.content"
        rows="16"
        placeholder="在此输入文章内容...&#10;&#10;用 <!--paid--> 和 <!--/paid--> 包裹付费内容&#10;&#10;示例：&#10;这是免费内容。&#10;<!--paid-->&#10;这是付费内容。&#10;<!--/paid-->&#10;更多免费内容。"
        required
      ></textarea>
    </div>

    <PaidBlocksEditor :content="form.content" />

    <div class="form-row">
      <div class="form-group">
        <label>价格 (元)</label>
        <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="0.00 = 免费" />
      </div>
      <div class="form-group">
        <label>状态</label>
        <select v-model="form.is_published">
          <option :value="false">草稿</option>
          <option :value="true">发布</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="cancel-btn" @click="$emit('cancel')">取消</button>
      <button type="submit" class="save-btn">{{ submitLabel }}</button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import PaidBlocksEditor from './PaidBlocksEditor.vue'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  submitLabel: { type: String, default: '保存' },
})
defineEmits(['submit', 'cancel'])

const tagsInput = ref('')

const form = reactive({
  title: props.initialData.title || '',
  content: props.initialData.content || '',
  excerpt: props.initialData.excerpt || '',
  price: (props.initialData.price || 0) / 100,
  is_published: props.initialData.is_published !== undefined ? !!props.initialData.is_published : false,
})

// Initialize tags
if (props.initialData.tags && Array.isArray(props.initialData.tags)) {
  tagsInput.value = props.initialData.tags.join(', ')
}

// Watch external changes
watch(() => props.initialData, (data) => {
  if (data.title !== undefined) form.title = data.title
  if (data.content !== undefined) form.content = data.content
  if (data.excerpt !== undefined) form.excerpt = data.excerpt
  if (data.price !== undefined) form.price = data.price / 100
  if (data.is_published !== undefined) form.is_published = !!data.is_published
  if (data.tags) tagsInput.value = data.tags.join(', ')
}, { deep: true })

// Prepare submit data
const submitData = computed(() => ({
  title: form.title,
  content: form.content,
  excerpt: form.excerpt,
  tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
  price: Math.round((form.price || 0) * 100),
  is_published: form.is_published,
}))
</script>

<style scoped>
.post-form {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid #eee;
}
.form-group { margin-bottom: 1.2rem; }
.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  font-family: inherit;
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group { flex: 1; }
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}
.cancel-btn, .save-btn {
  padding: 0.6rem 1.8rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.cancel-btn { background: #f0f0f0; color: #555; }
.save-btn { background: #2563eb; color: #fff; }
.save-btn:hover { background: #1d4ed8; }
</style>