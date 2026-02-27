<template>

  <div class="login-page">
    <h2>🔐 系統登入</h2>
    
  </div>
  <div id="container1">
    <h3>登入 Login</h3>
    <input v-model="email" type="email" placeholder="Email" id="username"/>
    <input v-model="password" type="password" placeholder="Password" id="password"/>
    <button @click="login" class="submit">登入</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()
const emit = defineEmits(['login-success'])

const login = async () => {
  try {
    const res = await axios.post('http://localhost:3000/login', { 
      email: email.value, 
      password: password.value 
    })
    
    // 建議這樣寫比較穩
    const { token, role, id, username } = res.data

    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('role', role || 'reader') // 如果沒有 role 預設給 reader
      localStorage.setItem('userId', id || '')       // 確保 id 存在才存
      localStorage.setItem('username', username || '')
      alert('登入成功！')
      // 2. 關鍵！觸發事件通知 App.vue 更新 Navbar
      emit('login-success')
      router.push('/novels')
    }
  } catch (e) {
    console.error("登入過程發生錯誤：", e) // 這行非常重要，它會告訴你到底哪裡寫錯
    alert('登入失敗，請檢查帳號密碼')
  }
}
</script>

<style>
.login-page{
/*定位對齊*/
position:relative;   
margin: auto;
top: 100px;
text-align:center; 
}

#container1, #container2{
  margin: 50px;
  padding: 10px;
  width: 230px;
  height: 300px;
  background-color: white;
  border-radius: 5px;
  border-top: 10px solid #df5334;
  box-shadow: 0 0px 70px rgba(0, 0, 0, 0.1);
  
  /*定位對齊*/
  position:relative;   
  margin: auto;
  top: 100px;
  text-align:center;  
}

#username, #password, #fullname, #comfirm_password,#username2, #password2{
  width: 200px;
  height: 20px;
  margin: 10px;
  color: #df5334;
}

.submit{
  color: white;  
  background: #df5334;
  width: 200px;
  height: 30px;
  margin: 10px;
  padding: 5px;
  border-radius: 5px;
  border: 0px;
}
</style>