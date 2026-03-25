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
