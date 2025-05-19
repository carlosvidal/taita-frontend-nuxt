<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Sobre Nosotros</h1>
    <div class="prose max-w-none">
      <p>Información sobre tu blog o sitio web.</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Sobre Nosotros',
  meta: [
    { name: 'description', content: 'Conoce más sobre nuestro blog y nuestra misión.' }
  ]
});
</script>
