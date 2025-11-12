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

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm',
  },
  message: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['confirm', 'cancel']);

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
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.modal__content {
  position: relative;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  width: min(360px, 90vw);
  z-index: 1001;
}

.modal__header {
  margin-bottom: 12px;
}

.modal__title {
  margin: 0;
  font-size: 1.05rem;
}

.modal__message {
  margin: 0 0 12px;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>


