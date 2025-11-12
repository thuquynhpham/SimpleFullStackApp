<template>
  <section class="page">
    <header class="section-header">
      <h1>Products</h1>
      <div class="section-actions">
        <button class="btn btn--secondary btn--sm" type="button" @click="startAdd">Add Product</button>
        <button class="btn btn--ghost btn--sm" type="button" @click="loadProducts" :disabled="loading">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <section class="card filters-grid">
      <div class="form__field">
        <label class="form__label" for="search">Search</label>
        <input
          id="search"
          v-model="search"
          type="text"
          class="form__input"
          placeholder="SKU or Name"
          @keyup.enter="applyFilters"
        />
      </div>
      <div class="form__field">
        <label class="form__label" for="minPrice">Min Price</label>
        <input
          id="minPrice"
          v-model="minPrice"
          type="number"
          min="0"
          step="0.01"
          class="form__input"
        />
      </div>
      <div class="form__field">
        <label class="form__label" for="maxPrice">Max Price</label>
        <input
          id="maxPrice"
          v-model="maxPrice"
          type="number"
          min="0"
          step="0.01"
          class="form__input"
        />
      </div>
      <div class="form__field">
        <label class="form__label" for="sort">Sort By</label>
        <select id="sort" v-model="sortBy" class="form__input">
          <option value="createdAt">Created At</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>
      <div class="form__field">
        <label class="form__label" for="dir">Direction</label>
        <select id="dir" v-model="sortDir" class="form__input">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <div class="form__field">
        <label class="form__label" for="pageSize">Page Size</label>
        <select id="pageSize" v-model.number="pageSize" class="form__input" @change="changePageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
      <div class="filters-grid__actions">
        <button class="btn btn--secondary btn--sm" type="button" @click="applyFilters">Apply</button>
        <button class="btn btn--ghost btn--sm" type="button" @click="resetFilters">Reset</button>
      </div>
    </section>

    <p v-if="error" class="alert alert--error">{{ error }}</p>

    <div v-if="products.length" class="card table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th class="table__numeric">Price</th>
            <th class="table__numeric">Quantity</th>
            <th class="table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.productId">
            <td>{{ product.sku }}</td>
            <td>{{ product.name }}</td>
            <td class="table__numeric">{{ product.price.toFixed(2) }}</td>
            <td class="table__numeric">{{ product.quantity }}</td>
            <td class="table__actions">
              <button class="btn btn--ghost btn--sm" type="button" @click="startEdit(product)">Edit</button>
              <button class="btn btn--danger btn--sm" type="button" @click="startDelete(product)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="text-muted">No products available.</p>

    <footer v-if="total > 0" class="pagination">
      <div class="text-muted">
        Showing {{ products.length }} of {{ total }} product<span v-if="total !== 1">s</span>
      </div>
      <div class="pagination__controls">
        <button class="btn btn--ghost btn--sm" type="button" @click="changePage(pageNum - 1)" :disabled="pageNum === 1">
          Previous
        </button>
        <span>Page {{ pageNum }} of {{ totalPages }}</span>
        <button
          class="btn btn--ghost btn--sm"
          type="button"
          @click="changePage(pageNum + 1)"
          :disabled="pageNum === totalPages"
        >
          Next
        </button>
      </div>
    </footer>
  </section>

  <ProductFormModal
    :visible="showForm"
    :initial-product="editingProduct"
    :loading="formLoading"
    :error="formError"
    :title="editingProduct ? 'Edit Product' : 'Add Product'"
    @cancel="cancelForm"
    @submit="handleSubmit"
  />
  <ConfirmDialog
    :visible="showDeleteConfirm"
    title="Delete Product"
    :message="deleteMessage"
    :loading="deleteLoading"
    :error="deleteError"
    @cancel="cancelDelete"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';
import ProductFormModal from '@/components/ProductFormModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const products = ref([]);
const loading = ref(false);
const error = ref('');
const formError = ref('');
const formLoading = ref(false);
const showForm = ref(false);
const editingProduct = ref(null);
const showDeleteConfirm = ref(false);
const deletingProduct = ref(null);
const deleteLoading = ref(false);
const deleteError = ref('');

const state = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const search = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const sortBy = ref('createdAt');
const sortDir = ref('desc');

const totalPages = computed(() =>
  Math.max(1, Math.ceil(state.total / state.pageSize))
);

const buildParams = () => {
  const params = {
    pageNum: state.pageNum,
    pageSize: state.pageSize,
    sort: sortBy.value,
    dir: sortDir.value,
  };

  if (search.value.trim()) {
    params.q = search.value.trim();
  }

  const min = parseFloat(minPrice.value);
  if (!Number.isNaN(min)) {
    params.minPrice = min;
  }

  const max = parseFloat(maxPrice.value);
  if (!Number.isNaN(max)) {
    params.maxPrice = max;
  }

  return params;
};

const loadProducts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/Products', {
      params: buildParams(),
    });

    products.value = data?.items ?? [];
    state.total = data?.total ?? 0;
    state.pageNum = data?.pageNum ?? 1;
    state.pageSize = data?.pageSize ?? state.pageSize;
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      err?.response?.data ||
      'Failed to load products.';
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  state.pageNum = 1;
  loadProducts();
};

const resetFilters = () => {
  search.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  sortBy.value = 'createdAt';
  sortDir.value = 'asc';
  state.pageNum = 1;
  state.pageSize = 10;
  loadProducts();
};

const changePage = page => {
  if (page < 1 || page > totalPages.value) {
    return;
  }
  state.pageNum = page;
  loadProducts();
};

const changePageSize = () => {
  state.pageNum = 1;
  loadProducts();
};

const pageNum = computed(() => state.pageNum);
const pageSize = computed({
  get: () => state.pageSize,
  set: value => {
    state.pageSize = value;
  },
});
const total = computed(() => state.total);

const startAdd = () => {
  editingProduct.value = null;
  formError.value = '';
  showForm.value = true;
};

const startEdit = product => {
  editingProduct.value = product;
  formError.value = '';
  showForm.value = true;
};

const startDelete = product => {
  deletingProduct.value = product;
  deleteError.value = '';
  showDeleteConfirm.value = true;
};

const cancelForm = () => {
  showForm.value = false;
  editingProduct.value = null;
  formError.value = '';
  formLoading.value = false;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deletingProduct.value = null;
  deleteError.value = '';
  deleteLoading.value = false;
};

const deleteMessage = computed(() => {
  if (!deletingProduct.value) return '';
  const { name, sku } = deletingProduct.value;
  if (name && sku) return `Delete product "${name}" (SKU: ${sku})?`;
  if (name) return `Delete product "${name}"?`;
  if (sku) return `Delete product with SKU ${sku}?`;
  return 'Delete this product?';
});

const handleSubmit = async payload => {
  formError.value = '';
  formLoading.value = true;

  const request = {
    sku: typeof payload.sku === 'string' ? payload.sku.trim() : '',
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
    price: Number(payload.price),
    quantity: Number(payload.quantity),
  };

  if (!request.sku || !request.name) {
    formError.value = 'SKU and Name are required.';
    formLoading.value = false;
    return;
  }

  if (Number.isNaN(request.price) || request.price < 0) {
    formError.value = 'Price must be a positive number.';
    formLoading.value = false;
    return;
  }

  if (!Number.isInteger(request.quantity) || request.quantity < 0) {
    formError.value = 'Quantity must be a whole number.';
    formLoading.value = false;
    return;
  }

  try {
    if (editingProduct.value) {
      await api.put(`/Products/${editingProduct.value.productId}`, request);
    } else {
      await api.post('/Products', request);
    }
    cancelForm();
    await loadProducts();
  } catch (err) {
    formError.value =
      err?.response?.data?.message ||
      err?.response?.data ||
      'Something went wrong.';
  } finally {
    formLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!deletingProduct.value) {
    deleteError.value = 'No product selected.';
    return;
  }

  deleteError.value = '';
  deleteLoading.value = true;

  try {
    await api.delete(`/Products/${deletingProduct.value.productId}`);
    cancelDelete();
    await loadProducts();
  } catch (err) {
    deleteError.value =
      err?.response?.data?.message ||
      err?.response?.data ||
      'Failed to delete product.';
  } finally {
    deleteLoading.value = false;
  }
};

onMounted(loadProducts);
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
}

.filters-grid {
  margin-bottom: 12px;
}

.table-wrapper {
  margin-top: 12px;
}

.pagination {
  margin-top: 12px;
}
</style>