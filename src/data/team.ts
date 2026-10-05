import type { Agent } from '@/types'

export const agents: Agent[] = [
  {
    id: 'arash-rostegar',
    name: 'آرش رستگار',
    role: 'مدیرعامل',
    photoId: 'photo-1507003211169-0a1dd7228f2d',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    email: 'arash@ofogh.ir',
  },
  {
    id: 'negar-tehrani',
    name: 'نگار تهرانی',
    role: 'مشاور املاک لوکس',
    photoId: 'photo-1573496359142-b8d87734a5a2',
    phone: '۰۹۱۲۳۴۵۶۷۹۰',
    email: 'negar@ofogh.ir',
  },
  {
    id: 'kaveh-amini',
    name: 'کاوه امینی',
    role: 'مشاور سرمایه‌گذاری',
    photoId: 'photo-1519085360753-af0119f7cbe7',
    phone: '۰۹۱۲۳۴۵۶۷۹۱',
    email: 'kaveh@ofogh.ir',
  },
  {
    id: 'sara-bahrami',
    name: 'سارا بهرامی',
    role: 'کارشناس ارشد املاک',
    photoId: 'photo-1580489944761-15a19d654956',
    phone: '۰۹۱۲۳۴۵۶۷۹۲',
    email: 'sara@ofogh.ir',
  },
]

export const getAgent = (id: string): Agent => agents.find((agent) => agent.id === id) ?? agents[0]
