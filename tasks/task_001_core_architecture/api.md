# API Requirements - Task 001: Core Architecture Implementation

## Primary API Endpoints
**Setup & Configuration Only - No External API Calls**

This task sets up the infrastructure for API calls but makes no external requests.

## Base Query Configuration

### Axios Configuration
```typescript
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### RTK Query Base Query
```typescript
// services/api/baseQuery.ts
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Inject auth token from Redux store
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  // Serialize query arguments
  serializeQueryArgs: ({ queryArgs, endpointDefinition }) => {
    const { page, limit, ...rest } = queryArgs;
    return endpointDefinition.baseQuery === 'getAppointments'
      ? { ...rest, sort: 'date:desc' }
      : queryArgs;
  },
  // Merge same queries with different args
  merge: (currentCache, newItems) => {
    if (newItems?.length && currentCache?.length) {
      return [...currentCache, ...newItems];
    }
    return newItems || currentCache;
  },
  // Force refetch on new args
  forceRefetch({ previousArg, currentArg }) {
    return previousArg !== currentArg;
  },
});
```

## Alternative API Approaches

### Option 1: RTK Query (Recommended)
**Pros:**
- Built-in caching and invalidation
- Automatic retry logic
- Optimistic updates
- Built-in loading states
- Type-safe endpoints

**Cons:**
- Learning curve for team
- Additional boilerplate

### Option 2: TanStack Query Only
**Pros:**
- Familiar from Next.js
- Simple API

**Cons:**
- Manual state management
- No Redux integration

**Recommendation:** Use RTK Query for better state integration

## Dependent API Calls
**None in this task**

Future tasks will establish call chains like:
1. Login → Fetch User Profile
2. Fetch Appointments → Fetch Appointment Details

## Parallel API Calls
**None in this task**

Future tasks will use Promise.all for:
- Initial app data (slider, user, notifications)
- Salon details (salon, services, reviews, staff)

## Validation Schemas
**Internal Configuration Validation:**

```typescript
// Validate Redux store configuration
const storeSchema = z.object({
  reducer: z.record(z.string(), z.any()),
  middleware: z.any(),
});

// Validate RTK Query configuration
const rtkQuerySchema = z.object({
  baseQuery: z.any(),
  endpoints: z.record(z.string(), z.any()),
});

// Validate API client
const apiClientSchema = z.object({
  defaults: z.object({
    baseURL: z.string().url(),
    timeout: z.number().positive(),
    headers: z.object({
      'Content-Type': z.string(),
    }),
  }),
});
```

## Caching Strategy

### RTK Query Cache Configuration
```typescript
// Global cache settings
const defaultMiddleware = getDefaultMiddleware({
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  },
});

// Cache policies by endpoint type
const endpoints = {
  // Cache for 5 minutes, refetch on window focus
  getSalons: {
    type: 'query',
    options: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
  // Cache for 10 minutes
  getUserProfile: {
    type: 'query',
    options: {
      staleTime: 10 * 60 * 1000,
      refetchOnMount: 'always',
    },
  },
};
```

### Persisted State
```typescript
// Persist auth state
const persistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'token', 'isAuthenticated'],
};

// Persist navigation state
const navigationPersistConfig = {
  key: 'navigation',
  storage: AsyncStorage,
  blacklist: ['index', 'routes'],
};
```

## Error Scenarios & Handling

### Network Errors
```typescript
// Base query error handling
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const errorStatus = result.error.status;

    // Handle different error types
    switch (errorStatus) {
      case 401:
        // Unauthorized - clear auth state
        api.dispatch(logout());
        break;
      case 403:
        // Forbidden - show error message
        api.dispatch(setError('Access denied'));
        break;
      case 500:
        // Server error - show generic error
        api.dispatch(setError('Server error. Please try again.'));
        break;
      default:
        // Network or other error
        if (result.error.data?.message) {
          api.dispatch(setError(result.error.data.message));
        }
    }
  }

  return result;
};
```

### Retry Logic Configuration
```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders,
});

const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Retry on 5xx errors
  if (result.error && isServerError(result.error.status)) {
    const retryCount = (api.extra as any)?.retryCount || 0;
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return baseQueryWithRetry(args, api, { ...extraOptions, retryCount: retryCount + 1 });
    }
  }

  return result;
};
```

## Performance Considerations
- **Cache Size:** Limit cache to prevent memory issues
- **Refetch Triggers:** Configure appropriate stale times
- **Pagination:** Implement cursor-based pagination for large lists
- **Background Refetch:** Enable for critical data (appointments)
- **Optimistic Updates:** Use for user actions (booking, cancellation)
