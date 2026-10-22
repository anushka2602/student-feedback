export type Role = 'student' | 'teacher' | 'admin'
export const ROLES: Role[] = ['student', 'teacher', 'admin']

export interface SessionUser {
  id: string
  display_id: string
  name: string
  email: string
  role: Role
}

export const homeFor = (role: Role) =>
  role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/feedback'

export const isRole = (v: unknown): v is Role => typeof v === 'string' && (ROLES as string[]).includes(v)
