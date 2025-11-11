<template>
    <section class="products">
        <header class="products_header">
            <h1>Products</h1>
            <div class="acctions">
            <button>Add</button>


            </div>
        </header>        
        <table v-if="products.length" class="products_table">
            <thead >
                <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td width="20%">{{ product.sku }}</td>
                    <td width="20%">{{ product.name }}</td>
                    <td width="20%" class="numberic">{{ product.price.toFixed(2) }}</td>
                    <td width="20%" class="numberic">{{ product.quantity }}</td>
                    <td><button>Edit</button><button style="margin-left: 5px; background-color: red;">Delete</button></td>
                </tr>
            </tbody>

        </table>
        <p v-else-if="!loading">No products available.</p>
    </section>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import api from '@/services/api';  

type Product = {
    id: number;
    sku: string;
    name: string;
    price: number;
    quantity: number;
};

const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref('');

const loadProducts = async () => {
    loading.value = true;
    error.value = '';

    try {
        const {data} = await api.get<Product[]>('/Products');
        products.value = data;
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to load products.';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadProducts();
});

</script>

<style scoped>
.products {
    max-width: 1200px;
    margin: 50px auto;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.products_table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 6px;
    overflow: hidden;
}
.products_header {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.products_table th, .products_table td  {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.products_table th {
  text-align: left;
  background: #f9fafb;
}
.numberic {
    text-align: right;
}

button {
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #369870;
}
</style>