import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    /** Pre-bundle R3F + three so dev cold starts don’t hit stale “Outdated Optimize Dep” / 504 on deps. */
    optimizeDeps: {
        include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            // Wayfinder-generated route modules are plain TS (no React); React Compiler
            // must not transform them or imports like `queryParams` can break at runtime.
            exclude: [/\/node_modules\//, /resources[\\/]js[\\/]routes\//],
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
