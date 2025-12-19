// src/types/response.types.ts

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Combined API response type
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  environment: string;
}
