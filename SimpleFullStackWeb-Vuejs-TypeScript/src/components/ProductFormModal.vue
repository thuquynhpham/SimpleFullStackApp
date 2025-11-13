<template>
  <div v-if="visible" class="modal">
    <div class="modal__backdrop" @click="handleCancel"></div>
    <div class="modal__content">
      <header class="modal__header">
        <h2 class="modal__title">{{ title }}</h2>
      </header>
      <form class="form" @submit.prevent="handleSubmit">
        <div class="form__field">
          <label class="form__label" for="sku">SKU</label>
          <input id="sku" v-model="form.sku" required class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="name">Name</label>
          <input id="name" v-model="form.name" required class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="price">Price</label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            required
            class="form__input"
          />
        </div>
        <div class="form__field">
          <label class="form__label" for="quantity">Quantity</label>
          <input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="0"
            step="1"
            required
            class="form__input"
          />
        </div>
        <p v-if="error" class="alert alert--error">{{ error }}</p>
        <footer class="modal__actions">
          <button class="btn btn--primary btn--sm" type="submit" :disabled="loading">
            {{ loading ? 'Saving…' : 'Save' }}
          </button>
          <button class="btn btn--ghost btn--sm" type="button" @click="handleCancel" :disabled="loading">
            Cancel
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

type Product = {
  sku?: string;
  name?: string;
  price?: number | string;
  quantity?: number | string;
};

type ProductForm = {
  sku: string;
  name: string;
  price: number;
  quantity: number;
};

const props = defineProps<{
  visible: boolean;
  initialProduct: Product | null;
  loading: boolean;
  error: string;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'submit', payload: ProductForm): void;
}>();

const form = reactive<ProductForm>({
  sku: '',
  name: '',
  price: 0,
  quantity: 0,
});

const resetForm = () => {
  form.sku = '';
  form.name = '';
  form.price = 0;
  form.quantity = 0;
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.initialProduct) {
        form.sku = props.initialProduct.sku ?? '';
        form.name = props.initialProduct.name ?? '';
        form.price = Number(props.initialProduct.price ?? 0);
        form.quantity = Number(props.initialProduct.quantity ?? 0);
      } else {
        resetForm();
      }
    }
  }
);

watch(
  () => props.initialProduct,
  (product) => {
    if (props.visible && product) {
      form.sku = product.sku ?? '';
      form.name = product.name ?? '';
      form.price = Number(product.price ?? 0);
      form.quantity = Number(product.quantity ?? 0);
    }
  }
);

const handleSubmit = () => {
  emit('submit', {
    sku: form.sku.trim(),
    name: form.name.trim(),
    price: Number(form.price),
    quantity: Number(form.quantity),
  });
};

const handleCancel = () => {
  emit('cancel');
};
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
  width: min(480px, 90vw);
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
  box-shadow: var(--shadow-lg);
  animation: slideUp 200ms ease-out;
}

.modal__header {
  margin-bottom: var(--spacing-lg);
}

.modal__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.modal__actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
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
