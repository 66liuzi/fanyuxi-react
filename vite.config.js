import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vercel 自动设置 VERCEL=1，此时用根路径；GitHub Pages 用仓库子路径
  base: process.env.VERCEL ? '/' : '/fanyuxi-react/',
})
