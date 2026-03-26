// Client related types
export interface Client {
  id: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

export interface UpdateClientInput {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

// Order related types
export interface Order {
  id: number;
  client_id: number;
  order_date: string;
  description: string;
  address: string;
  mobile: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  clientId: number;
  orderDate?: string;
  description: string;
  address: string;
  mobile: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// User related types
export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Social Media Link types
export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon_path: string;
  display_order: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSocialMediaLinkInput {
  platform: string;
  url: string;
  icon_path: string;
  display_order?: number;
}

export interface UpdateSocialMediaLinkInput {
  platform?: string;
  url?: string;
  icon_path?: string;
  display_order?: number;
}

// Slider Content types
export interface SliderContent {
  id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'gif';
  title_en: string | null;
  title_ar: string | null;
  button_text_en: string | null;
  button_text_ar: string | null;
  button_url: string | null;
  show_button: boolean;
  display_order: number;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSliderContentInput {
  media_url: string;
  media_type: 'image' | 'video' | 'gif';
  title_en?: string;
  title_ar?: string;
  button_text_en?: string;
  button_text_ar?: string;
  button_url?: string;
  show_button?: boolean;
  display_order?: number;
  is_visible?: boolean;
}

export interface UpdateSliderContentInput {
  media_url?: string;
  media_type?: 'image' | 'video' | 'gif';
  title_en?: string;
  title_ar?: string;
  button_text_en?: string;
  button_text_ar?: string;
  button_url?: string;
  show_button?: boolean;
  display_order?: number;
  is_visible?: boolean;
}
