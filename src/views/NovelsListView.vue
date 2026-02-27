<template>
  <div class="list-container">
    <h2>📚 最新連載</h2>
    
    <div v-if="isLoading" class="loading-state">
      <p>正在從圖書館搬運書本中...</p>
    </div>

    <div v-else-if="novels.length > 0" class="novel-grid">
      <div v-for="n in novels" :key="n.id" class="novel-card" @click="goToDetail(n.id)">
        
        <div v-if="n.status === 'pending'" class="badge-pending">待審核</div>

        <div class="action-buttons">
          <button 
            v-if="userRole === 'admin' && n.status === 'pending'" 
            class="btn-approve"
            @click.stop="approveNovel(n.id)"
            title="核准發布"
          >
            ✅
          </button>

          <button 
            v-if="canDelete(n)" 
            class="btn-edit-inline"
            @click.stop="$router.push(`/novels/${n.id}/edit`)"
            title="編輯作品"
          >
            ✎
          </button>

          <button 
            v-if="canDelete(n)" 
            class="btn-delete-inline"
            @click.stop="handleDelete(n.id)"
            title="刪除作品"
          >
            ✕
          </button>
        </div>

        <div class="cover-wrapper">
          <img v-if="n.cover_url" :src="n.cover_url" class="cover-img" />
          <div v-else class="no-cover">NO COVER</div>
        </div>

        <div class="novel-info">
          <h3>{{ n.title }}</h3>
          <p class="author">👤 {{ n.author }}</p>
          <p class="desc">{{ truncate(n.description, 40) }}</p>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <p>目前還沒有作品，快去投稿吧！</p>
      <button class="btn" @click="$router.push('/novels/new')">前往投稿</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const novels = ref([])
const isLoading = ref(true)
const currentUserId = ref(null)
const userRole = ref('')

// 抓取小說列表
const fetchNovels = async () => {
  try {
    isLoading.value = true
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // 向後端請求，後端會根據身分過濾 pending 或顯示全部
    const res = await axios.get('http://localhost:3000/novels', { headers })
    novels.value = res.data
  } catch (error) {
    console.error("讀取失敗:", error)
  } finally {
    isLoading.value = false
  }
}

// 審核函式
const approveNovel = async (id) => {
  if (!confirm("確定要通過這本小說的審核嗎？")) return
  try {
    await axios.post(`http://localhost:3000/novels/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    alert("審核成功！作品已上架")
    fetchNovels() // 刷新列表
  } catch (e) {
    alert("操作失敗，請確認管理員權限")
  }
}

// 刪除函式
const handleDelete = async (id) => {
  if (!confirm("確定要刪除這部作品嗎？這個動作無法復原！")) return
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`http://localhost:3000/novels/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    novels.value = novels.value.filter(n => n.id !== id)
    alert("已刪除作品")
  } catch (error) {
    alert("刪除失敗，可能是權限不足")
  }
}

const goToDetail = (id) => {
  router.push(`/novels/${id}`)
}

const canDelete = (novel) => {
  if (userRole.value === 'admin') return true
  if (userRole.value === 'translator' && novel.user_id === currentUserId.value) return true
  return false
}

const truncate = (text, length) => {
  if (!text) return '暫無簡介'
  return text.length > length ? text.substring(0, length) + '...' : text
}

onMounted(() => {
  userRole.value = localStorage.getItem('role') || ''
  const uid = localStorage.getItem('userId')
  if (uid) currentUserId.value = Number(uid)
  fetchNovels()
})
</script>

<style scoped>
.btn {
    border: 1px solid transparent;
    border-radius: 22px;
    background-color: #f5f5f5;
    border-color: #e1e7ec;
    height: 44px;
    padding: 0 22px;
    letter-spacing: .07em;
    line-height: 42px;
    cursor: pointer;
}

.list-container { padding: 20px; }

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
}

.novel-card {
  position: relative; 
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.novel-card:hover { transform: translateY(-5px); }

/* 狀態標籤樣式 */
.badge-pending {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 按鈕容器區 */
.action-buttons {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  z-index: 20;
}

.btn-approve, .btn-edit-inline, .btn-delete-inline {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: 0.2s;
}

.btn-approve { background: #27ae60; color: white; }
.btn-edit-inline { background: rgba(255, 255, 255, 0.9); color: #333; }
.btn-delete-inline { background: rgba(220, 53, 69, 0.9); color: white; }

.btn-approve:hover, .btn-edit-inline:hover, .btn-delete-inline:hover {
  transform: scale(1.1);
}

.cover-wrapper {
  aspect-ratio: 3 / 4;
  background: #f0f0f0;
}

.cover-img { width: 100%; height: 100%; object-fit: cover; }
.no-cover { height: 100%; display: flex; align-items: center; justify-content: center; color: #bbb; }

.novel-info { padding: 15px; }
.novel-info h3 { margin: 0 0 10px 0; font-size: 1.1rem; }
.author { font-size: 0.85rem; color: #666; }
.desc { font-size: 0.8rem; color: #888; }

.loading-state, .empty { text-align: center; padding: 50px; color: #666; }
</style>