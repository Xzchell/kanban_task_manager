import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    // Указываем путь относительно папки frontend
    // ../ указывает на выход из frontend в корень, а затем в папку назначения
    outDir: '../build', 
    emptyOutDir: true, // Vite очистит папку перед новой сборкой
  }
})
