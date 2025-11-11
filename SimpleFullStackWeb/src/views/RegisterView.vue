<template>
    <section class="register">
        <h1>Create account</h1>

        <form @submit.prevent="register">
            <label for="name">Name:</label>
            <input id="name" v-model="form.name" type="text" required />

            <label for="email">Email:</label>
            <input id="email" v-model="form.email" type="email" required />

            <label for="password">Password:</label>
            <input id="password" v-model="form.password" type="password" required minlength="6" />

            <button type="submit" :disabled="loading">
                {{ loading ? 'Registering...' : 'Register' }}
            </button>
        </form>

        <p v-if="success" class="success-message">Registration successful! You can now log in.</p>
        <p v-if="error" class="error-message">{{ error }}</p>
    </section>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import api from '@/services/api';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
};

const form = reactive<RegisterForm>({
    name: '',
    email: '',
    password: '',
});
const loading = ref(false);
const success = ref(false);
const error = ref('');

const resetForm = () => {
    form.name = '';
    form.email = '';
    form.password = '';
};

const register = async () => {
    loading.value = true;
    error.value = '';
    success.value = false;

    try {
        await api.post('/Users/register', {
            name: form.name,
            email: form.email,
            password: form.password,
        });
        success.value = true;
        resetForm();
    } catch (err: any) {
        error.value = err.response?.data?.message || err.response?.data || 'Registration failed.';
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