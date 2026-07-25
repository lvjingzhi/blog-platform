<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="purchase-overlay" v-if="step !== 'hidden'" @click.self="close">
        <div class="purchase-modal">
          <!-- Step 1: Confirm -->
          <div v-if="step === 'confirm'" class="step">
            <div class="step-icon-glow"><span>💳</span></div>
            <h3>解锁文章内容</h3>
            <p>支付 <strong class="price-highlight">¥{{ (price / 100).toFixed(2) }}</strong> 即可阅读完整文章</p>
            <div class="step-actions">
              <button class="btn-cancel" @click="close">取消</button>
              <button class="btn-pay" @click="startPayment">确认支付</button>
            </div>
          </div>

          <!-- Step 2: QR Code -->
          <div v-else-if="step === 'qrcode'" class="step">
            <h3>支付宝扫码支付</h3>
            <p class="amount-text">{{ amountText }}</p>
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="支付二维码" class="qr-image" />
            <div class="spinner" v-if="!qrCodeUrl"></div>
            <p class="hint">请用支付宝扫码付款</p>
            <p class="hint-sub">支付完成后自动解锁</p>
            <button class="btn-cancel" @click="close">取消</button>
          </div>

          <!-- Step 3: Success -->
          <div v-else-if="step === 'success'" class="step">
            <div class="step-icon-glow success"><span>✅</span></div>
            <h3>支付成功！</h3>
            <p>文章已解锁，现在可以阅读完整内容了</p>
            <button class="btn-pay" @click="done">开始阅读</button>
          </div>

          <!-- Step 4: Error -->
          <div v-else-if="step === 'error'" class="step">
            <div class="step-icon-glow error"><span>❌</span></div>
            <h3>支付失败</h3>
            <p>{{ errorMsg }}</p>
            <div class="step-actions">
              <button class="btn-cancel" @click="close">关闭</button>
              <button class="btn-pay" @click="startPayment">重试</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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
const qrCodeUrl = ref('')
const amountText = ref('')
let pollTimer = null
let orderId = null

watch(() => props.show, (val) => {
  if (val) step.value = 'confirm'
  else cleanup()
})

function cleanup() {
  step.value = 'hidden'
  qrCodeUrl.value = ''
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  orderId = null
}

function close() {
  cleanup()
  emit('close')
}

async function startPayment() {
  step.value = 'qrcode'
  qrCodeUrl.value = ''
  try {
    // 创建支付宝订单
    const order = await purchasesStore.createOrder(props.postId)
    orderId = order.orderId
    amountText.value = order.amountText

    // 用 API 生成二维码图片
    qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(order.qrCode)}`

    // 开始轮询支付状态，每 2 秒查一次
    pollTimer = setInterval(async () => {
      const result = await purchasesStore.checkOrder(orderId)
      if (!result) return

      if (result.status === 'SUCCESS') {
        clearInterval(pollTimer)
        pollTimer = null
        await purchasesStore.fetchPurchases()
        step.value = 'success'
      } else if (result.status === 'CLOSED') {
        clearInterval(pollTimer)
        pollTimer = null
        errorMsg.value = '支付已超时或已取消'
        step.value = 'error'
      }
    }, 2000)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || '创建订单失败，请重试'
    step.value = 'error'
  }
}

function done() {
  cleanup()
  emit('purchased')
}
</script>

<style scoped>
.purchase-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.purchase-modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-light);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.step-icon-glow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.step-icon-glow.success { background: var(--color-success-bg); }
.step-icon-glow.error { background: var(--color-error-bg); }

.step h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--color-text); }
.step p { color: var(--color-text-secondary); margin: 0; font-size: 0.95rem; }

.price-highlight { color: var(--color-accent); font-size: 1.1rem; }
.amount-text { font-size: 1.2rem; font-weight: 700; color: var(--color-accent); margin: 0; }

.qr-image {
  width: 220px;
  height: 220px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem;
  background: #fff;
}

.hint { color: var(--color-text); font-weight: 500; }
.hint-sub { color: var(--color-text-muted); font-size: 0.85rem; }

.step-actions { display: flex; gap: 1rem; margin-top: 1rem; }

.btn-cancel, .btn-pay {
  padding: 0.65rem 2rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all var(--transition);
}

.btn-cancel { background: var(--color-bg); color: var(--color-text-secondary); }
.btn-cancel:hover { background: var(--color-border); }

.btn-pay {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.btn-pay:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45); }

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin-bottom: 0.3rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.modal-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from { opacity: 0; }
.modal-enter-from .purchase-modal { transform: scale(0.92); opacity: 0; }
.modal-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .purchase-modal { padding: 1.5rem; width: 95%; }
  .step-actions { flex-direction: column; width: 100%; }
  .btn-cancel, .btn-pay { width: 100%; }
  .qr-image { width: 180px; height: 180px; }
}
</style>