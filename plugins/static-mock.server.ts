// Plugin to provide mock data during static site generation
import { defineNuxtPlugin } from '#app'
import type { Post, Category, Tag, Author } from '~/stores/blog'

export default defineNuxtPlugin((nuxtApp) => {
  // Only mock data during static generation in production
  const isStatic = process.env.NUXT_PUBLIC_STATIC === 'true'
  
  if (isStatic && process.server) {
    console.log('[static-mock] Enabling static mock data for site generation')
    
    // Mock data for blog posts
    const mockPosts: Post[] = [
      {
        id: 1,
        title: 'Bienvenido al Blog',
        slug: 'bienvenido-al-blog',
        excerpt: 'Este es un ejemplo de entrada de blog generada estáticamente.',
        content: '<p>Este es un ejemplo de contenido de blog generado estáticamente.</p>',
        featured_image: '/images/placeholder.jpg',
        featured: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reading_time: 2,
        author_id: 1,
        category_id: 1,
        author: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          bio: 'Administrador del blog',
          avatar: '/images/placeholder-avatar.jpg'
        },
        category: {
          id: 1,
          name: 'General',
          slug: 'general',
          description: 'Categoría general'
        },
        tags: [
          {
            id: 1,
            name: 'Blog',
            slug: 'blog',
            description: 'Artículos de blog'
          }
        ],
        meta_title: 'Bienvenido al Blog',
        meta_description: 'Artículo de bienvenida al blog'
      },
      {
        id: 2,
        title: 'Cómo utilizar Nuxt 3',
        slug: 'como-utilizar-nuxt-3',
        excerpt: 'Aprende a utilizar Nuxt 3 para crear sitios web estáticos.',
        content: '<p>Nuxt 3 es un framework potente para crear sitios web estáticos y aplicaciones web.</p>',
        featured_image: '/images/placeholder.jpg',
        featured: false,
        published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        reading_time: 5,
        author_id: 1,
        category_id: 2,
        author: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          bio: 'Administrador del blog',
          avatar: '/images/placeholder-avatar.jpg'
        },
        category: {
          id: 2,
          name: 'Tecnología',
          slug: 'tecnologia',
          description: 'Artículos sobre tecnología'
        },
        tags: [
          {
            id: 2,
            name: 'Nuxt',
            slug: 'nuxt',
            description: 'Artículos sobre Nuxt'
          }
        ],
        meta_title: 'Cómo utilizar Nuxt 3',
        meta_description: 'Guía completa para utilizar Nuxt 3'
      }
    ]
    
    // Mock categories
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'General',
        slug: 'general',
        description: 'Categoría general'
      },
      {
        id: 2,
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Artículos sobre tecnología'
      }
    ]
    
    // Mock tags
    const mockTags: Tag[] = [
      {
        id: 1,
        name: 'Blog',
        slug: 'blog',
        description: 'Artículos de blog'
      },
      {
        id: 2,
        name: 'Nuxt',
        slug: 'nuxt',
        description: 'Artículos sobre Nuxt'
      },
      {
        id: 3,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'Artículos sobre JavaScript'
      }
    ]
    
    // Provide mock data to the application
    nuxtApp.provide('staticPosts', mockPosts)
    nuxtApp.provide('staticCategories', mockCategories)
    nuxtApp.provide('staticTags', mockTags)
    
    // Override fetch to prevent API calls during static generation
    if (process.server) {
      const originalFetch = globalThis.fetch
      
      // @ts-ignore - Override fetch to prevent API calls during static generation
      globalThis.fetch = async (url: string, options: any) => {
        // Log the attempted fetch
        console.log(`[static-mock] Intercepted fetch to: ${url}`)
        
        // Return empty response for API calls
        return new Response(JSON.stringify({
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        }), {
          headers: {
            'content-type': 'application/json'
          }
        })
      }
    }
  }
})
