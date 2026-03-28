export interface User {
    id: string
    display_id: string
    email: string
    role: 'student' | 'teacher' | 'admin'
    name: string
    password: string
  }
  
  export function getUser(): User | null {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('feedbackUser')
    return user ? JSON.parse(user) : null
  }
  
  export function setUser(user: User) {
    localStorage.setItem('feedbackUser', JSON.stringify(user))
  }
  
  export function clearUser() {
    localStorage.removeItem('feedbackUser')
  }