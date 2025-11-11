<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <div class="app">

  <header class="top-nav">
    <h1 class="brand">Stock Movement App</h1>
    <nav class="links">
        <RouterLink to="/register" class="nav-link primary">Register</RouterLink>
        <RouterLink to="/products" class="nav-link">Products</RouterLink>
    </nav>

  </header>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="QUYNH!!! You did it!" />
    </div>
  </header> -->

  <main class="content">
    <RouterView/>
  </main>

  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.app{
  min-height: 100vh;
  width: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
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

.links{
  display: flex;
  gap: 1rem;
}

.nav-link{
  padding: 0.4rem 0.9rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-link:hover{
  background-color: #3a4755;
}

.nav-link.primary{
  background-color: #42b983;
  border-color: #42b983;
}

.nav-link.primary:hover{
  background-color: #369870;
  border-color: #369870;
}

.main {
  padding: 2rem;
}

@media (width-width: 2024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
