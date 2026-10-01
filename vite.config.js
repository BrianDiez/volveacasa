import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 5174 porque bagayí ocupa el 5173 y los dos proyectos se trabajan a la
    // par. `strictPort`: si el puerto está tomado, que falle en vez de saltar
    // a otro y dejar el preview apuntando a la app equivocada.
    port: 5174,
    strictPort: true,
    // `vercel dev` sirve /api en el 3001 (el 3000 es el de bagayí); el proxy
    // hace que `npm run dev` solo también ande.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },

  /*
   * Dos proyectos de test, separados por la extensión del archivo (igual que
   * bagayí, §6.79): Vite 8 transforma con oxc, y oxc habilita el parser de JSX
   * SÓLO por extensión. Un `<p>` dentro de un `.test.js` revienta en el
   * transform con "JSX syntax is disabled".
   *
   * Regla práctica: lógica pura → `.test.js` · monta un componente → `.test.jsx`.
   */
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.js', 'api/**/*.test.js', 'scripts/**/*.test.js'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.jsx'],
          setupFiles: ['./vitest.setup.js'],
        },
      },
    ],
  },
});
