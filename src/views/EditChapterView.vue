<template>
  <div class="edit-chapter-container" v-if="chapter">
    <h2>編輯章節：{{ chapter.title }}</h2>
    
    <div class="form-group">
      <label>章節標題</label>
      <input v-model="chapter.title" class="form-control" placeholder="輸入標題" />
    </div>

    <div class="form-group">
      <label>排序編號</label>
      <input type="number" v-model="chapter.order_number" class="form-control" />
    </div>

    <div class="form-group">
      <label>章節內容</label>
      <textarea v-model="chapter.content" class="form-control content-area"></textarea>
    </div>

    <div class="actions">
      <button @click="handleUpdate" :disabled="isSaving" class="btn-save">
        {{ isSaving ? '儲存中...' : '儲存修改' }}
      </button>
      <button @click="$router.back()" class="btn-cancel">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const chapter = ref(null)
const isSaving = ref(false)

// 取得原始資料
const fetchChapter = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/chapters/${route.params.id}`)
    chapter.value = res.data.chapter
  } catch (e) {
    alert("讀取章節失敗")
  }
}

const handleUpdate = async () => {
  isSaving.value = true
  try {
    const token = localStorage.getItem('token')
    // 注意：這裡的路由必須對應 /novels/:novel_id/chapters/:id
    await axios.put(
      `http://localhost:3000/novels/${chapter.value.novel_id}/chapters/${chapter.value.id}`,
      { chapter: chapter.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert("更新成功！")
    router.back() // 回到上一頁（通常是小說詳情頁）
  } catch (e) {
    console.error(e)
    alert("更新失敗，請檢查權限")
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchChapter)
</script>

<style scoped>
.content-area {
  white-space: pre-wrap;
  height: 500px;
  font-family: 'PingFang TC', sans-serif;
  line-height: 1.6;
}
.form-group { margin-bottom: 20px; }
.btn-save { background: #4caf50; color: white; padding: 10px 20px; border: none; cursor: pointer; }
.btn-cancel { background: #999; color: white; margin-left: 10px; padding: 10px 20px; border: none; }
</style>