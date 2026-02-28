export interface LoginResponse {
  code: number
  message: string
  token: string
  username: string
}

// Mock login API
export function login(username: string, password: string): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === '123456') {
        resolve({
          code: 200,
          message: '登录成功',
          token: 'mock-token-' + Date.now(),
          username: 'admin'
        })
      } else {
        reject({
          code: 401,
          message: '用户名或密码错误'
        })
      }
    }, 500)
  })
}
