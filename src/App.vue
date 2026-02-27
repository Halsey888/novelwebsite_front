<template>
  <div id="app-container">
    
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-left">
        <router-link to="/novels" class="brand">📚 輕翼</router-link>
      </div>
      
      <div class="nav-right">
        <router-link 
        v-if="userRole === 'admin'" 
        to="/admin/pending" 
        class="admin-btn"
      >
        ⚖️ 稿件審核
      </router-link>
        <button  
          @click="$router.push('/novels/new')"
          class="btn-post"
        >
          ✍️ 成為譯者
        </button>
        
        <span class="user-info">{{ username }}</span>
        <button @click="handleLogout" class="btn-logout">登出</button>
      </div>
      
    </nav>
    <nav v-else class="navbar">
      <button @click="handleLogin" class="btn-login">登入查看更多</button>
    </nav>
    <router-view @login-success="checkLoginStatus"></router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const username = ref('')
const userRole = ref('')
const router = useRouter()

const syncUserData = () => {
  console.log("正在同步使用者狀態...")
  isLoggedIn.value = !!localStorage.getItem('token')
  username.value = localStorage.getItem('username') || ''
  userRole.value = localStorage.getItem('role') || ''
}

// 在 App.vue 定義這個函式，讓 router-view 呼叫
const checkLoginStatus = () => {
  syncUserData()
}

const handleLogout = () => {
  localStorage.clear()
  syncUserData()
  router.push('/novels')
}

const handleLogin = () => {
  router.push('/login')
}

onMounted(syncUserData)
</script>

<style>
.navbar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  background: #2c3e50; 
  color: white; 
  padding: 10px 20px; 
}
.nav-right { display: flex; align-items: center; gap: 15px; }
.btn-post { background: #e67e22; color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; }
.btn-post:hover { background: #d35400; }
.user-info { font-size: 0.9em; border-left: 1px solid #555; padding-left: 15px; }
.btn-logout { background: transparent; color: #ff7675; border: 1px solid #ff7675; padding: 4px 10px; cursor: pointer; border-radius: 4px; }
.btn-login { background: transparent; color: #fcf9f9; border: 1px solid #f5fff1; padding: 4px 10px; cursor: pointer; border-radius: 4px; }
</style>