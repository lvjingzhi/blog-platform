<template>
  <div class="paid-blocker">
    <div class="blocker-blur">
      <p>这是付费内容，购买后即可阅读完整文章。</p>
      <p>付费内容可能包含深度分析、独家观点或实用技巧。</p>
    </div>
    <div class="blocker-overlay">
      <div class="lock-icon">🔒</div>
      <p class="blocker-text">此部分为付费内容</p>
      <button class="unlock-btn" @click="$emit('purchase')">
        购买解锁 - ¥{{ (price / 100).toFixed(2) }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ price: { type: Number, default: 0 } })
defineEmits(['purchase'])
</script>

<style scoped>
.paid-blocker {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 10px;
  overflow: hidden;
  min-height: 180px;
}
.blocker-blur {
  padding: 1.5rem;
  filter: blur(6px);
  user-select: none;
  pointer-events: none;
  color: #999;
  line-height: 1.8;
}
.blocker-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.95));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.lock-icon { font-size: 2rem; }
.blocker-text { color: #555; font-size: 0.95rem; margin: 0; }
.unlock-btn {
  margin-top: 0.5rem;
  padding: 0.6rem 2rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.unlock-btn:hover { background: #1d4ed8; }
</style>