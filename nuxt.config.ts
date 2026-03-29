// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // SSR enabled for SEO (blog engine needs server-rendered HTML)
  ssr: true,

  // Modules
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/device',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@vueuse/nuxt',
    'nuxt-icon',
    'nuxt-swiper',
  ],

  // Plugins - loaded in order
  plugins: [
    '~/plugins/tenant.ts',
    '~/plugins/http.ts',
    '~/plugins/auth.ts',
    '~/plugins/api.ts',
  ],

  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
      imageUrl: process.env.NUXT_PUBLIC_IMAGE_URL || '',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Taita Blog',
      tenantDomain: process.env.NUXT_PUBLIC_TENANT_DOMAIN || 'taita',
      enableAnalytics: process.env.NUXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enableMaintenance: process.env.NUXT_PUBLIC_ENABLE_MAINTENANCE === 'true',
      isStatic: process.env.NUXT_PUBLIC_STATIC === 'true',
    },
  },

  // CSS
  css: [
    '~/assets/css/main.css',
    '~/assets/css/reading-theme.css',
  ],

  // PostCSS
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Tailwind CSS
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },

  // App config
  app: {
    head: {
      title: 'Taita Blog',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Taita Blog - Un blog moderno con Nuxt 3' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap',
        },
      ],
      script: [
        {
          innerHTML: `
            if (window.history.scrollRestoration) {
              window.history.scrollRestoration = 'manual';
            }
          `,
          type: 'text/javascript',
          body: true,
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // Router
  router: {
    options: {
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
          return savedPosition;
        } else {
          return { top: 0, behavior: 'smooth' };
        }
      },
    },
  },

  // Route rules
  routeRules: {
    '/blog/**': { swr: 3600 },
    '/api/**': { cors: true, headers: { 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS' } },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000' } },
    '/favicon.ico': { headers: { 'cache-control': 'public, max-age=31536000' } },
  },

  // Nitro - node-server for PM2 deployment
  nitro: {
    preset: 'node-server',
  },

  // Auto-import components
  components: [
    '~/components',
    '~/components/ui',
    '~/components/layouts',
    '~/components/sections',
  ],

  // Auto-import composables
  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**',
    ],
  },

  // Image module
  image: {
    domains: ['backend.taita.blog'],
    alias: {
      cms: 'https://backend.taita.blog',
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },

  // Sitemap
  sitemap: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://taita.blog',
  },

  // Schema.org
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://taita.blog',
    name: 'Taita Blog',
    description: 'A modern blog built with Nuxt 3 and TypeScript',
    defaultLocale: 'en',
  },

  // Color mode
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'taita-color-mode',
  },

  // Build
  build: {
    transpile: ['@headlessui/vue'],
  },

  // TypeScript
  typescript: {
    strict: true,
  },

  // Vite
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:color";
            @use "sass:map";
            @use "sass:math";
            @import "~/assets/scss/_variables.scss";
            @import "~/assets/scss/_mixins.scss";
          `,
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core'],
      exclude: ['@nuxtjs/color-mode'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia', '@vueuse/core'],
            'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  },

  // Vue compiler options
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ['Suspense'].includes(tag),
    },
  },

  // Sourcemaps off in production
  sourcemap: process.env.NODE_ENV !== 'production',

  // Dev server
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  // Experimental
  experimental: {
    renderJsonPayloads: true,
    typedPages: true,
  },

  // Compatibility date
  compatibilityDate: '2025-05-15',

  // Devtools
  devtools: { enabled: true },
})
