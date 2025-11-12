<template>
  <section class="page page--center">
    <div class="card form-card">
      <h1 class="card__title">Create Account</h1>

      <form class="form" @submit.prevent="register">
        <div class="form__field">
          <label class="form__label" for="name">Name</label>
          <input id="name" v-model="form.name" type="text" class="form__input" required />
        </div>

        <div class="form__field">
          <label class="form__label" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="form__input" required />
        </div>

        <div class="form__field">
          <label class="form__label" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            minlength="6"
            class="form__input"
            required
          />
        </div>

        <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
          {{ loading ? 'Registering…' : 'Register' }}
        </button>
      </form>

      <p v-if="success" class="alert alert--success">Registration successful! You can now log in.</p>
      <p v-if="error" class="alert alert--error">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '@/services/api';

const form = reactive({
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
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data || 'Registration failed.';
  } finally {
    loading.value = false;
  }
};
</script>