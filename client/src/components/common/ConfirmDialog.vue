<template>
  <Teleport to="body">
    <div class="dialog-overlay" v-if="show" @click.self="$emit('cancel')">
      <div class="dialog-box">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="$emit('cancel')">{{ cancelText }}</button>
          <button class="btn-confirm" @click="$emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '确认' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog-box {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}
.dialog-box h3 { margin: 0 0 0.5rem; }
.dialog-box p { color: #666; margin-bottom: 1.5rem; }
.dialog-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}
.dialog-actions button {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn-cancel { background: #f0f0f0; color: #555; }
.btn-confirm { background: #2563eb; color: #fff; }
</style>