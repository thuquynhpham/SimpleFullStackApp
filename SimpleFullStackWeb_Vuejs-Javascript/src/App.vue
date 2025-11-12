<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { setAuthToken } from '@/services/api';

const profile = ref(null);
const loadingProfile = ref(false);
const route = useRoute();
const router = useRouter();

const loadProfile = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    profile.value = null;
    return;
  }

  loadingProfile.value = true;
  try {
    const { data } = await api.get('/Users/profile');
    profile.value = data;
  } catch {
    profile.value = null;
  } finally {
    loadingProfile.value = false;
  }
};

onMounted(loadProfile);

watch(
  () => route.fullPath,
  () => {
    loadProfile();
  }
);

const isAuthenticated = computed(() => !!profile.value);

const logout = async () => {
  setAuthToken(null);
  profile.value = null;
  await router.push('/login');
};
</script>

<template>
  <div class="app-shell">
    <header class="navbar">
      <div class="navbar__group navbar__group--left">
        <h1 class="navbar__brand">Stock Movement App</h1>
        <RouterLink to="/products" class="btn">Products</RouterLink>
      </div>
      <nav class="navbar__links">
        <span v-if="loadingProfile" class="navbar__greeting text-muted">Loading…</span>
        <span v-else-if="profile" class="navbar__greeting">
          Hello! {{ profile.name || profile.email }}<span v-if="profile.role"> ({{ profile.role }})</span>
        </span>
        <RouterLink to="/register" class="btn btn--primary">Register</RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/login" class="btn">Login</RouterLink>
        <button v-else class="btn" type="button" @click="logout">Logout</button>
      </nav>
    </header>

    <main class="app-shell__content">
      <RouterView />
    </main>
  </div>
</template>
