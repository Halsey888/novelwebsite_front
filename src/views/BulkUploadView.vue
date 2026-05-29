<template>
  <div class="bulk-container">
    <h3>批量上傳章節 (.txt)</h3>
    <div class="upload-box" :class="{ 'dragging': isDragging }" 
         @dragover.prevent="isDragging = true" 
         @dragleave="isDragging = false" 
         @drop.prevent="handleDrop">
      <input type="file" multiple accept=".txt" @change="handleFileSelect" id="fileInput" hidden />
      <label for="fileInput">
        <div v-if="files.length === 0">把檔案拖到這裡，或 <span>點擊上傳</span></div>
        <div v-else>已選取 {{ files.length }} 個檔案</div>
      </label>
    </div>

    <ul v-if="files.length > 0" class="file-list">
      <li v-for="(f, i) in files" :key="i">📄 {{ f.name }}</li>
    </ul>

    <div class="actions">
      <button @click="uploadFiles" :disabled="files.length === 0 || uploading" class="btn-primary">
        {{ uploading ? '上傳中...' : '開始上傳' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '../api'
import { useRoute } from 'vue-router'

const route = useRoute()
const files = ref([])
const uploading = ref(false)
const isDragging = ref(false)

const handleFileSelect = (e) => {
  files.value = Array.from(e.target.files)
}

const handleDrop = (e) => {
  isDragging.value = false
  files.value = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.txt'))
}

const uploadFiles = async () => {
  uploading.value = true
  const formData = new FormData()
  files.value.forEach(file => {
    formData.append('files[]', file) // 注意這裡要用 files[]
  })

  try {
    await apiClient.post(`/novels/${route.params.id}/chapters/bulk_upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    alert('批量上傳完成！')
    files.value = []
    // 這裡可以觸發重新讀取章節列表
  } catch (e) {
    alert('上傳失敗：' + (e.response?.data?.error || e.message))
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.upload-box {
  border: 2px dashed #ccc;
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  background: #f9f9f9;
  transition: all 0.3s;
  cursor: pointer;
}
.upload-box.dragging { border-color: #3498db; background: #e1f5fe; }
.upload-box span { color: #3498db; font-weight: bold; }
.file-list { margin-top: 20px; max-height: 200px; overflow-y: auto; text-align: left; }
.file-list li { list-style: none; font-size: 0.9em; color: #666; margin-bottom: 5px; }
.btn-primary { width: 100%; margin-top: 20px; padding: 10px; background: #27ae60; color: white; border: none; border-radius: 4px; }
</style>