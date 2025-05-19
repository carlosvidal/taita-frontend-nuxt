<template>
  <div class="container">
    <!-- Header -->
    <header class="site-header">
      <h1 class="site-title">Read</h1>
      <p class="site-description">... a minimalistic theme focused on readability.</p>
      
      <nav class="main-navigation">
        <NuxtLink to="/" class="nav-link">Home</NuxtLink>
        <NuxtLink to="/blog" class="nav-link">Blog</NuxtLink>
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        <NuxtLink to="/search" class="nav-link">Search →</NuxtLink>
      </nav>
    </header>
    
    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="site-footer">
      <p>&copy; {{ new Date().getFullYear() }} Taita Blog. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-lg);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.site-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.site-description {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
  font-style: italic;
}

.main-navigation {
  margin-top: var(--spacing-md);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.nav-link {
  padding: 0.25rem 0;
  margin: 0 0.5rem;
  color: var(--color-text-light);
  border-bottom: none;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
  border-bottom: none;
}

.main-content {
  flex: 1;
  padding: var(--spacing-md) 0;
}

.site-footer {
  text-align: center;
  padding: var(--spacing-md) 0;
  margin-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-light);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .main-navigation {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .nav-link {
    margin: 0;
  }
}
</style>
