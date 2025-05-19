import type { AuthConfig } from '~/types/auth';

/**
 * Authentication configuration
 * This file contains all the authentication related configuration
 * for the application.
 */
const authConfig: AuthConfig = {
  // Authentication endpoints
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    user: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    emailVerification: '/auth/email/verify',
    emailVerificationNotification: '/auth/email/verification-notification',
    passwordUpdate: '/user/password',
    profileUpdate: '/user/profile-information',
  },

  // Token configuration
  token: {
    // Token type (e.g., 'Bearer')
    type: 'Bearer',
    // Token storage key
    storageKey: 'auth_token',
    // Token expiration (in minutes)
    expiresIn: 60 * 24 * 7, // 7 days
  },

  // User storage key
  userStorageKey: 'auth_user',

  // Redirect configuration
  redirects: {
    // Redirect after successful login
    login: '/dashboard',
    // Redirect after successful logout
    logout: '/',
    // Redirect after successful registration
    register: '/dashboard',
    // Redirect when authentication is required
    requiresAuth: '/auth/login',
    // Redirect when user is already authenticated
    guest: '/dashboard',
    // Redirect after email verification
    verification: '/dashboard',
    // Redirect after password reset
    resetPassword: '/auth/login',
  },

  // Feature flags
  features: {
    // Enable registration
    registration: true,
    // Enable email verification
    emailVerification: true,
    // Enable password reset
    resetPassword: true,
    // Enable profile updates
    updateProfile: true,
    // Enable password updates
    updatePassword: true,
    // Enable two-factor authentication
    twoFactor: true,
  },

  // Password requirements
  password: {
    // Minimum password length
    minLength: 8,
    // Require at least one uppercase letter
    requireUppercase: true,
    // Require at least one numeric character
    requireNumeric: true,
    // Require at least one special character
    requireSpecialCharacter: true,
  },

  // Two-factor authentication configuration
  twoFactor: {
    // Enable two-factor authentication
    enabled: true,
    // Two-factor authentication window (in seconds)
    window: 30,
    // Number of recovery codes to generate
    recoveryCodes: 10,
  },

  // Social authentication providers
  socialite: {
    // Enable social authentication
    enabled: true,
    // Available social providers
    providers: [
      'google',
      'facebook',
      'twitter',
      'github',
      'gitlab',
      'bitbucket',
    ],
    // Social authentication endpoints
    endpoints: {
      redirect: '/auth/social/{provider}',
      callback: '/auth/social/{provider}/callback',
    },
  },

  // Session configuration
  session: {
    // Session lifetime (in minutes)
    lifetime: 120,
    // Whether to refresh the session on page load
    refreshOnLoad: true,
    // Session storage key
    storageKey: 'auth_session',
  },

  // CSRF protection
  csrf: {
    // Enable CSRF protection
    enabled: true,
    // CSRF token key
    tokenKey: 'XSRF-TOKEN',
    // CSRF token header
    header: 'X-XSRF-TOKEN',
  },
};

export default authConfig;
