<template>
    <section class="page page--center">
        <div class="card form-card">
            <h1 class="card__title">Login</h1>

            <form class="form" @submit.prevent="login">
                <div class="form__field">
                    <label class="form__label" for="email">Email</label>
                    <input id="email" v-model="form.email" type="email" class="form__input" required />
                </div>

                <div class="form__field">
                    <label class="form__label" for="password">Password</label>
                    <input id="password" v-model="form.password" type="password" class="form__input" required />
                </div>

                <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
                    {{ loading ? 'Logging in…' : 'Log In' }}
                </button>
            </form>

            <p v-if="error" class="alert alert--error">{{ error }}</p>
        </div>
    </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
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
        const response = await api.post('/Users/signin', {
            email: form.email,
            password: form.password,
        });

        // The backend returns the token as a plain string
        // axios automatically parses JSON, so if it's a JSON string, it will be parsed
        let token = response.data;
        
        // Handle case where token might be wrapped in quotes (JSON string)
        if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
            token = JSON.parse(token);
        }
        
        if (!token || typeof token !== 'string') {
            console.error('Invalid token format:', token);
            throw new Error('Invalid token received from server');
        }

        setAuthToken(token);
        await router.push('/products');
    } catch (err) {
        console.error('Login error:', err);
        
        // Better error message handling
        if (err.response) {
            // Server responded with error
            const errorData = err.response.data;
            if (typeof errorData === 'string') {
                error.value = errorData;
            } else if (errorData?.message) {
                error.value = errorData.message;
            } else if (errorData?.title) {
                error.value = errorData.title;
            } else {
                error.value = `Login failed: ${err.response.status} ${err.response.statusText}`;
            }
        } else if (err.request) {
            // Request made but no response
            error.value = 'Unable to connect to server. Please check your connection.';
        } else {
            // Error setting up request
            error.value = err.message || 'Login failed. Please try again.';
        }
    } finally {
        loading.value = false;
    }
};
</script>