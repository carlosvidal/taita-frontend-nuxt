import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async (event) => {
  const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://backend.taita.blog'

  // Get tenant from Host header
  const host = event.node.req.headers.host || ''
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')
  const subdomain = parts.length > 2 ? parts[0] : 'demo'

  try {
    const response = await $fetch<any>(`${apiBase}/api/posts/public`, {
      headers: {
        'X-Taita-Subdomain': subdomain,
        'Accept': 'application/json',
      },
      query: { limit: 1000, status: 'published' },
    })

    const posts = response?.data || response || []

    return posts.map((post: any) => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt || post.updated_at || post.publishedAt || post.published_at,
      changefreq: 'weekly',
      priority: 0.8,
    }))
  } catch (error) {
    console.error('[Sitemap] Error fetching posts:', error)
    return []
  }
})
