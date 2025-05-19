import type { Ref } from 'vue';

export interface Author {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  social_links?: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count?: number;
  featured_image?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count?: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  featured: boolean;
  published_at: string;
  updated_at: string;
  reading_time?: number;
  author_id: number;
  category_id?: number;
  author?: Author;
  category?: Category;
  tags?: Tag[];
  meta_title?: string;
  meta_description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BlogState {
  posts: Post[];
  featuredPosts: Post[];
  currentPost: Post | null;
  categories: Category[];
  currentCategory: Category | null;
  tags: Tag[];
  currentTag: Tag | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: Post[];
  tenant: string;
}

export interface BlogStore {
  // State
  posts: Ref<Post[]>;
  featuredPosts: Ref<Post[]>;
  currentPost: Ref<Post | null>;
  categories: Ref<Category[]>;
  currentCategory: Ref<Category | null>;
  tags: Ref<Tag[]>;
  currentTag: Ref<Tag | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  searchQuery: Ref<string>;
  searchResults: Ref<Post[]>;
  tenant: Ref<string>;
  
  // Getters
  recentPosts: Ref<Post[]>;
  popularPosts: Ref<Post[]>;
  relatedPosts: Ref<Post[]>;
  
  // Actions
  setTenant(tenant: string): void;
  fetchPosts(params?: Record<string, any>): Promise<void>;
  fetchPost(slug: string): Promise<Post | null>;
  fetchCategories(params?: Record<string, any>): Promise<Category[]>;
  fetchCategory(slug: string): Promise<Category | null>;
  fetchTags(params?: Record<string, any>): Promise<Tag[]>;
  fetchPostsByCategory(categorySlug: string, params?: Record<string, any>): Promise<Post[]>;
  fetchPostsByTag(tagSlug: string, params?: Record<string, any>): Promise<Post[]>;
  fetchTag(slug: string): Promise<Tag | null>;
  searchPosts(query: string, params?: Record<string, any>): Promise<Post[]>;
  getImageUrl(path?: string): string;
  formatDate(dateString: string, locale?: string): string;
}
