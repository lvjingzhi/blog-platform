import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReaderAuthStore } from '@/stores/readerAuth'

const routes = [
  // === Reader Routes ===
  {
    path: '/',
    component: () => import('@/layouts/ReaderLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/reader/HomePage.vue'),
      },
      {
        path: 'post/:slug',
        name: 'post-detail',
        component: () => import('@/pages/reader/PostDetailPage.vue'),
      },
      {
        path: 'login',
        name: 'reader-login',
        component: () => import('@/pages/reader/LoginPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'library',
        name: 'my-library',
        component: () => import('@/pages/reader/MyLibraryPage.vue'),
        meta: { requiresReader: true },
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('@/pages/reader/VerifyEmailPage.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/pages/reader/ForgotPasswordPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('@/pages/reader/ResetPasswordPage.vue'),
      },
    ],
  },

  // === Admin Routes ===
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/pages/admin/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/DashboardPage.vue'),
      },
      {
        path: 'posts',
        name: 'admin-posts',
        component: () => import('@/pages/admin/PostListPage.vue'),
      },
      {
        path: 'posts/new',
        name: 'admin-post-create',
        component: () => import('@/pages/admin/PostEditorPage.vue'),
      },
      {
        path: 'posts/:id/edit',
        name: 'admin-post-edit',
        component: () => import('@/pages/admin/PostEditorPage.vue'),
      },
    ],
  },

  // === 404 ===
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/admin/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const readerAuthStore = useReaderAuthStore()

  // Admin auth check
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'admin-login' })
  } else if (to.meta.guest && authStore.isAuthenticated && to.name === 'admin-login') {
    next({ name: 'admin-dashboard' })
  }
  // Reader auth check
  else if (to.meta.requiresReader && !readerAuthStore.isAuthenticated) {
    next({ name: 'reader-login', query: { redirect: to.fullPath } })
  }
  // Reader guest check (redirect if already logged in)
  else if (to.meta.guest && readerAuthStore.isAuthenticated && to.name === 'reader-login') {
    next({ name: 'home' })
  }
  else {
    next()
  }
})

export default router