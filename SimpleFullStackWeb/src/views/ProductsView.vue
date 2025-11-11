<template>
  <section class="products">
    <header class="products__header">
      <h1>Products</h1>
      <div class="actions">
        <button class="primary">Add Product</button>
        <button @click="loadProducts" :disabled="loading">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <section class="filters">
      <div class="field">
        <label for="search">Search</label>
        <input
          id="search"
          v-model="search"
          type="text"
          placeholder="SKU or Name"
          @keyup.enter="applyFilters"
        />
      </div>
      <div class="field">
        <label for="minPrice">Min Price</label>
        <input
          id="minPrice"
          v-model="minPrice"
          type="number"
          min="0"
          step="0.01"
        />
      </div>
      <div class="field">
        <label for="maxPrice">Max Price</label>
        <input
          id="maxPrice"
          v-model="maxPrice"
          type="number"
          min="0"
          step="0.01"
        />
      </div>
      <div class="field">
        <label for="sort">Sort By</label>
        <select id="sort" v-model="sortBy">
          <option value="createdAt">Created At</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>
      <div class="field">
        <label for="dir">Direction</label>
        <select id="dir" v-model="sortDir">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <div class="field">
        <label for="pageSize">Page Size</label>
        <select id="pageSize" v-model.number="pageSize" @change="changePageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
      <div class="field buttons">
        <button class="secondary" @click="applyFilters">Apply</button>
        <button class="ghost" @click="resetFilters">Reset</button>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="products.length" class="products__table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th class="numeric">Price</th>
          <th class="numeric">Quantity</th>
          <th class="actionscol">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.productId">
          <td width="20%">{{ product.sku }}</td>
          <td width="25%">{{ product.name }}</td>
          <td width="15%" class="numeric">{{ product.price.toFixed(2) }}</td>
          <td width="15%" class="numeric">{{ product.quantity }}</td>
          <td class="actionscol">
            <button class="secondary">Edit</button>
            <button class="danger" style="margin-left: 5px;">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!loading" class="empty">No products available.</p>

    <footer v-if="total > 0" class="pagination">
      <div>
        Showing {{ products.length }} of {{ total }} product<span v-if="total !== 1">s</span>
      </div>
      <div class="pagination__controls">
        <button @click="changePage(pageNum - 1)" :disabled="pageNum === 1">
          Previous
        </button>
        <span>Page {{ pageNum }} of {{ totalPages }}</span>
        <button
          @click="changePage(pageNum + 1)"
          :disabled="pageNum === totalPages"
        >
          Next
        </button>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/services/api';

type Product = {
  productId: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt?: string | null;
};

type ProductsResponse = {
  items: Product[];
  pageNum: number;
  pageSize: number;
  total: number;
};

const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref('');

const state = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const search = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const sortBy = ref<'createdAt' | 'name' | 'price'>('createdAt');
const sortDir = ref<'asc' | 'desc'>('asc');

const totalPages = computed(() =>
  Math.max(1, Math.ceil(state.total / state.pageSize))
);

const buildParams = () => {
  const params: Record<string, string | number> = {
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
    const { data } = await api.get<ProductsResponse>('/Products', {
      params: buildParams(),
    });

    products.value = data?.items ?? [];
    state.total = data?.total ?? 0;
    state.pageNum = data?.pageNum ?? 1;
    state.pageSize = data?.pageSize ?? state.pageSize;
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.response?.data ||
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

const changePage = (page: number) => {
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
  set: (value: number) => {
    state.pageSize = value;
  },
});
const total = computed(() => state.total);

onMounted(loadProducts);
</script>

<style scoped>
.products {
  width: 100%;
  padding: 2rem;
  background-color: #f5f5f5;
  box-sizing: border-box;
  display: grid;
  gap: 1rem;
}

.products__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filters {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-weight: 600;
  color: #374151;
}

.field input,
.field select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
}

.field.buttons {
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.5rem;
}

.field.buttons button {
  width: 100%;
}

.products__table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.products__table th,
.products__table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.products__table th {
  background: #f9fafb;
  text-align: left;
  font-weight: 600;
  color: #374151;
}

.numeric {
  text-align: right;
}

.actionscol {
  text-align: right;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

button {
  padding: 0.55rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.primary {
  background: #2563eb;
  color: white;
}

button.primary:hover {
  background: #1d4fd7;
}

button.secondary {
  background: #42b883;
  color: white;
}

button.secondary:hover {
  background: #389f72;
}

button.danger {
  background: #ef4444;
  color: white;
}

button.danger:hover {
  background: #dc2626;
}

button.ghost {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

button.ghost:hover {
  background: #f3f4f6;
}

.error {
  color: #dc2626;
  font-weight: 500;
}

.empty {
  color: #6b7280;
  font-style: italic;
}
</style>