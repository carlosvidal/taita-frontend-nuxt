# Taita Blog Frontend

Multi-tenant blog frontend built with Nuxt 3 and SSR. Each blog gets its own subdomain (`demo.taita.blog`, `myblog.taita.blog`).

## Stack

- **Framework**: Nuxt 3 with SSR enabled
- **Styling**: Tailwind CSS
- **State**: Pinia with persisted state
- **Icons**: @nuxt/icon (Iconify)
- **SEO**: nuxt-schema-org, @nuxtjs/sitemap, @nuxtjs/robots
- **Deploy**: PM2 + Caddy (node-server preset), CI/CD via GitHub Actions

## Architecture

```
*.taita.blog  ->  Caddy (wildcard TLS)  ->  Nuxt SSR (PM2 :3000)
                                                 |
                                          backend.taita.blog/api
```

**Multi-tenancy**: Tenant detection from subdomain works both server-side (Host header) and client-side (window.location). The `useTenant` composable handles both environments.

**SSR**: Pages fetch data on the server via `useAsyncData`, delivering full HTML with meta tags for SEO and social sharing.

## Quick Start

```bash
git clone https://github.com/carlosvidal/taita-frontend-nuxt.git
cd taita-frontend-nuxt
npm install --legacy-peer-deps
cp .env.example .env  # Edit with your values
npm run dev
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `NUXT_PUBLIC_API_URL` | - | API base URL (e.g. `https://backend.taita.blog`) |
| `NUXT_PUBLIC_API_BASE` | - | Same as API_URL (used by some composables) |
| `NUXT_PUBLIC_IMAGE_URL` | - | Base URL for images |
| `NUXT_PUBLIC_SITE_NAME` | `Taita Blog` | Site name for meta tags |
| `NUXT_PUBLIC_SITE_URL` | - | Canonical site URL (e.g. `https://taita.blog`) |
| `NUXT_PUBLIC_MAIN_DOMAIN` | `taita.blog` | Main domain for tenant detection |
| `NUXT_PUBLIC_TENANT_DOMAIN` | `taita.blog` | Tenant domain |
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |

## Project Structure

```
composables/
  useTenant.ts       # Subdomain detection (SSR + client)
  useApi.ts          # API client with tenant headers
  useAuth.ts         # Authentication state

plugins/
  tenant.ts          # Sets tenant on server and client
  tenant.client.ts   # Re-detects tenant on SPA navigation
  http.ts            # Axios-like fetch with auth + tenant headers
  auth.ts            # Auth initialization
  api.ts             # API plugin

stores/
  blog.ts            # Blog data, posts, categories, settings

pages/
  index.vue          # Homepage (recent posts)
  blog/
    index.vue        # Blog listing with filters
    [slug].vue       # Post detail
  category/[slug].vue
  tag/[slug].vue
  search.vue

layouts/
  default.vue        # Header + footer wrapper
```

## Key Features

- **SSR with tenant detection**: Each subdomain serves a different blog
- **SEO-ready**: Server-rendered HTML, Open Graph tags, structured data
- **Dark mode**: System preference with manual toggle
- **Responsive**: Mobile-first with Tailwind
- **i18n-ready**: Configured for EN/ES
- **Image optimization**: @nuxt/image with Cloudinary support

## Development

```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build (.output/)
npm run preview    # Preview production build locally
```

## Deployment

Deployed automatically via GitHub Actions on push to `main`:

1. GitHub runner builds the app (`npm run build`)
2. Rsync copies `.output/` to the server
3. PM2 restarts the process

Manual deploy:

```bash
npm run build
# Copy .output/ to server
node .output/server/index.mjs  # or pm2 start
```

## Related Repos

| Repo | Description |
| --- | --- |
| [taita-api](https://github.com/carlosvidal/taita-api) | Backend API (Express + Prisma) |
| [taita-cms](https://github.com/carlosvidal/taita-cms) | CMS admin panel (Vue 3, Netlify) |
| [taita-mcp-server](https://github.com/carlosvidal/taita-mcp-server) | MCP server for AI agents |

## License

MIT
