<template>
  <div v-if="data" class="reader-wrapper">
    <div class="reader-nav">
      <button @click="$router.push(`/novels/${data.chapter.novel_id}`)">⬅ 目錄</button>
      <span class="novel-title">{{ data.chapter.novel?.title }}</span>
    </div>

    <div class="reader-content">
      <h2 class="chapter-title">{{ data.chapter.title }}</h2>
      <article class="text-body">{{ data.chapter.content }}</article>
      
      <div class="reader-pagination">
        <button 
          :disabled="!data.prev_id" 
          @click="goToChapter(data.prev_id)"
          class="btn-nav"
        >
          上一話
        </button>

        <button 
          :disabled="!data.next_id" 
          @click="goToChapter(data.next_id)"
          class="btn-nav"
        >
          下一話
        </button>
      </div>
    </div>
  </div>
  <div v-else class="loading">正在加載內容...</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const data = ref(null)

const fetchChapter = async (id) => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`http://localhost:3000/chapters/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  data.value = res.data
  window.scrollTo(0, 0) // 跳轉後自動回到頁面頂部
}

const goToChapter = (id) => {
  if (id) router.push(`/chapters/${id}`)
}

// 關鍵：監聽網址 ID 的變化，當使用者按「下一話」時，網址會變，這時要重新抓資料
watch(() => route.params.id, (newId) => {
  if (newId) fetchChapter(newId)
})

onMounted(() => fetchChapter(route.params.id))
</script>

<style scoped>
.reader-pagination { 
  display: flex; 
  justify-content: space-between; 
  margin-top: 50px; 
  padding: 20px 0;
}
.btn-nav { 
  padding: 10px 30px; 
  background: #2c3e50; 
  color: white; 
  border: none; 
  border-radius: 5px; 
  cursor: pointer; 
}
.btn-nav:disabled { 
  background: #ccc; 
  cursor: not-allowed; 
}
.reader-wrapper { background-color: #fdf6e3; min-height: 100vh; padding-bottom: 50px; }
.reader-nav { background: #fff; padding: 10px 20px; display: flex; align-items: center; border-bottom: 1px solid #ddd; position: sticky; top: 0; }
.btn-back { background: #eee; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-right: 15px; }
.novel-title { font-weight: bold; color: #666; }
.reader-content { max-width: 800px; margin: 40px auto; padding: 0 20px; }
.chapter-title { font-size: 2em; color: #2c3e50; margin-bottom: 10px; }
.meta-info { color: #999; margin-bottom: 20px; }
.text-body { 
  white-space: pre-wrap; 
  line-height: 2; 
  font-size: 1.25em; 
  color: #333; 
  font-family: "Microsoft JhengHei", sans-serif; 
}
.reader-footer { text-align: center; margin-top: 50px; }
</style>