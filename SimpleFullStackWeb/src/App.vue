<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

type UserProfile = {
  userId: number;
  email: string;
  createdAt: string;
  name?: string | null;
};

const profile = ref<UserProfile | null>(null);
const loadingProfile = ref(false);
const route = useRoute();

const loadProfile = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    profile.value = null;
    return;
  }

  loadingProfile.value = true;
  try {
    const { data } = await api.get<UserProfile>('/Users/profile');
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
</script>

<template>
  <div class="app">
    <header class="top-nav">
      <h1 class="brand">Stock Movement App</h1>
      <nav class="links">
        <span v-if="loadingProfile" class="greeting">Loading…</span>
        <span v-else-if="profile" class="greeting">
          Hello! {{ profile.name || profile.email }}
        </span>
        <RouterLink to="/register" class="nav-link primary">Register</RouterLink>
        <RouterLink to="/products" class="nav-link">Products</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  width: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #202c37;
  color: white;
}

.brand {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.greeting {
  font-weight: 500;
  color: #e5e7eb;
}

.nav-link {
  padding: 0.4rem 0.9rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-link:hover {
  background-color: #3a4755;
}

.nav-link.primary {
  background-color: #42b983;
  border-color: #42b983;
}

.nav-link.primary:hover {
  background-color: #369870;
  border-color: #369870;
}

.content {
  flex: 1;
  padding: 0;
}
</style>
