// This plugin runs only on the client side to handle tenant configuration
export default defineNuxtPlugin((nuxtApp) => {
  // Only run on client side
  if (process.client) {
    const blogStore = useBlogStore();
    
    // Function to determine tenant from hostname
    const getTenantFromHostname = () => {
      const hostname = window?.location?.hostname || '';
      const subdomain = hostname.split('.')[0];
      return ['localhost', '127.0.0.1', 'www', ''].includes(subdomain) 
        ? 'taita' 
        : subdomain;
    };
    
    // Set initial tenant
    const initialTenant = getTenantFromHostname();
    blogStore.setTenant(initialTenant);
    
    // Optional: Listen for URL changes if needed
    // const router = useRouter();
    // router.afterEach(() => {
    //   const newTenant = getTenantFromHostname();
    //   if (newTenant !== blogStore.currentTenant) {
    //     blogStore.setTenant(newTenant);
    //   }
    // });
  }
});
