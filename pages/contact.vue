<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <article class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8">
      <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Contacto</h1>
      
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
          ¿Tienes alguna pregunta, sugerencia o simplemente quieres decir hola? 
          Nos encantaría escuchar de ti.
        </p>
        
        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <!-- Contact Form -->
          <div>
            <h2 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Envíanos un mensaje
            </h2>
            
            <form class="space-y-6">
              <div>
                <label 
                  for="name" 
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nombre
                </label>
                <input 
                  type="text" 
                  id="name" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label 
                  for="email" 
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label 
                  for="message" 
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Mensaje
                </label>
                <textarea 
                  id="message" 
                  rows="5"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>
              
              <button 
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                       text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 
                       dark:focus:ring-offset-gray-900"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
          
          <!-- Contact Info -->
          <div>
            <h2 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Información de contacto
            </h2>
            
            <div class="space-y-6">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 mt-1">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26c.33.18.78.18 1.11 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">Email</h3>
                  <p class="text-gray-600 dark:text-gray-400">contacto@taita.blog</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 mt-1">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">Tiempo de respuesta</h3>
                  <p class="text-gray-600 dark:text-gray-400">Respondemos en 24-48 horas</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 mt-1">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">Ubicación</h3>
                  <p class="text-gray-600 dark:text-gray-400">Global - Trabajo remoto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p class="text-gray-600 dark:text-gray-400 text-center">
            También puedes seguirnos en nuestras redes sociales para estar al día 
            con las últimas publicaciones y novedades.
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
useHead({
  title: 'Contacto',
  meta: [
    { name: 'description', content: 'Contáctanos para cualquier consulta o sugerencia.' }
  ]
});
</script>
