import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import NovelsListView from '../views/NovelsListView.vue'
import NovelDetailView from '../views/NovelDetailView.vue'
import CreateNovelView from '../views/CreateNovelView.vue'
import ChapterReadView from '../views/ChapterReadView.vue'
import CreateChapterView from '../views/CreateChapterView.vue'
import EditNovelView from '../views/EditNovelView.vue'
import PendingNovelsView from '../views/PendingNovelsView.vue'
import EditChapterView from '../views/EditChapterView.vue'

// 輔助函式：檢查是否有登入（Token 是否存在）
const isAuthenticated = () => !!localStorage.getItem('token')

// 輔助函式：獲取當前角色
const getUserRole = () => localStorage.getItem('role')

const routes = [
  { path: '/', redirect: '/novels' },
  { path: '/login', component: LoginView },
  { 
    path: '/novels', 
    component: NovelsListView 
  },
  
  // 🆕 投稿：所有登入使用者 (admin, translator, reader) 皆可進入
  { 
    path: '/novels/new', 
    name: 'CreateNovel', 
    component: CreateNovelView,
    beforeEnter: (to, from, next) => {
      const role = getUserRole()
      if (role === 'admin' || role === 'translator' || role === 'reader') {
        next()
      } else {
        alert('請先登入後再進行投稿！')
        next('/login')
      }
    }
  },

  { 
    path: '/novels/:id', 
    name: 'NovelDetail', 
    component: NovelDetailView, 
    props: true 
  },

  { 
    path: '/chapters/:id', 
    name: 'ChapterRead', 
    component: ChapterReadView, 
    props: true 
  },

  // 🆕 新增章節：僅限管理員或譯者 (讀者通常不負責更新他人章節)
  { 
    path: '/novels/:novelId/chapters/new', 
    name: 'CreateChapter', 
    component: CreateChapterView,
    beforeEnter: (to, from, next) => {
      const role = getUserRole()
      if (role === 'admin' || role === 'translator') {
        next()
      } else {
        alert('權限不足，僅限管理員或譯者上傳章節')
        next('/novels')
      }
    }
  },

  // 🆕 編輯小說：補上守門員
  { 
    path: '/novels/:id/edit', 
    name: 'EditNovel', 
    component: EditNovelView,
    props: true,
    beforeEnter: (to, from, next) => {
      const role = getUserRole()
      // 這裡簡單擋掉遊客，具體「是否為本人」的邏輯建議放在 EditNovelView 的 onMounted 裡判斷
      if (role === 'admin' || role === 'translator' || role === 'reader') {
        next()
      } else {
        alert('你沒有編輯權限')
        next('/novels')
      }
    }
  },
  { 
    path: '/admin/pending', 
    name: 'PendingNovels', 
    component: PendingNovelsView,
    beforeEnter: (to, from, next) => {
      localStorage.getItem('role') === 'admin' ? next() : next('/')
    }
  },
  {
  path: '/chapters/:id/edit',
  name: 'EditChapter',
  component: () => import('../views/EditChapterView.vue'),
  props: true
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router