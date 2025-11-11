<template>
    <section class="register">
        <h1>Login</h1>

        <form @submit.prevent="login">
            <label for="email">Email:</label>
            <input id="email" v-model="form.email" type="email" required />

            <label for="password">Password:</label>
            <input id="password" v-model="form.password" type="password" required />

            <button type="submit" :disabled="loading">
                {{ loading ? 'Logging In...' : 'Log In' }}
            </button>
        </form>

        <p v-if="error" class="error-message">{{ error }}</p>
    </section>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import api, { setAuthToken } from '@/services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = reactive({
    email: '',
    password: '',
});
const loading = ref(false);
const error = ref('');

const login = async () => {
    loading.value = true;
    error.value = '';

    try {
        const {data} = await api.post('/Users/signin', {
            email: form.email,
            password: form.password,
        });

        const token = data;
        setAuthToken(token);
        await router.push('/products')
    } catch (err: any) {
        error.value = err.response?.data?.message || err.response?.data || 'Login failed.';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.register {
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
}
label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}
input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
button {
    width: 100%;
    padding: 0.75rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}
button:disabled {
    background-color: #94d3a2;
    cursor: not-allowed;
}
.success-message {
    color: green;
    margin-top: 1rem;
}
.error-message {
    color: red;
    margin-top: 1rem;
}
</style>