import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/dashboard/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: '/topology',
        name: 'TopologyList',
        component: () => import('@/views/topology/TopologyList.vue'),
        meta: { title: '台区拓扑图' }
      },
      {
        path: '/topology/edit/:id',
        name: 'TopologyEdit',
        component: () => import('@/views/topology/TopologyEdit.vue'),
        meta: { title: '编辑拓扑图' }
      }
    ],
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && userStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router
