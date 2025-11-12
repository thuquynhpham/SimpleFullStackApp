import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import ProductsView from '../views/ProductsView.vue';

const routes = [
        {path: '/', redirect: '/login'},
        {path: '/register', component: RegisterView},
        {path: '/login', component: LoginView},
        {path: '/products', component: ProductsView},
    ];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router