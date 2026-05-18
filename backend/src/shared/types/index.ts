// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: 'CLIENT' | 'VETERINARY' | 'ADMIN';
  iat?: number;
  exp?: number;
}

// Authenticated User Request
export interface AuthenticatedRequest {
  user: JwtPayload;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Filter
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
