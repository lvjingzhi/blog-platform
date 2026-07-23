<template>
  <Teleport to="body">
    <div class="purchase-overlay" v-if="step !== 'hidden'" @click.self="close">
      <div class="purchase-modal">
        <!-- Step 1: Confirm -->
        <div v-if="step === 'confirm'" class="step">
          <div class="step-icon">💳</div>
          <h3>解锁文章内容</h3>
          <p>支付 <strong>¥{{ (price / 100).toFixed(2) }}</strong> 即可阅读完整文章</p>
          <div class="step-actions">
            <button class="btn-cancel" @click="close">取消</button>
            <button class="btn-pay" @click="startPayment">确认支付</button>
          </div>
        </div>

        <!-- Step 2: Processing -->
        <div v-else-if="step === 'processing'" class="step">
          <div class="spinner"></div>
          <h3>正在处理支付...</h3>
          <p>请稍候，正在验证支付信息</p>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="step === 'success'" class="step">
          <div class="step-icon">✅</div>
          <h3>支付成功！</h3>
          <p>文章已解锁，现在可以阅读完整内容了</p>
          <button class="btn-pay" @click="done">开始阅读</button>
        </div>

        <!-- Step 4: Error -->
        <div v-else-if="step === 'error'" class="step">
          <div class="step-icon">❌</div>
          <h3>支付失败</h3>
          <p>{{ errorMsg }}</p>
          <div class="step-actions">
            <button class="btn-cancel" @click="close">关闭</button>
            <button class="btn-pay" @click="startPayment">重试</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePurchasesStore } from '@/stores/purchases'

const props = defineProps({
  show: { type: Boolean, default: false },
  postId: { type: Number, required: true },
  price: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'purchased'])

const purchasesStore = usePurchasesStore()

const step = ref('hidden')
const errorMsg = ref('')

watch(() => props.show, (val) => {
  if (val) step.value = 'confirm'
  else step.value = 'hidden'
})

function close() {
  step.value = 'hidden'
  emit('close')
}

async function startPayment() {
  step.value = 'processing'
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    await purchasesStore.purchasePost(props.postId)
    step.value = 'success'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '支付处理失败，请重试'
    step.value = 'error'
  }
}

function done() {
  step.value = 'hidden'
  emit('purchased')
}
</script>

<style scoped>
.purchase-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.purchase-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}
.step-icon { font-size: 3rem; }
.step h3 { margin: 0; font-size: 1.3rem; }
.step p { color: #666; margin: 0; }
.step-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-cancel, .btn-pay {
  padding: 0.6rem 1.8rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.btn-cancel { background: #f0f0f0; color: #555; }
.btn-pay { background: #2563eb; color: #fff; }
.btn-pay:hover { background: #1d4ed8; }
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>