// User role and permission types
export type UserRole = 'admin' | 'editor' | 'author' | 'subscriber' | string;
export type UserPermission = string;

// Base user interface
export interface BaseUser {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Extended user interface with roles and permissions
export interface User extends BaseUser {
  roles?: UserRole[];
  permissions?: UserPermission[];
  meta?: Record<string, any>;
}

// Authentication response
export interface AuthResponse {
  user: User;
  token: string;
  token_type?: string;
  expires_in?: number;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

// Registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  [key: string]: any; // Allow additional fields
}

// Password reset request
export interface ForgotPasswordData {
  email: string;
}

// Password reset confirmation
export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Email verification request
export interface VerifyEmailData {
  id: string | number;
  hash: string;
  expires: string;
  signature: string;
}

// Social authentication providers
export type SocialProvider = 'google' | 'facebook' | 'twitter' | 'github' | 'gitlab' | 'bitbucket';

// Social authentication parameters
export interface SocialAuthParams {
  provider: SocialProvider;
  token: string;
  remember?: boolean;
}

// API tokens
export interface PersonalAccessToken {
  id: string | number;
  name: string;
  abilities: string[];
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

// Two-factor authentication configuration
export interface TwoFactorAuthConfig {
  enabled: boolean;
  qr_code_url?: string;
  secret_key?: string;
  recovery_codes?: string[];
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth store actions
export interface AuthActions {
  initAuth: () => void;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; error?: string }>;
  fetchUser: () => Promise<User | null>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  hasPermission: (permission: UserPermission) => boolean;
  hasAnyPermission: (permissions: UserPermission[]) => boolean;
  hasAllPermissions: (permissions: UserPermission[]) => boolean;
}

// Auth store type
export type AuthStore = AuthState & AuthActions;

// Global type augmentation
declare module '#app' {
  interface NuxtApp {
    $auth: AuthStore;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: AuthStore;
  }
}

// Global window augmentation
declare global {
  interface Window {
    $auth?: AuthStore;
  }
}
