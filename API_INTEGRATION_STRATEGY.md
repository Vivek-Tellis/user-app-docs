# API Integration Strategy: Salonnz UserApp

## Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Critical Issues Found](#critical-issues-found)
3. [Optimization Opportunities](#optimization-opportunities)
4. [Recommended Architecture](#recommended-architecture)
5. [API Service Layer Design](#api-service-layer-design)
6. [Validation Layer Architecture](#validation-layer-architecture)
7. [Caching Strategy](#caching-strategy)
8. [Error Handling Strategy](#error-handling-strategy)
9. [React Native Optimizations](#react-native-optimizations)
10. [Migration Guide](#migration-guide)

---

## Current State Analysis

### Axios Instance Configuration

**File**: `utils/axiosInstance.ts`

```typescript
const axiosInstance = axios.create({
  baseURL: "https://always.click/api/customers",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const client_slug = store.getState().slug.slug || "";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (client_slug) {
      config.headers["X-Client-Slug"] = client_slug;
    }
    config.headers["Accept"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Current Issues**:
- No timeout configuration
- No retry logic
- Only request interceptor (no response interceptor)
- No global error handling
- No request cancellation support

### API Module Organization

| Module | File | Endpoints |
|--------|------|-----------|
| Home | `homeApi.ts` | 13 endpoints |
| Booking | `bookingApi.ts` | 22 endpoints |
| Appointment | `appoinmentApi.ts` | 6 endpoints |
| Notification | `notificationApi.ts` | 3 endpoints |
| Account | `accountApi.ts` | 9 endpoints |
| Buying Card | `buyingcardApi.ts` | 5 endpoints |
| Purchased | `purchasedApi.ts` | 3 endpoints |
| Feedback | `feedbackApi.ts` | 5 endpoints |

### State Management
- Redux for global state
- Data stored in `home` slice
- No built-in caching beyond Redux store

---

## Critical Issues Found

### 1. Redundant API Calls

**Same Endpoints in Multiple Files**:

| Endpoint | Location 1 | Location 2 |
|----------|------------|------------|
| `/booking/get-membership` | `homeApi.ts` line 20 | `buyingcardApi.ts` line 7 |
| `/booking/get-gift-card` | `homeApi.ts` line 35 | `buyingcardApi.ts` line 33 |
| `/booking/get-package` | `homeApi.ts` line 50 | `buyingcardApi.ts` line 59 |

**Impact**: Duplicate code, inconsistent handling, maintenance overhead

### 2. Duplicate Appointment Functions

**File**: `api/appoinmentApi.ts`

Three nearly identical functions (lines 3-91):
```typescript
getUpcomingAppointments()   // lines 3-31
getCompletedAppointments()  // lines 33-61
getCancelledAppointments()  // lines 63-91
```

All call `/appt` with different status parameter.

**Solution**: Consolidate into single function:
```typescript
getAppointments(status: 'upcoming' | 'completed' | 'cancelled')
```

### 3. Redundant Authorization Headers

The axios interceptor adds Authorization automatically, but API files also add it manually:

**Files with redundant headers**:
- `appoinmentApi.ts` - ALL functions
- `notificationApi.ts` - ALL functions
- `purchasedApi.ts` - ALL functions

**Impact**: Code duplication, potential header conflicts

### 4. Promise Constructor Anti-Pattern

**All API files use this pattern**:
```typescript
export const getUpcomingAppointments = (status: any, slug: any) =>
  new Promise<any>(async (resolve, reject) => {
    try {
      const response = await useFetchApi<any>(...);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
```

**Should be**:
```typescript
export const getUpcomingAppointments = async (status: any, slug: any) => {
  return useFetchApi<any>(...);
};
```

### 5. Misnamed useFetchApi Hook

**File**: `hooks/useFetchApi.ts`

- Named with `use` prefix but is NOT a React hook
- Doesn't use useState, useEffect, or any React features
- Should be renamed to `fetchApi`

---

## Optimization Opportunities

### 1. Waterfall Calls to Parallelize

#### Critical: persistCompare.ts (8 Sequential Calls)

**File**: `utils/persistCompare.ts` lines 180-190

```typescript
// CURRENT: Sequential - ~4-8 seconds
const sliderData = await fetchSliderData();
const membershipDataFetched = await fetchMembershipData();
const giftCardDataFetched = await fetchGiftCardData();
const packageDataFetched = await fetchPackageData();
const purchasedMembershipData = await getPurchasedMembership(email, slug);
const purchasedGiftCardData = await getPurchasedGift(email, slug);
const purchasedPackageData = await getPurchasedPackage(email, slug);
const reviewSettingsData = await fetchReviewSettings();
```

**OPTIMIZED: Parallel - ~0.5-1 second**
```typescript
const [
  sliderData,
  membershipDataFetched,
  giftCardDataFetched,
  packageDataFetched,
  purchasedMembershipData,
  purchasedGiftCardData,
  purchasedPackageData,
  reviewSettingsData,
] = await Promise.all([
  fetchSliderData(),
  fetchMembershipData(),
  fetchGiftCardData(),
  fetchPackageData(),
  getPurchasedMembership(email, slug),
  getPurchasedGift(email, slug),
  getPurchasedPackage(email, slug),
  fetchReviewSettings(),
]);
```

#### Critical: Appointment Layout (3 Sequential Calls)

**File**: `app/[slug]/appointment/layout.tsx` lines 57-65

```typescript
// CURRENT: Sequential - ~1.5-3 seconds
const { data } = await getUpcomingAppointments(statusOne, slug);
const { data: cancelCards } = await getCancelledAppointments(statusFour, slug);
const { data: completedCards } = await getCompletedAppointments(statusTwo, slug);
```

**OPTIMIZED: Parallel - ~0.5-1 second**
```typescript
const [upcoming, cancelled, completed] = await Promise.all([
  getUpcomingAppointments(statusOne, slug),
  getCancelledAppointments(statusFour, slug),
  getCompletedAppointments(statusTwo, slug),
]);
```

#### High Impact: Initial App Data (5 Sequential Calls)

**File**: `utils/persistCompare.ts` lines 85-100

```typescript
// CURRENT: Sequential
const updatedUser = await getUpdatedCustomer();
const colorData = await getColor();
const locationData = await getLocations();
const bookingSettings = await getBookingSettings();
const galleryDataFetched = await fetchAboutGalleryData();
```

**OPTIMIZED: Parallel**
```typescript
const [updatedUser, colorData, locationData, bookingSettings, galleryDataFetched] =
  await Promise.all([
    getUpdatedCustomer(),
    getColor(),
    getLocations(),
    getBookingSettings(),
    fetchAboutGalleryData(),
  ]);
```

### 2. Batching Opportunities

#### Opportunity 1: Single Appointment Endpoint

```typescript
// CURRENT: 3 API calls
await getUpcomingAppointments(slug);
await getCompletedAppointments(slug);
await getCancelledAppointments(slug);

// PROPOSED: 1 API call (requires backend support)
await getAllAppointments(slug);
// Returns: { upcoming: [], completed: [], cancelled: [] }
```

#### Opportunity 2: Purchased Items Batch

```typescript
// CURRENT: 3 calls
await getPurchasedMembership(email, slug);
await getPurchasedGift(email, slug);
await getPurchasedPackage(email, slug);

// PROPOSED: 1 call
await getPurchasedItems(email, slug);
// Returns: { memberships: [], giftCards: [], packages: [] }
```

#### Opportunity 3: Initial App Data Batch

```typescript
// CURRENT: 5+ calls
await getColor();
await getLocations();
await getBookingSettings();
await fetchSliderData();
await fetchAboutGalleryData();

// PROPOSED: 1 call
await getInitialAppData(slug);
// Returns: { colors, locations, settings, slider, gallery }
```

### 3. Over-Fetching Scenarios

| Scenario | Current | Optimized |
|----------|---------|-----------|
| Notification count | Full notification object | Only `unread_count` field |
| User profile | All user fields | Specific fields needed |
| Appointment list | Full nested objects | Summary view fields |

---

## Recommended Architecture

### Enhanced Axios Configuration

```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class ApiClient {
  private client: AxiosInstance;
  private retryCount: Map<string, number> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Platform': 'mobile',
      },
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private setupRequestInterceptor() {
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add salon slug
        const slug = await AsyncStorage.getItem('currentSlug');
        if (slug) {
          config.headers['X-Client-Slug'] = slug;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private setupResponseInterceptor() {
    this.client.interceptors.response.use(
      (response) => {
        // Clear retry count on success
        const requestId = response.config.headers?.['X-Request-ID'];
        if (requestId) {
          this.retryCount.delete(requestId);
        }
        return response.data;
      },
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retry?: boolean };
        const requestId = config?.headers?.['X-Request-ID'] as string;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !config._retry) {
          config._retry = true;
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.client.request(config);
          }
          // Redirect to login
          await this.handleUnauthorized();
        }

        // Retry logic for 5xx errors
        if (error.response?.status && error.response.status >= 500) {
          const currentRetry = this.retryCount.get(requestId) || 0;
          if (currentRetry < MAX_RETRIES) {
            this.retryCount.set(requestId, currentRetry + 1);
            await this.delay(RETRY_DELAY * (currentRetry + 1));
            return this.client.request(config);
          }
        }

        // Format error for consistent handling
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );

      await AsyncStorage.setItem('authToken', response.data.token);
      return true;
    } catch {
      return false;
    }
  }

  private async handleUnauthorized() {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
    // Navigate to login screen
  }

  private formatError(error: AxiosError) {
    if (error.response) {
      return {
        message: (error.response.data as any)?.message || 'API Error',
        status: error.response.status,
        errors: (error.response.data as any)?.errors,
        code: 'API_ERROR',
      };
    } else if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    } else {
      return {
        message: error.message,
        status: 0,
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
```

---

## API Service Layer Design

### Feature-Based Organization

```
src/
├── services/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── index.ts               # Exports
│   │   └── endpoints/
│   │       ├── auth.api.ts        # Authentication endpoints
│   │       ├── booking.api.ts     # Booking endpoints
│   │       ├── appointments.api.ts # Appointment endpoints
│   │       ├── home.api.ts        # Home page data
│   │       ├── account.api.ts     # User account
│   │       ├── payments.api.ts    # Payment processing
│   │       └── index.ts           # Barrel exports
```

### Typed API Service Example

```typescript
// services/api/endpoints/booking.api.ts
import { apiClient } from '../client';
import { z } from 'zod';
import {
  locationSchema,
  serviceSchema,
  staffSchema,
  slotSchema,
  bookingRequestSchema,
  bookingResponseSchema
} from '@/entities';

// Types inferred from Zod schemas
type Location = z.infer<typeof locationSchema>;
type Service = z.infer<typeof serviceSchema>;
type Staff = z.infer<typeof staffSchema>;
type Slot = z.infer<typeof slotSchema>;
type BookingRequest = z.infer<typeof bookingRequestSchema>;
type BookingResponse = z.infer<typeof bookingResponseSchema>;

export const bookingApi = {
  // Get all locations
  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get<{ status: boolean; data: Location[] }>(
      '/booking/get-location-list'
    );
    return locationSchema.array().parse(response.data);
  },

  // Get services by location
  getServicesByLocation: async (locationId: number): Promise<Service[]> => {
    const response = await apiClient.post<{ status: boolean; data: Service[] }>(
      '/booking/get-service-by-location',
      { location_id: locationId }
    );
    return serviceSchema.array().parse(response.data);
  },

  // Get staff by location and services
  getStaffByService: async (
    services: string,
    location: string
  ): Promise<Staff[]> => {
    const response = await apiClient.post<{ status: boolean; data: Staff[] }>(
      '/booking/get-service-staff',
      { services, location }
    );
    return staffSchema.array().parse(response.data);
  },

  // Get available time slots
  getAvailableSlots: async (params: {
    locationId: number;
    startDate: string;
    endDate: string;
    servicePricingOptions: number[];
    staff?: number[];
  }): Promise<Record<string, Slot[]>> => {
    const response = await apiClient.post<{ status: boolean; data: Record<string, Slot[]> }>(
      '/booking/get-slot',
      {
        location_id: params.locationId,
        start_date: params.startDate,
        end_date: params.endDate,
        service_pricing_options: params.servicePricingOptions,
        staff: params.staff,
      }
    );
    return response.data;
  },

  // Create booking
  createBooking: async (data: BookingRequest): Promise<BookingResponse> => {
    // Validate request data
    const validated = bookingRequestSchema.parse(data);

    const response = await apiClient.post<{ status: boolean; data: BookingResponse }>(
      '/booking/save-booking',
      validated
    );

    // Validate response data
    return bookingResponseSchema.parse(response.data);
  },

  // Batch: Get initial booking data (parallel)
  getInitialBookingData: async (locationId: number) => {
    const [services, staff, settings] = await Promise.all([
      bookingApi.getServicesByLocation(locationId),
      apiClient.post('/booking/get-staff-list-by-location', { location_id: locationId }),
      apiClient.get('/booking/get-front-settings'),
    ]);

    return { services, staff: staff.data, settings: settings.data };
  },
};
```

### Consolidated Appointment API

```typescript
// services/api/endpoints/appointments.api.ts
import { apiClient } from '../client';
import { appointmentSchema } from '@/entities';
import { z } from 'zod';

type Appointment = z.infer<typeof appointmentSchema>;
type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export const appointmentsApi = {
  // Single function for all appointment statuses
  getAppointments: async (
    status: AppointmentStatus
  ): Promise<Appointment[]> => {
    const statusMap = {
      upcoming: '1',
      completed: '2',
      cancelled: '4',
    };

    const response = await apiClient.post<{ status: boolean; data: Appointment[] }>(
      '/appt',
      { status: statusMap[status] }
    );

    return appointmentSchema.array().parse(response.data);
  },

  // Batch: Get all appointments (parallel)
  getAllAppointments: async () => {
    const [upcoming, completed, cancelled] = await Promise.all([
      appointmentsApi.getAppointments('upcoming'),
      appointmentsApi.getAppointments('completed'),
      appointmentsApi.getAppointments('cancelled'),
    ]);

    return { upcoming, completed, cancelled };
  },

  // Get single appointment detail
  getAppointmentDetail: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get<{ status: boolean; data: Appointment }>(
      `/appt/show/${id}`
    );
    return appointmentSchema.parse(response.data);
  },

  // Cancel appointment
  cancelAppointment: async (
    appointmentId: number,
    reason?: string
  ): Promise<void> => {
    await apiClient.post('/appt/cancelAppt', {
      appointment_id: appointmentId,
      reason,
    });
  },

  // Reschedule appointment
  rescheduleAppointment: async (
    appointmentId: number,
    newDate: string,
    newTime: string
  ): Promise<void> => {
    await apiClient.post('/booking/rescheduleTime', {
      appointment_id: appointmentId,
      new_date: newDate,
      new_time: newTime,
    });
  },
};
```

---

## Validation Layer Architecture

### When to Validate

| Scenario | When | Why |
|----------|------|-----|
| Request data | Before API call | Prevent invalid requests, fast feedback |
| Response data | After API call | Ensure data integrity, catch API changes |
| Form data | On submit | User feedback before network call |
| Route params | On navigation | Prevent invalid routes |

### Where to Validate

```
User Input → Form Validation → API Request Validation → Network → API Response Validation → State Update
```

### Zod Schema Organization

```
src/
├── entities/
│   ├── User/
│   │   ├── user.schema.ts       # Zod schemas
│   │   ├── user.types.ts        # TypeScript types (inferred)
│   │   └── index.ts
│   ├── Appointment/
│   │   ├── appointment.schema.ts
│   │   └── index.ts
│   └── Booking/
│       ├── booking.schema.ts
│       └── index.ts
```

### Validation Middleware

```typescript
// services/api/validation.ts
import { z } from 'zod';

// Generic validation wrapper for API responses
export function validateResponse<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('API Response Validation Error:', {
        errors: error.errors,
        data,
      });
      // In development: throw error
      // In production: log to monitoring service
      throw new Error('Invalid API response format');
    }
    throw error;
  }
}

// Safe parse that doesn't throw
export function safeValidateResponse<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  return schema.safeParse(data);
}

// Request validation
export function validateRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      errors: result.error.format(),
    };
  }
  return result.data;
}
```

### Usage in API Service

```typescript
// services/api/endpoints/auth.api.ts
import { apiClient } from '../client';
import { validateRequest, validateResponse } from '../validation';
import {
  loginRequestSchema,
  loginResponseSchema,
  userSchema
} from '@/entities';

export const authApi = {
  login: async (credentials: unknown) => {
    // Validate request
    const validatedCredentials = validateRequest(loginRequestSchema, credentials);

    // Make API call
    const response = await apiClient.post('/user/verify-otp-login', validatedCredentials);

    // Validate response
    return validateResponse(loginResponseSchema, response.data);
  },

  getProfile: async () => {
    const response = await apiClient.get('/user/me');
    return validateResponse(userSchema, response.data);
  },
};
```

---

## Caching Strategy

### Recommended: TanStack Query (React Query)

```typescript
// services/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Caching Policies by Endpoint Type

| Endpoint Type | Stale Time | Cache Time | Example |
|---------------|------------|------------|---------|
| Static content | 24 hours | 7 days | Policies, terms |
| Semi-static | 1 hour | 24 hours | Locations, categories |
| Dynamic | 5 minutes | 30 minutes | Services, staff |
| Real-time | 0 | 5 minutes | Slots, notifications |
| User-specific | 5 minutes | 30 minutes | Profile, appointments |
| Transactional | 0 | 0 | Payments, bookings |

### Query Hook Examples

```typescript
// features/booking/hooks/useServices.ts
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/services/api';

export function useServices(locationId: number) {
  return useQuery({
    queryKey: ['services', locationId],
    queryFn: () => bookingApi.getServicesByLocation(locationId),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!locationId,
  });
}

// features/appointments/hooks/useAppointments.ts
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/services/api';

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments', 'all'],
    queryFn: () => appointmentsApi.getAllAppointments(),
    staleTime: 0, // Always fresh
    refetchInterval: 60 * 1000, // Poll every minute
  });
}

// Prefetching for navigation
export function usePrefetchAppointmentDetail(id: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['appointment', id],
      queryFn: () => appointmentsApi.getAppointmentDetail(id),
    });
  };
}
```

### Cache Invalidation

```typescript
// features/booking/hooks/useCreateBooking.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/services/api';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
```

---

## Error Handling Strategy

### Error Types

```typescript
// types/errors.ts
export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  originalError?: unknown;
}
```

### Global Error Handler

```typescript
// services/api/errorHandler.ts
import { Alert } from 'react-native';
import { ApiError } from '@/types/errors';

export function handleApiError(error: ApiError) {
  switch (error.code) {
    case 'NETWORK_ERROR':
      Alert.alert(
        'Connection Error',
        'Please check your internet connection and try again.'
      );
      break;

    case 'AUTH_ERROR':
      // Navigate to login
      // Clear stored credentials
      break;

    case 'VALIDATION_ERROR':
      // Show field-specific errors in form
      break;

    case 'SERVER_ERROR':
      Alert.alert(
        'Server Error',
        'Something went wrong. Please try again later.'
      );
      // Log to monitoring service
      break;

    default:
      Alert.alert('Error', error.message);
  }
}
```

### Error Boundary for React Native

```typescript
// shared/components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

## React Native Optimizations

### Network State Detection

```typescript
// hooks/useNetworkState.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkState() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, connectionType };
}
```

### Request Cancellation

```typescript
// hooks/useAbortableQuery.ts
import { useEffect, useRef } from 'react';

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Cancel any pending requests on unmount
      controllerRef.current?.abort();
    };
  }, []);

  const getController = () => {
    // Abort previous request
    controllerRef.current?.abort();
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current;
  };

  return { getController };
}

// Usage in API call
const controller = getController();
const response = await apiClient.get('/endpoint', {
  signal: controller.signal,
});
```

### Offline Queue

```typescript
// services/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    this.queue.push(queuedRequest);
    await this.saveQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    const { isConnected } = await NetInfo.fetch();
    if (!isConnected) return;

    this.isProcessing = true;

    for (const request of [...this.queue]) {
      try {
        await this.executeRequest(request);
        this.queue = this.queue.filter(r => r.id !== request.id);
      } catch (error) {
        // Keep in queue for retry
        console.error('Failed to process queued request:', error);
      }
    }

    await this.saveQueue();
    this.isProcessing = false;
  }

  private async executeRequest(request: QueuedRequest) {
    // Execute the queued request
  }

  private async saveQueue() {
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }

  async loadQueue() {
    const saved = await AsyncStorage.getItem('offlineQueue');
    this.queue = saved ? JSON.parse(saved) : [];
  }
}

export const offlineQueue = new OfflineQueue();
```

---

## Migration Guide

### Phase 1: Foundation (Week 1)

1. **Create new API client** with enhanced axios configuration
2. **Add response interceptor** for global error handling
3. **Add retry logic** for transient failures
4. **Configure timeout** (30 seconds recommended)

### Phase 2: Quick Wins (Week 2)

1. **Parallelize waterfall calls** in:
   - `persistCompare.ts` (8 calls → Promise.all)
   - `appointment/layout.tsx` (3 calls → Promise.all)
   - `page.tsx` (multiple sequential phases)

2. **Remove redundant Authorization headers** from:
   - `appoinmentApi.ts`
   - `notificationApi.ts`
   - `purchasedApi.ts`

3. **Consolidate duplicate API functions**:
   - Merge 3 appointment status functions into 1
   - Remove duplicates in homeApi/buyingcardApi

### Phase 3: Validation Layer (Week 3)

1. **Define Zod schemas** for all entities
2. **Implement validation middleware**
3. **Add request/response validation** to critical endpoints
4. **Update TypeScript types** to use schema inference

### Phase 4: Caching (Week 4)

1. **Install TanStack Query**
2. **Configure QueryClient** with default options
3. **Create query hooks** for each data type
4. **Implement cache invalidation** patterns

### Phase 5: Error Handling (Week 5)

1. **Define error types** and codes
2. **Implement global error handler**
3. **Add error boundary** component
4. **Connect to monitoring service** (Sentry, etc.)

### Phase 6: React Native Specific (Week 6)

1. **Add network state detection**
2. **Implement request cancellation**
3. **Set up offline queue** for critical operations
4. **Configure background refresh** strategies

---

## Performance Impact Summary

| Optimization | Before | After | Improvement |
|--------------|--------|-------|-------------|
| persistCompare.ts (8 calls) | 4-8 seconds | 0.5-1 second | **80-90%** |
| Appointment layout (3 calls) | 1.5-3 seconds | 0.5-1 second | **66-75%** |
| Main page load | 5-10 seconds | 1-2 seconds | **80%** |
| Cache hits | 0% | 60-80% | **N/A** |
| Retry success rate | 0% | 90%+ | **N/A** |

**Total estimated improvement: 60-80% reduction in data loading times**

---

## Summary

This API integration strategy addresses critical performance issues in the current implementation:

1. **Parallel Execution**: Convert waterfall calls to parallel execution using Promise.all
2. **Validation**: Runtime type safety with Zod schemas
3. **Caching**: TanStack Query for intelligent caching and deduplication
4. **Error Handling**: Centralized error handling with retry logic
5. **Code Quality**: Remove anti-patterns and redundant code
6. **React Native**: Network detection, offline support, request cancellation

Implementing these optimizations will result in significantly improved user experience with faster load times, better error recovery, and more reliable data fetching.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Estimated Implementation Time**: 6 weeks
