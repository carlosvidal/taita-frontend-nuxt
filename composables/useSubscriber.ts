/**
 * Composable for subscriber authentication and content access control.
 * Subscribers are blog readers (not admins) who register via magic link.
 * Their JWT is stored in a cookie for SSR compatibility.
 */
export const useSubscriber = () => {
  const subscriberToken = useCookie('subscriber_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  });

  const subscriber = useState<{
    uuid: string;
    email: string;
    name: string | null;
    tier: 'FREE' | 'PREMIUM';
  } | null>('subscriber', () => null);

  const isSubscribed = computed(() => !!subscriber.value);
  const isPremium = computed(() => subscriber.value?.tier === 'PREMIUM');

  /**
   * Subscribe with email — sends magic link.
   */
  const subscribe = async (email: string, name?: string) => {
    const config = useRuntimeConfig();
    const { tenant } = useTenant();

    const response = await $fetch<{ success: boolean; message: string }>(
      `${config.public.apiBase}/subscribers/public/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Taita-Subdomain': tenant.value || 'demo',
        },
        body: { email, name },
      }
    );

    return response;
  };

  /**
   * Verify magic link token and store subscriber JWT.
   */
  const verifyMagicLink = async (token: string) => {
    const config = useRuntimeConfig();

    const response = await $fetch<{
      success: boolean;
      token: string;
      subscriber: { uuid: string; email: string; name: string | null; tier: 'FREE' | 'PREMIUM' };
    }>(`${config.public.apiBase}/subscribers/public/verify-magic-link/${token}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (response.success) {
      subscriberToken.value = response.token;
      subscriber.value = response.subscriber;
    }

    return response;
  };

  /**
   * Get current subscriber token for API requests.
   */
  const getToken = () => subscriberToken.value;

  /**
   * Get authorization headers if subscriber is logged in.
   */
  const getAuthHeaders = (): Record<string, string> => {
    const token = subscriberToken.value;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  /**
   * Clear subscriber session.
   */
  const logout = () => {
    subscriberToken.value = null;
    subscriber.value = null;
  };

  /**
   * Initialize subscriber from stored token (decode JWT payload).
   */
  const initSubscriber = () => {
    const token = subscriberToken.value;
    if (!token) return;

    try {
      // Decode JWT payload (no verification, just read claims)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.type === 'subscriber' && payload.exp * 1000 > Date.now()) {
        subscriber.value = {
          uuid: '', // Not in JWT, will be fetched if needed
          email: payload.email,
          name: null,
          tier: payload.tier,
        };
      } else {
        // Token expired or wrong type
        logout();
      }
    } catch {
      logout();
    }
  };

  // Auto-initialize on composable use
  if (!subscriber.value && subscriberToken.value) {
    initSubscriber();
  }

  return {
    subscriber,
    subscriberToken,
    isSubscribed,
    isPremium,
    subscribe,
    verifyMagicLink,
    getToken,
    getAuthHeaders,
    logout,
    initSubscriber,
  };
};
