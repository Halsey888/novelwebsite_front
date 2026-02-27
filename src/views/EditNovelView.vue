<template>
  <div class="edit-container">
    <h2>✍️ 編輯作品</h2>
    
    <div class="form-group">
      <label>標題</label>
      <input v-model="novel.title" />
    </div>

    <div class="form-group">
        <label>簡介</label>
        <textarea v-model="novel.description" rows="5" placeholder="輸入小說簡介..."></textarea>
    </div>

    <div class="form-group">
      <label>標籤 (按 Enter 新增)</label>
      <div class="tag-input-wrapper">
        <span v-for="(tag, index) in tags" :key="index" class="tag-chip">
          {{ tag }} <i @click="removeTag(index)">×</i>
        </span>
        <input 
          v-model="tagInput" 
          @keydown.enter.prevent="addTag" 
          placeholder="輸入標籤後按 Enter"
        />
      </div>
    </div>

    <div class="form-group">
      <label>封面圖片 (不修改則保留原圖)</label>
      <input type="file" @change="handleFileChange" accept="image/*" />
      <div v-if="previewUrl" class="preview">
        <p>當前封面預覽：</p>
        <img :src="previewUrl" />
      </div>
    </div>

    <div class="actions">
      <button @click="$router.back()" class="btn-cancel">取消</button>
      <button @click="updateNovel" class="btn-submit">儲存修改</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const novel = ref({ title: '', author: '', description: '' })
const tags = ref([])
const tagInput = ref('')
const coverFile = ref(null)
const previewUrl = ref('')

// 1. 抓取舊資料
onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3000/novels/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    novel.value = res.data
    tags.value = res.data.tags.map(t => t.name)
    previewUrl.value = res.data.cover_url
  } catch (e) {
    alert("讀取資料失敗")
  }
})

// 2. 標籤邏輯
const addTag = () => {
  const val = tagInput.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  tagInput.value = ''
}
const removeTag = (index) => tags.value.splice(index, 1)

// 3. 檔案處理
const handleFileChange = (e) => {
  coverFile.value = e.target.files[0]
  if (coverFile.value) previewUrl.value = URL.createObjectURL(coverFile.value)
}

// 4. 送出修改
const updateNovel = async () => {
  const formData = new FormData()
  formData.append('novel[title]', novel.value.title)
  formData.append('novel[description]', novel.value.description)
  formData.append('novel[tag_list]', JSON.stringify(tags.value)) // 轉成 JSON 字串傳送
  if (coverFile.value) formData.append('novel[cover]', coverFile.value)

  try {
    await axios.patch(`http://localhost:3000/novels/${route.params.id}`, formData, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert("修改成功！")
    router.push(`/novels/${route.params.id}`)
  } catch (e) {
    alert("修改失敗")
  }
}
</script>

<style scoped>
.tag-input-wrapper {
  border: 1px solid #ddd;
  padding: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  border-radius: 4px;
}
.tag-chip {
  background: #e1f5fe;
  color: #0288d1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}
.tag-chip i { cursor: pointer; margin-left: 5px; font-weight: bold; }
.preview img { max-width: 150px; margin-top: 10px; border-radius: 4px; }
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