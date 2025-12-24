import axios from 'axios';
import { Review, PropertyStats } from '../types/review';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ReviewFilters {
  listingId?: string;
  listingIds?: string[];
  propertyName?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyPostalCode?: string;
  minRating?: number;
  maxRating?: number;
  category?: string;
  channel?: string;
  type?: 'guest-to-host' | 'host-to-guest';
  from?: string;
  to?: string;
  approved?: boolean;
  sortBy?: 'submittedAt' | 'overallRating' | 'propertyName';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PropertyFilters {
  name?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  /**
   * Get all reviews with optional filters and pagination
   */
  getReviews: async (filters?: ReviewFilters): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'listingIds' && Array.isArray(value)) {
            // Handle array of listing IDs
            value.forEach((id) => params.append('listingIds', id));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await api.get<{ 
      status: string; 
      count: number; 
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      traceId?: string;
    }>(`/reviews/hostaway?${params.toString()}`);
    
    return {
      data: response.data.reviews || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 50,
        total: response.data.count || 0,
        totalPages: 1,
      },
    };
  },

  /**
   * Get property statistics
   * Note: Property filtering and pagination is handled client-side, except channel which is server-side
   */
  getPropertyStats: async (filters?: PropertyFilters): Promise<PaginatedResponse<PropertyStats>> => {
    const params = new URLSearchParams();
    if (filters?.channel) {
      params.append('channel', filters.channel);
    }
    
    const queryString = params.toString();
    const url = `/reviews/properties${queryString ? `?${queryString}` : ''}`;
    
    // Fetch all properties (filtering will be done client-side, except channel)
    const response = await api.get<{ status: string; properties: PropertyStats[]; traceId?: string }>(
      url
    );
    
    const properties = response.data.properties || [];
    
    // Return all properties - filtering and pagination handled in component
    return {
      data: properties,
      pagination: {
        page: 1,
        limit: properties.length,
        total: properties.length,
        totalPages: 1,
      },
    };
  },

  /**
   * Get approved reviews for public display with pagination
   */
  getApprovedReviews: async (propertyId?: string, page?: number, limit?: number): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    
    const queryString = params.toString();
    const url = propertyId 
      ? `/reviews/approved/${propertyId}${queryString ? `?${queryString}` : ''}`
      : `/reviews/approved${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<{ 
      status: string; 
      count: number; 
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      traceId?: string;
    }>(url);
    
    return {
      data: response.data.reviews || [],
      pagination: response.data.pagination || {
        page: page || 1,
        limit: limit || 50,
        total: response.data.count || 0,
        totalPages: 1,
      },
    };
  },

  /**
   * Toggle approval status of a review
   */
  toggleApproval: async (reviewId: number): Promise<boolean> => {
    const response = await api.patch<{ status: string; reviewId: number; approved: boolean; traceId?: string }>(
      `/reviews/${reviewId}/approve`
    );
    
    return response.data.approved;
  },

  /**
   * Get all available channels
   */
  getChannels: async (): Promise<string[]> => {
    const response = await api.get<{ status: string; channels: string[]; traceId?: string }>(
      '/reviews/channels'
    );
    
    return response.data.channels || [];
  },

  /**
   * Get property information by propertyId
   */
  getProperty: async (propertyId: string): Promise<{ propertyId: string; propertyName: string; categories: string | null } | null> => {
    try {
      const response = await api.get<{ 
        status: string; 
        property: { propertyId: string; propertyName: string; categories: string | null };
        traceId?: string;
      }>(`/reviews/property/${propertyId}`);
      
      return response.data.property || null;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.data?.status === 'error') {
        return null;
      }
      throw error;
    }
  },
};

