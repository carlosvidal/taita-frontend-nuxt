<template>
  <div class="container py-10 text-center">
    <h1 class="text-3xl font-bold mb-4">Página dinámica</h1>
    <p>Esta es una página dinámica para el slug: <strong>{{ slug }}</strong></p>
    <p>Si necesitas cargar datos dinámicos, implementa aquí la lógica de fetch.</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const slug = route.params.slug
</script>

<style scoped>
.container { max-width: 700px; margin: auto; }
</style>
