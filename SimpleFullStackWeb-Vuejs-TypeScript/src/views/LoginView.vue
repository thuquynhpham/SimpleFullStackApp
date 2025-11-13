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

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api, { setAuthToken } from '@/services/api';

type SignInResponse = string | { token?: string; Token?: string };

type ApiError = {
  response?: {
    status: number;
    statusText: string;
    data?: unknown;
  };
  request?: unknown;
  message?: string;
};

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
    const response = await api.post<SignInResponse>('/Users/signin', {
      email: form.email,
      password: form.password,
    });

    let token: unknown = response.data;

    if (typeof token === 'string') {
      if (token.startsWith('"') && token.endsWith('"')) {
        token = JSON.parse(token);
      }
    } else if (token && typeof token === 'object') {
      const tokenCandidate = (token as { token?: string; Token?: string }).token ?? (
        token as { token?: string; Token?: string }
      ).Token;
      token = tokenCandidate;
    }

    if (typeof token !== 'string' || !token) {
      console.error('Invalid token format:', token);
      throw new Error('Invalid token received from server');
    }

    setAuthToken(token);
    await router.push('/products');
  } catch (err) {
    console.error('Login error:', err);
    const typedError = err as ApiError;

    if (typedError.response) {
      const { data, status, statusText } = typedError.response;
      if (typeof data === 'string') {
        error.value = data;
      } else if (data && typeof (data as { message?: string }).message === 'string') {
        error.value = (data as { message: string }).message;
      } else if (data && typeof (data as { title?: string }).title === 'string') {
        error.value = (data as { title: string }).title;
      } else {
        error.value = `Login failed: ${status} ${statusText}`;
      }
    } else if (typedError.request) {
      error.value = 'Unable to connect to server. Please check your connection.';
    } else {
      error.value = typedError.message || 'Login failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>