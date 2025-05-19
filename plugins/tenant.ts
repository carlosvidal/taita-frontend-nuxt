import { defineNuxtPlugin } from '#app';
import { useBlogStore } from '~/stores/blog';

export default defineNuxtPlugin((nuxtApp) => {
  // Solo se ejecuta en el cliente
  if (process.client) {
    const blogStore = useBlogStore();
    
    // Función para extraer el subdominio
    const getSubdomain = (hostname: string): string => {
      // Si estamos en localhost o en una IP, usamos 'demo' por defecto
      if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return 'demo';
      }
      
      // Si estamos en un dominio de desarrollo de Render
      if (hostname.endsWith('.onrender.com')) {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          return parts[0];
        }
        return 'demo';
      }
      
      // Para dominios personalizados
      const parts = hostname.split('.');
      if (parts.length > 2) {
        // Si hay más de dos partes, asumimos que el subdominio es la primera parte
        return parts[0];
      }
      
      // Si no hay subdominio, usamos 'demo' como valor por defecto
      return 'demo';
    };
    
    // Obtener el hostname actual
    const hostname = window.location.hostname;
    const subdomain = getSubdomain(hostname);
    
    // Establecer el tenant en el store
    blogStore.setTenant(subdomain);
    
    console.log(`Tenant detectado: ${subdomain}`);
  }
});
