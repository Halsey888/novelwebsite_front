<template>
  <div class="create-chapter-container">
    <h2>➕ 新增章節</h2>
    <p>正在為小說 ID: {{ novelId }} 增加內容</p>

    <div class="form-group">
      <label>章節順序 (第幾話)</label>
      <input v-model="newChapter.order_number" type="number" placeholder="例如: 1" />
    </div>

    <div class="form-group">
      <label>章節標題</label>
      <input v-model="newChapter.title" placeholder="例如: 序章 - 起始的城鎮" />
    </div>

    <div class="form-group">
      <label>章節內容</label>
      <textarea v-model="newChapter.content" rows="15" placeholder="請貼上翻譯內容..."></textarea>
    </div>

    <div class="actions">
      <button @click="$router.back()" class="btn-cancel">取消</button>
      <button @click="submitChapter" class="btn-submit">確認發布章節</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const novelId = route.params.novelId // 從網址取得小說 ID

const newChapter = ref({
  title: '',
  content: '',
  order_number: 1,
  novel_id: novelId
})

const submitChapter = async () => {
  if (!newChapter.value.title || !newChapter.value.content) {
    return alert("標題與內容不能為空！")
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post('http://localhost:3000/chapters', {
      chapter: newChapter.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    alert('章節發布成功！')
    router.push(`/novels/${novelId}`) // 回到小說目錄
  } catch (error) {
    console.error(error)
    alert('發布失敗，請檢查資料或權限')
  }
}
</script>

<style scoped>
.create-chapter-container { max-width: 700px; margin: 30px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 5px; font-weight: bold; }
input, textarea { resize: none; width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-submit { background: #4CAF50; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
.btn-cancel { background: #999; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
</style>