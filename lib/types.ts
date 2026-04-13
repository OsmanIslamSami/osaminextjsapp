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

// News types
export interface News {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image_url: string;
  storage_type: 'blob' | 'local';
  file_data?: Uint8Array | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  published_date: string;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNewsInput {
  title_en?: string;
  title_ar?: string;
  image_url: string;
  storage_type: 'blob' | 'local';
  file_data?: Uint8Array;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  published_date: string;
  is_visible?: boolean;
}

export interface UpdateNewsInput {
  title_en?: string;
  title_ar?: string;
  image_url?: string;
  published_date?: string;
  is_visible?: boolean;
}

export interface NewsListResponse {
  news: News[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// FAQ types
export interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite: boolean;
  display_order: number;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface FAQFormData {
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite?: boolean;
}

export interface CreateFAQInput extends FAQFormData {}

export interface UpdateFAQInput extends Partial<FAQFormData> {}

export interface FAQListResponse {
  data: FAQ[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Magazine types
export interface Magazine {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  storage_type: 'blob' | 'local';
  file_data?: Uint8Array | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  download_link: string;
  published_date: string;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface MagazineFormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  published_date: string;
}

export interface CreateMagazineInput extends MagazineFormData {
  image_url: string;
  storage_type: 'blob' | 'local';
  file_data?: Uint8Array;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  download_link: string;
}

export interface UpdateMagazineInput extends Partial<MagazineFormData> {
  image_url?: string;
  storage_type?: 'blob' | 'local';
  file_data?: Uint8Array;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  download_link?: string;
}

export interface MagazineListResponse {
  data: Magazine[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

