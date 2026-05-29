<template>
  <div class="create-container">
    <h2>✨ 發布新作品</h2>
    
    <div class="form-group">
      <label>作品標題</label>
      <input v-model="newNovel.title" placeholder="請輸入小說標題" />
    </div>

    <div class="form-group">
      <label>標籤 (輸入後按 Enter 新增)</label>
      <div class="tag-input-wrapper">
        <span v-for="(tag, index) in tags" :key="index" class="tag-chip">
          {{ tag }} <i @click="removeTag(index)">×</i>
        </span>
        <input 
          v-model="tagInput" 
          @keydown.enter.prevent="addTag" 
          placeholder="例如：轉生, 冒險"
        />
      </div>
    </div>

    <div class="form-group">
      <label>原作者</label>
      <input v-model="newNovel.author" placeholder="原作者" />
    </div>

    <div class="form-group">
      <label>封面圖片</label>
      <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
      <p class="hint">建議比例 3:4，支援 JPG/PNG</p>
    </div>

    <div class="form-group">
      <label>作品簡介</label>
      <textarea v-model="newNovel.description" placeholder="請輸入作品簡介..." rows="6"></textarea>
    </div>

    <div class="actions">
      <button @click="$router.push('/novels')" class="btn-cancel">取消</button>
      <button @click="createNovel" class="btn-submit">確認發布</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
// 1. 調整變數結構，移除 content 增加 description
const newNovel = ref({ title: '', author: '', description: '' })
const coverFile = ref(null) // 存放選取的圖片檔案

// --- 標籤邏輯開始 ---
const tags = ref([])
const tagInput = ref('')

const addTag = () => {
  const val = tagInput.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  tagInput.value = ''
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}
// --- 標籤邏輯結束 ---

// 2. 處理檔案選取的函式
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverFile.value = file
  }
}

const createNovel = async () => {
  if (!newNovel.value.title) return alert("標題必填！")
  
  try {
    const token = localStorage.getItem('token')
    
    // 3. 關鍵：建立 FormData 物件
    const formData = new FormData()
    // 注意：這裡的 key 要符合 Rails controller 的 params.expect(novel: [...])
    formData.append('novel[title]', newNovel.value.title)
    formData.append('novel[author]', newNovel.value.author)
    formData.append('novel[description]', newNovel.value.description)
    // 關鍵：將標籤陣列轉為 JSON 字串傳給後端
    formData.append('novel[tag_list]', JSON.stringify(tags.value))
    
    // 如果有選圖片才 append
    if (coverFile.value) {
      formData.append('novel[cover]', coverFile.value)
    }

    // 4. 發送請求，Header 加上 multipart/form-data
    await apiClient.post('/novels', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    alert('作品已送出！請等待管理員審核通過後即可上架。')
    router.push('/novels') 
  } catch (e) {
    console.error(e)
    alert('發布失敗：' + (e.response?.data?.errors?.join(', ') || '請檢查權限或網路'))
  }
}
</script>

<style scoped>

.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.tag-chip {
  background: #3498db;
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.85em;
  display: flex;
  align-items: center;
}

.tag-chip i {
  margin-left: 6px;
  cursor: pointer;
  font-style: normal;
  font-weight: bold;
}

.tag-input-wrapper input {
  border: none;
  flex: 1;
  outline: none;
  min-width: 120px;
  padding: 0;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
}
/* 樣式優化 */
.create-container { max-width: 600px; margin: 20px auto; padding: 30px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-weight: bold; color: #444; }
input, textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
.file-input { border: none; padding: 0; }
.hint { font-size: 0.8rem; color: #888; margin-top: 5px; }
.actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px; }
.btn-submit { background: #4CAF50; color: white; border: none; padding: 12px 25px; cursor: pointer; border-radius: 6px; font-weight: bold; }
.btn-cancel { background: #eee; color: #666; border: none; padding: 12px 25px; cursor: pointer; border-radius: 6px; }
</style>