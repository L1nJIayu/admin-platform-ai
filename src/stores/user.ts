import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')

  const isAuthenticated = computed(() => !!token.value)

  async function login(userName: string, password: string) {
    const response = await loginApi(userName, password)
    token.value = response.token
    username.value = response.username
    localStorage.setItem('token', response.token)
    localStorage.setItem('username', response.username)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }

  return {
    token,
    username,
    isAuthenticated,
    login,
    logout
  }
})
