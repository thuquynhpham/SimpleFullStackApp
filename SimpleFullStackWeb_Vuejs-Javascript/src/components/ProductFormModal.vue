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

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  initialProduct: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Product Form',
  },
});

const emit = defineEmits(['cancel', 'submit']);

const form = reactive({
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
  visible => {
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
  product => {
    if (props.visible && product) {
      form.sku = product.sku ?? '';
      form.name = product.name ?? '';
      form.price = Number(product.price ?? 0);
      form.quantity = Number(product.quantity ?? 0);
    }
  }
);

const handleSubmit = () => {
  const payload = {
    sku: form.sku.trim(),
    name: form.name.trim(),
    price: Number(form.price),
    quantity: Number(form.quantity),
  };

  emit('submit', payload);
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
  width: min(420px, 90vw);
  z-index: 1001;
}

.modal__header {
  margin-bottom: 12px;
}

.modal__title {
  margin: 0;
  font-size: 1.1rem;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>


