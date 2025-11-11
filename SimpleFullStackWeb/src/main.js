import './assets/main.css'
import { createApp } from 'vue'
import router from './router/index.js'

import App from './App.vue'

// const router = createRouter({
//     history: createWebHistory(),
//     routes: [
//         {path: '/', component: App},
//         {path: '/register', component: RegisterView}
//     ]

// });

createApp(App).use(router).mount('#app')
