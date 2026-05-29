<template>
  <div v-if="novel" class="detail-container">
    <div class="col-md-3">
		<div class="product-gallery text-center mb-3 preview">
			<img :src="previewUrl" />
		</div>
	</div>
    <h1>{{ novel.title }}</h1>
    <p class="author">作者：{{ novel.author }}</p>
    
    <div class="summary">
      <h3>作品簡介</h3>
      <p>{{ novel.description || '暫無簡介' }}</p> 
    </div>

    <hr>
    <button 
    v-if="userRole === 'admin' || userRole === 'translator'"
    @click="$router.push(`/novels/${novel.id}/chapters/new`)"
    class="btn-add-chapter"
  >
    ➕ 新增章節
  </button>
    <div class="right">
    <h3>📚 章節目錄</h3>
    
  </div>
    <div class="action-bar" v-if="userRole === 'admin' || userRole === 'translator'">
        <button @click="$router.push(`/novels/${novel.id}/chapters/new`)" class="btn-add">➕ 新增章節</button>
  
        <button 
            v-if="selectedIds.length > 0" 
            @click="handleBulkDelete" 
            class="btn-bulk-delete"
        >
            🗑️ 刪除已選取 ({{ selectedIds.length }})
        </button>
        <label v-if="novel?.chapters?.length > 0">
            <input type="checkbox" v-model="isAllSelected"> 全選
        </label>
    </div>

    <ul class="chapter-list">
        <li v-for="chapter in sortedChapters" :key="chapter.id" class="chapter-item">
            <div class="chapter-left">
                <input 
                    v-if="userRole === 'admin' || userRole === 'translator'"
                    type="checkbox" 
                    :value="chapter.id" 
                    v-model="selectedIds"
                    @click.stop
                />
                <router-link :to="`/chapters/${chapter.id}`">
                    第 {{ chapter.order_number }} 話：{{ chapter.title }}
                </router-link>
            </div>
            <div class="chapter-actions">
                <button 
                    v-if="userRole === 'admin' || userRole === 'translator'"
                    class="btn-edit-small"
                    @click="$router.push(`/chapters/${chapter.id}/edit`)"
                >
                    ✎ 編輯
                </button>
                <button v-if="canDelete(novel)" class="btn-delete-small" @click.stop="handleDelete(chapter.id)">✕</button>
            </div>
        </li>
    </ul>

    </div>
    <div v-if="userRole === 'admin'" class="admin-zone">
  <h4>🛠️ 管理員控制台</h4>
  <div class="bulk-upload-section">
    <p>批量導入章節 (.txt)</p>
    <div 
      class="drop-zone" 
      :class="{ 'active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input 
        type="file" 
        ref="fileInput" 
        multiple 
        accept=".txt" 
        @change="handleFileSelect" 
        hidden 
      />
      <span v-if="selectedFiles.length === 0">拖放或點擊選取章節檔案</span>
      <span v-else>已選取 {{ selectedFiles.length }} 個檔案</span>
    </div>

    <div v-if="selectedFiles.length > 0" class="file-preview">
      <ul>
        <li v-for="f in selectedFiles.slice(0, 5)" :key="f.name">{{ f.name }}</li>
        <li v-if="selectedFiles.length > 5">...以及其他 {{ selectedFiles.length - 5 }} 個檔案</li>
      </ul>
      <button @click="confirmUpload" :disabled="isUploading" class="btn-confirm">
        {{ isUploading ? '上傳中...' : '確認批量上傳' }}
      </button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiClient from '../api'
// 如果你要用 route，就需要 import，但這裡我們直接用 props.id 即可
import { useRoute } from 'vue-router'

const props = defineProps(['id'])
const novel = ref(null)
const previewUrl = ref('')
const userRole = localStorage.getItem('role')
const chapters = ref([])
const selectedFiles = ref([])
const isDragging = ref(false)
const isUploading = ref(false)
const selectedIds = ref([]) // 用來存儲被勾選的 ID

// 將讀取邏輯獨立出來，這樣上傳完才能重新呼叫
const fetchNovelDetail = async () => {
  try {
    const res = await apiClient.get(`/novels/${props.id}`)
    novel.value = res.data
    previewUrl.value = res.data.cover_url
  } catch (e) {
    console.error("抓取小說詳情失敗:", e)
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`確定要刪除這 ${selectedIds.value.length} 個章節嗎？`)) return
  
  try {
    await apiClient.delete(`/novels/${props.id}/chapters/bulk_delete`, {
      data: { ids: selectedIds.value }
    })
    
    alert("批量刪除成功！")
    selectedIds.value = [] // 清空選取
    fetchNovelDetail() // 刷新列表
  } catch (e) {
    console.error(e)
    alert("批量刪除失敗")
  }
}

const isAllSelected = computed({
  get: () => novel.value?.chapters?.length > 0 && selectedIds.value.length === novel.value.chapters.length,
  set: (value) => {
    if (value) {
      selectedIds.value = novel.value.chapters.map(c => c.id)
    } else {
      selectedIds.value = []
    }
  }
})

const handleDelete = async (chapterId) => {
  // 1. 修改提示文字，避免誤導成刪除整部作品
  if (!confirm("確定要刪除這個章節嗎？此動作無法復原！")) return
  
  try {
    await apiClient.delete(`/novels/${props.id}/chapters/${chapterId}`)
    
    // 3. 關鍵修正：直接重新抓取資料，最穩保險
    // 或者手動過濾：novel.value.chapters = novel.value.chapters.filter(c => c.id !== chapterId)
    await fetchNovelDetail() 
    
    alert("章節已成功刪除")
  } catch (error) {
    console.error("刪除失敗:", error.response?.data || error)
    alert("刪除失敗，請檢查權限或伺服器狀態")
  }
}

const canDelete = (novel) => {
  if (userRole.value === 'admin') return true
  if (userRole.value === 'translator' && novel.user_id === currentUserId.value) return true
  return false
}

const handleFileSelect = (e) => {
  selectedFiles.value = Array.from(e.target.files)
}

const handleDrop = (e) => {
  isDragging.value = false
  selectedFiles.value = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.txt'))
}

const confirmUpload = async () => {
  if (selectedFiles.value.length === 0) return
  isUploading.value = true
  
  const formData = new FormData()
  selectedFiles.value.forEach(file => {
    formData.append('files[]', file)
  })

  // ✅ 直接從 localStorage 拿 token
  const token = localStorage.getItem('token')
  console.log('目前 token:', token)  // ← 加入這行除錯
  try {
    // 修正：將 route.params.id 改為 props.id
    // ✅ 新（只保留 Content-Type）
    await apiClient.post(
      `/novels/${props.id}/chapters/bulk_upload`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } // ← 手動帶入
        
      }
    )
    alert('批量上傳成功！')
    selectedFiles.value = []
    fetchNovelDetail() // 現在這個函式存在了，可以正常執行
  } catch (e) {
    // 除錯小技巧：先印出真正的錯誤原因，再跳 alert
    console.error("上傳發生錯誤：", e.response?.data || e)
    alert('批量上傳失敗，請檢查權限或格式')
  } finally {
    isUploading.value = false
  }
}

const sortedChapters = computed(() => {
  return novel.value?.chapters?.sort((a, b) => a.order_number - b.order_number) || []
})

onMounted(fetchNovelDetail)
</script>

<style scoped>
.chapter-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.btn-delete-inline {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-delete-inline:hover {
  opacity: 1;
}

.admin-zone {
  margin-top: 40px;
  padding: 20px;
  background: #fff4e5; /* 輕微醒目的背景色，提示這是管理區 */
  border: 2px dashed #e67e22;
  border-radius: 10px;
}

.drop-zone {
  background: white;
  border: 2px dashed #ccc;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
  color: #666;
}

.drop-zone.active {
  background: #e1f5fe;
  border-color: #3498db;
}

.file-preview {
  margin-top: 15px;
}

.file-preview ul {
  font-size: 0.85em;
  color: #555;
  background: #eee;
  padding: 10px 30px;
  border-radius: 5px;
}

.btn-confirm {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
  font-weight: bold;
}

.btn-confirm:disabled {
  background: #95a5a6;
}

.chapter-list { list-style: none; padding: 0; }
.chapter-list li { padding: 10px; border-bottom: 1px solid #eee; }
.chapter-list a { text-decoration: none; color: #2c3e50; font-size: 1.1em; }
.chapter-list a:hover { color: #4CAF50; }
.summary,h3{
    color: black;
}
.col-md-3 {
    width: 10%;
    flex: 0 0 25%;
    max-width: 25%;
}
.product-gallery {
    padding: 6px;
    position: relative;
    border: 1px solid #e1e7ec;
    border-radius: 7px;
    margin-bottom: 1rem !important;
    text-align: center !important;
}
.preview img { max-width: 170px; margin-top: 10px; border-radius: 4px; }
.btn-add-chapter{
    position: absolute;
    right: 0;
    
    border: 1px solid transparent;
    border-radius: 22px;
    margin-top: 13px;
}
.btn-add-chapter:hover{
    background-color: #dcdbdb;
}
h3{
    margin-right: 0;
}
</style>