/**
 * API-specific type definitions
 */

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface MutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
}
