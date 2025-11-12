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
        const { data } = await api.post('/Users/signin', {
            email: form.email,
            password: form.password,
        });

        const token = data;
        setAuthToken(token);
        await router.push('/products');
    } catch (err) {
        error.value = err?.response?.data?.message || err?.response?.data || 'Login failed.';
    } finally {
        loading.value = false;
    }
};
</script>