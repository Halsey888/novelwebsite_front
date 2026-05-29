<template>
  <div class="pending-container">
    <h2>⚖️ 稿件審核專區</h2>
    
    <div v-if="novels.length === 0" class="empty-state">
      <p>目前沒有待審核的小說，管理員可以去休息了 ☕</p>
    </div>

    <div v-else class="pending-list">
      <div v-for="n in novels" :key="n.id" class="pending-item">
        <img :src="n.cover_url" class="mini-cover" />
        <div class="info">
          <h3>{{ n.title }}</h3>
          <p>作者：{{ n.author }}</p>
          <p class="desc">{{ n.description }}</p>
        </div>
        <div class="actions">
          <button @click="handleApprove(n.id)" class="btn-approve">✅ 通過</button>
          <button @click="handleDelete(n.id)" class="btn-reject">❌ 刪除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../api'

const novels = ref([])

const fetchPending = async () => {
  try {
    const res = await apiClient.get('/novels/pending')
    novels.value = res.data
  } catch (e) {
    alert("讀取待審核列表失敗")
  }
}

const handleApprove = async (id) => {
  if (!confirm("確定要上架這部作品嗎？")) return
  try {
    await apiClient.post(`/novels/${id}/approve`)
    alert("審核通過！")
    fetchPending() // 重新刷新
  } catch (e) {
    alert("操作失敗")
  }
}

const handleDelete = async (id) => {
  if (!confirm("確定要刪除這部作品嗎？")) return
  try {
    await apiClient.delete(`/novels/${id}`)
    fetchPending()
  } catch (e) {
    alert("刪除失敗")
  }
}

onMounted(fetchPending)
</script>

<style scoped>
.pending-container { padding: 20px; max-width: 800px; margin: 0 auto; }
.pending-item {
  display: flex;
  background: white;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  align-items: center;
}
.mini-cover { width: 60px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px; }
.info { flex: 1; }
.info h3 { margin: 0; font-size: 1.1rem; }
.desc { font-size: 0.85rem; color: #666; }
.actions { display: flex; gap: 10px; }
.btn-approve { background: #2ecc71; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }
.btn-reject { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }
</style>