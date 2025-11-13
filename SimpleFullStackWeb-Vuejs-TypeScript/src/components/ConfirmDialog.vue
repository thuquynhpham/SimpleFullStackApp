<template>
  <div v-if="visible" class="modal">
    <div class="modal__backdrop" @click="emitCancel"></div>
    <div class="modal__content">
      <header class="modal__header">
        <h2 class="modal__title">{{ title }}</h2>
      </header>
      <p class="modal__message">{{ message }}</p>
      <p v-if="error" class="alert alert--error">{{ error }}</p>
      <footer class="modal__actions">
        <button class="btn btn--danger btn--sm" type="button" @click="emitConfirm" :disabled="loading">
          {{ loading ? 'Deleting…' : 'Delete' }}
        </button>
        <button class="btn btn--ghost btn--sm" type="button" @click="emitCancel" :disabled="loading">
          Cancel
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  title: string;
  message: string;
  loading: boolean;
  error: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const emitConfirm = () => emit('confirm');
const emitCancel = () => emit('cancel');
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 150ms ease-out;
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  animation: fadeIn 150ms ease-out;
}

.modal__content {
  position: relative;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  width: min(400px, 90vw);
  z-index: 1001;
  box-shadow: var(--shadow-lg);
  animation: slideUp 200ms ease-out;
}

.modal__header {
  margin-bottom: var(--spacing-md);
}

.modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.modal__message {
  margin: 0 0 var(--spacing-lg);
  color: var(--color-text);
  line-height: 1.6;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
