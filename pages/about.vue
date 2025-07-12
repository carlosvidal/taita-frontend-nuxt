<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <article class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8">
      <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Sobre Nosotros</h1>
      
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
          Bienvenido a nuestro blog, un espacio dedicado a compartir conocimiento, 
          experiencias y reflexiones sobre diversos temas que nos apasionan.
        </p>
        
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Aquí encontrarás contenido de calidad sobre tecnología, desarrollo web, 
          tendencias digitales y mucho más. Nuestro objetivo es crear una comunidad 
          donde podamos aprender juntos y compartir ideas innovadoras.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
          Nuestra Misión
        </h2>
        
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Democratizar el acceso al conocimiento técnico y proporcionar recursos 
          valiosos para desarrolladores, diseñadores y entusiastas de la tecnología 
          de todos los niveles.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
          Contacto
        </h2>
        
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
          ¿Tienes alguna pregunta o sugerencia? No dudes en 
          <NuxtLink 
            to="/contact" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
          >
            ponerte en contacto
          </NuxtLink> 
          con nosotros.
        </p>
      </div>
    </article>
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
