<template>
  <div class="paid-blocker">
    <div class="blocker-bg">
      <div class="blocker-blur">
        <p>这是付费内容，购买后即可阅读完整文章。</p>
        <p>付费内容可能包含深度分析、独家观点或实用技巧。</p>
      </div>
    </div>
    <div class="blocker-overlay">
      <div class="lock-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="rgba(99,102,241,0.1)"/>
          <rect x="16" y="22" width="16" height="14" rx="3" fill="rgba(99,102,241,0.2)"/>
          <path d="M19 22V18C19 15.2386 21.2386 13 24 13C26.7614 13 29 15.2386 29 18V22" stroke="rgba(99,102,241,0.4)" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="24" cy="29" r="2" fill="rgba(99,102,241,0.5)"/>
          <path d="M24 31V33" stroke="rgba(99,102,241,0.5)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="blocker-text">此部分为付费内容</p>
      <button class="unlock-btn" @click="$emit('purchase')">
        <span>🔓</span> 购买解锁 — ¥{{ (price / 100).toFixed(2) }}
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
  margin: 2rem 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  min-height: 200px;
  border: 2px dashed var(--color-primary-light);
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, #faf5ff 100%);
}

.blocker-bg {
  padding: 1.5rem;
  filter: blur(5px);
  user-select: none;
  pointer-events: none;
  opacity: 0.5;
}

.blocker-blur {
  color: var(--color-text-muted);
  line-height: 1.8;
}

.blocker-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.5rem;
}

.lock-icon {
  margin-bottom: 0.2rem;
}

.blocker-text {
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.unlock-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.unlock-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.unlock-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .paid-blocker {
    min-height: 160px;
  }
  .unlock-btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .paid-blocker {
    min-height: 140px;
  }
  .lock-icon svg {
    width: 36px;
    height: 36px;
  }
  .unlock-btn {
    padding: 0.5rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>