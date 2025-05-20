// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Runtime configuration
  runtimeConfig: {
    // Private keys are only available on the server
    apiSecret: process.env.API_SECRET,
    
    // Public keys that are exposed to the client
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://taita-api.onrender.com/api',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://taita-api.onrender.com/api',
      imageUrl: process.env.NUXT_PUBLIC_IMAGE_URL || 'https://taita-api.onrender.com',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Taita Blog',
      tenantDomain: process.env.NUXT_PUBLIC_TENANT_DOMAIN || 'demo.taita.blog',
      
      // Feature flags
      enableAnalytics: process.env.NUXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enableMaintenance: process.env.NUXT_PUBLIC_ENABLE_MAINTENANCE === 'false',
      
      // SSR/SSG configuration
      ssr: true,
      static: process.env.NUXT_PUBLIC_STATIC === 'true' || false
    }
  },
  
  // App configuration
  app: {
    head: {
      title: 'Taita Blog',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A modern blog built with Nuxt 3 and TypeScript' },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        },
      ],
      script: [
        {
          innerHTML: `
            // Fix for back button in SPA mode
            if (window.history.scrollRestoration) {
              window.history.scrollRestoration = 'manual';
            }
          `,
          type: 'text/javascript',
          body: true,
        },
      ],
    },
    pageTransition: { 
      name: 'page', 
      mode: 'out-in',
      onBeforeEnter: () => {
        // Scroll to top on page change
        window.scrollTo(0, 0);
      }
    },
    layoutTransition: { 
      name: 'layout', 
      mode: 'out-in' 
    },
  },
  
  // Router configuration
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

  // SSR Configuration
  ssr: true,
  
  // Nitro configuration for static site generation
  nitro: {
    preset: 'static'  // Especifica que el build será estático
  },
  
  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/device',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],
  
  // Plugins - loaded in order
  plugins: [
    // Core plugins first
    '~/plugins/tenant.ts',  // Load tenant first
    '~/plugins/http.ts',    // Then HTTP client
    '~/plugins/auth.ts',    // Then auth (depends on http)
    '~/plugins/api.ts'      // Then API (depends on http and auth)
  ],
  
  // Auto-import components
  components: [
    '~/components',
    '~/components/ui',
    '~/components/layouts',
    '~/components/sections'
  ],
  
  // Auto-import composables
  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**'
    ]
  },
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}'
      }
    },
    tsConfig: {
      compilerOptions: {
        strict: true,
        types: ['@nuxt/types', '@nuxtjs/device'],
        paths: {
          '~/*': ['./*'],
          '@/*': ['./*']
        }
      },
      include: [
        'types/*.d.ts',
        'types/**/*.d.ts',
        'components/*.d.ts',
        'components/**/*.d.ts',
        'composables/*.d.ts',
        'composables/**/*.d.ts',
        'plugins/*.d.ts',
        'plugins/**/*.d.ts'
      ]
    }
  },
  
  // Build configuration
  build: {
    transpile: ['@headlessui/vue'],
  },

  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) return
      
      // Inicializar rutas con las páginas estáticas básicas
      const routes = [
        '/',
        '/about',
        '/contact',
        '/blog',
        '/search',
        '/sitemap.xml'
      ]
      
      try {
        // Importar ofetch dinámicamente
        const { ofetch } = await import('ofetch')
        
        // Intentar obtener los posts de la API
        const response = await ofetch('https://taita-api.onrender.com/api/posts?fields=slug&limit=50', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // No fallar en caso de error 401
          ignoreResponseError: true
        })
        
        // Si hay datos, agregar las rutas de los posts
        if (response && response.data) {
          const postRoutes = response.data.map((post: any) => `/blog/${post.slug}`)
          routes.push(...postRoutes)
          console.log(`✓ Se agregaron ${postRoutes.length} rutas de posts`)
        } else {
          console.warn('No se pudieron obtener las rutas dinámicas de la API. Usando rutas estáticas.')
        }
      } catch (error) {
        console.warn('No se pudieron obtener las rutas dinámicas. Usando solo rutas estáticas.')
        if (error instanceof Error) {
          console.warn('Error detallado:', error.message)
        }
      }
      
      // Configurar las rutas para prerenderizado
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = [...new Set(routes)] // Eliminar duplicados
      
      console.log('Rutas a pre-renderizar:', nitroConfig.prerender.routes)
    }
  },
  
  // Sourcemap configuration
  sourcemap: {
    server: true,
    client: true,
  },
  
  // Development server configuration
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },
  
  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
    exposeLevel: 0,
    config: {}
  },
  
  // CSS configuration
  css: [
    '~/assets/css/main.css',
  ],
  
  // PostCSS configuration
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
  // Image module configuration
  image: {
    domains: ['taita-api.onrender.com'],
    alias: {
      cms: 'https://taita-api.onrender.com'
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
  
  // Sitemap configuration
  sitemap: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://taita.blog',
  },
  
  // Schema.org configuration
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://taita.blog',
    name: 'Taita Blog',
    description: 'A modern blog built with Nuxt 3 and TypeScript',
    defaultLocale: 'en',
  },
  
  // Color mode configuration
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'taita-color-mode',
  },
  
  // Compatibility date
  compatibilityDate: '2025-05-15',
  
  // Devtools
  devtools: { enabled: true },
  
  // Experimental features
  experimental: {
    reactivityTransform: true,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    typedPages: true,
  },
  
  // Features
  features: {
    devLogs: true,
    devBanner: true,
    devSourcemap: true,
    devTiming: true,
    devViteInspector: true,
    devViteLogger: true,
    devViteRuntime: true,
    typescriptBundlerResolution: true,
  },
  
  // Vite configuration
  vite: {
    logLevel: 'info',
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
  
  // Route rules (for static site generation)
  routeRules: {
    // Homepage pre-rendered at build time
    '/': { prerender: true },
    // Blog posts generated on-demand
    '/blog/**': { swr: 3600 },
    // Admin dashboard should be client-side only
    '/admin/**': { ssr: false },
  },
  
  // Nitro configuration (server)
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt', '/feed.xml'],
    },
    routeRules: {
      '/api/**': { cors: true, headers: { 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS' } },
    },
    storage: {
      'redis': {
        driver: 'redis',
        /* redis connector options */
      }
    },
  },
  
  // PWA configuration (if needed)
  pwa: {
    meta: {
      name: 'Taita Blog',
      author: 'Taita Team',
      description: 'A modern blog built with Nuxt 3 and TypeScript',
      theme_color: '#ffffff',
      lang: 'en',
    },
    manifest: {
      name: 'Taita Blog',
      short_name: 'Taita',
      description: 'A modern blog built with Nuxt 3 and TypeScript',
      theme_color: '#ffffff',
      lang: 'en',
    },
  },
  
  // I18n configuration (if needed)
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en-US.ts', name: 'English' },
      { code: 'es', iso: 'es-ES', file: 'es-ES.ts', name: 'Español' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    lazy: true,
    langDir: 'locales/',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://taita.blog',
  },
  
  // Webpack configuration (if needed)
  webpack: {
    extractCSS: true,
    optimizeCSS: true,
    terser: {
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
        },
      },
    },
  },
  
  // Nitro configuration for static site generation
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ['Suspense'].includes(tag)
    }
  },
})
