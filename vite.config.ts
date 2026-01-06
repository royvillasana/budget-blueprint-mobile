import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Aumentar el límite de tamaño del chunk para warnings
    chunkSizeWarningLimit: 1000,
    // Optimizaciones de minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      }
    },
    // Sourcemaps solo en desarrollo
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        // Code splitting mejorado
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          // Radix UI - split por categoria
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-dropdown-menu')) {
            return 'vendor-ui-dialogs';
          }
          if (id.includes('@radix-ui')) {
            return 'vendor-ui-core';
          }
          // Visualization libraries
          if (id.includes('recharts') || id.includes('lucide-react')) {
            return 'vendor-viz';
          }
          // OpenAI (puede ser pesado)
          if (id.includes('openai') || id.includes('node_modules/ai')) {
            return 'vendor-ai';
          }
          // Supabase
          if (id.includes('@supabase/supabase-js')) {
            return 'vendor-db';
          }
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'vendor-forms';
          }
          // Date libraries
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'vendor-dates';
          }
          // Markdown y syntax highlighting
          if (id.includes('react-markdown') || id.includes('shiki')) {
            return 'vendor-markdown';
          }
          // Otros node_modules
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        },
        // Nombres de archivos con hash para cache
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ],
    exclude: ['shiki'] // Shiki puede causar problemas en optimización
  }
}));
