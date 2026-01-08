import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // For custom domain (www.rialnexus.com)
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
        // Code splitting simplificado para evitar problemas de dependencias
        manualChunks: (id) => {
          // React core + ecosystem (React, React-DOM, React Router, Radix UI, React Query, Lucide)
          // Agrupar todo lo que depende de React en un solo chunk para evitar problemas de carga
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router') ||
            id.includes('@radix-ui') ||
            id.includes('@tanstack/react-query') ||
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('lucide-react')
          ) {
            return 'vendor-react-ui';
          }
          // Visualization libraries (solo recharts ahora)
          if (id.includes('recharts')) {
            return 'vendor-viz';
          }
          // Supabase
          if (id.includes('@supabase/supabase-js')) {
            return 'vendor-db';
          }
          // Date libraries
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'vendor-dates';
          }
          // Markdown y syntax highlighting (pesado)
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
