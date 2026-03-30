<template>
  <div class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold mb-4">Política de Privacidad</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-10">Última actualización: 30 de marzo de 2026</p>

    <div class="reading-content prose prose-lg dark:prose-invert max-w-none">
      <h2>1. Información que recopilamos</h2>
      <p>Este blog es parte de la plataforma <a href="https://taita.blog" target="_blank" rel="noopener">Taita Blog</a>. Recopilamos:</p>
      <ul>
        <li><strong>Datos de suscripción:</strong> tu correo electrónico y nombre (opcional) cuando te suscribes al blog.</li>
        <li><strong>Datos de uso:</strong> información técnica como dirección IP, tipo de navegador y páginas visitadas, mediante Google Analytics.</li>
        <li><strong>Cookies:</strong> para sesiones de suscriptor, analytics y publicidad.</li>
      </ul>

      <h2>2. Cómo usamos la información</h2>
      <ul>
        <li>Enviarte enlaces de acceso al contenido exclusivo (magic links).</li>
        <li>Verificar tu acceso a contenido para suscriptores o premium.</li>
        <li>Analizar el tráfico del blog para mejorar el contenido.</li>
        <li>Mostrar anuncios relevantes mediante Google AdSense.</li>
      </ul>

      <h2>3. Publicidad</h2>
      <p>Este blog puede mostrar anuncios de Google AdSense. Google utiliza cookies para ofrecer anuncios basados en tus visitas a este y otros sitios. Puedes gestionar tus preferencias en <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">la configuración de anuncios de Google</a>.</p>
      <p>Los suscriptores premium no ven anuncios.</p>

      <h2>4. Cookies</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Propósito</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>subscriber_token</td>
            <td>Mantener tu sesión de suscriptor</td>
            <td>30 días</td>
          </tr>
          <tr>
            <td>_ga, _gid</td>
            <td>Google Analytics</td>
            <td>2 años / 24h</td>
          </tr>
          <tr>
            <td>__gads, __gpi</td>
            <td>Google AdSense</td>
            <td>13 meses</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Tus derechos</h2>
      <p>Puedes:</p>
      <ul>
        <li>Solicitar acceso a tus datos personales.</li>
        <li>Pedir la eliminación de tu suscripción y datos asociados.</li>
        <li>Desactivar cookies en tu navegador.</li>
        <li>Optar por no recibir anuncios personalizados en la configuración de Google.</li>
      </ul>

      <h2>6. Compartir información</h2>
      <p>No vendemos tu información. Compartimos datos únicamente con:</p>
      <ul>
        <li><strong>Taita Blog:</strong> la plataforma que aloja este blog.</li>
        <li><strong>Google:</strong> para analytics y publicidad.</li>
        <li><strong>Patreon:</strong> si el blog tiene integración para contenido premium (solo si tú conectas tu cuenta).</li>
      </ul>

      <h2>7. Contacto</h2>
      <p>Para consultas de privacidad: <a href="mailto:contacto@taita.blog">contacto@taita.blog</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Política de Privacidad',
  meta: [
    { name: 'description', content: 'Política de privacidad del blog — cómo recopilamos y usamos tu información.' },
  ],
});
</script>
