import './assets/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from './views/RegisterView.vue'

import App from './App.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: App},
        {path: '/register', component: RegisterView}
    ]

});

createApp(App).use(router).mount('#app')
