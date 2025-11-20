# Task 001: Core Architecture Implementation

## Overview
Implement the foundational architecture components including Redux store with RTK Query, Expo Router configuration, navigation structure, and global context providers following ARCHITECTURE.md specifications.

## Description
Set up the core architecture infrastructure that all features will build upon. This includes configuring Redux Toolkit with RTK Query for server state management, setting up Expo Router for file-based navigation, creating global contexts (Auth, Theme), and establishing the navigation container structure.

## Acceptance Criteria
- [ ] Redux store configured with Redux Toolkit
- [ ] RTK Query configured with base API client
- [ ] Redux slices directory structure created (store/slices/)
- [ ] Selectors directory created (store/selectors/)
- [ ] Expo Router configured with root layout
- [ ] Navigation container set up with proper TypeScript types
- [ ] Route groups created for (auth) and (app) routes
- [ ] Loading screen component implemented
- [ ] AuthContext implemented for global auth state
- [ ] Theme context implemented for dark/light mode
- [ ] Error boundary components implemented
- [ ] Global state persistence configured (AsyncStorage)
- [ ] Navigation state persistence configured
- [ ] App providers wrapped in root layout
- [ ] TypeScript types for navigation created
- [ ] Deep linking configuration added
- [ ] Screen tracking/analytics setup
- [ ] Accessibility configuration applied

## Dependencies
**Prerequisites:**
- task_000: Project Setup & Configuration

**Blocked Tasks:** All feature tasks depend on this core architecture

## Component Requirements
### New Components Created
1. **AppProviders.tsx** - Global context providers wrapper
2. **RootLayout.tsx** - Root layout with providers
3. **LoadingScreen.tsx** - Loading state component
4. **ErrorBoundary.tsx** - Error boundary wrapper
5. **AuthGuard.tsx** - Route protection component
6. **NetworkStatus.tsx** - Network connectivity indicator

### Updated Components
None

## API Requirements
**RTK Query Base Setup:**
- Configure baseQuery with axios client
- Set up endpoints directory structure
- Configure cache policies
- Set up error handling
- Configure retry logic
- Set up auth token injection

**API Client Configuration:**
- Base URL from environment variables
- Timeout configuration (30s)
- Request/response interceptors
- Auth token header injection
- Error response formatting

## Validation Requirements
- Validate Redux store state shape
- Validate RTK Query schemas
- Validate navigation state
- Validate all configuration objects
- Validate environment variable types

## Complexity Estimate
**L (Large)** - 2-3 weeks effort

This involves setting up multiple interconnected systems (Redux, Router, Contexts) that must work together correctly.

## Priority Level
**P0 (Critical)** - Foundation for all feature development

## Estimated Effort
100-140 hours

## Testing Requirements
- Unit tests for Redux slices
- Integration tests for store configuration
- Navigation flow tests
- Context provider tests
- Error boundary tests
- E2E tests for navigation flow

## File Structure Created
```
src/
├── store/
│   ├── index.ts                    # Store configuration
│   ├── slices/                     # Redux slices
│   ├── selectors/                  # Typed selectors
│   └── types/                      # Store TypeScript types
├── contexts/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── types.ts
├── app/
│   ├── _layout.tsx                 # Root layout
│   ├── (auth)/_layout.tsx          # Auth route group
│   ├── (app)/_layout.tsx           # App route group
│   └── +not-found.tsx              # 404 screen
├── services/
│   └── api/                        # RTK Query endpoints
└── components/
    └── shared/                     # Shared components (loading, error)
```

## Key Implementation Details

### Redux Store Structure
```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    // Other slices will be added in subsequent tasks
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});
```

### RTK Query Setup
```typescript
// services/api/baseQuery.ts
export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
```

### Expo Router Configuration
```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </Providers>
  );
}
```

## Notes
- Follow ARCHITECTURE.md specifications exactly
- Use DEVELOPMENT_GUIDELINES.md for all code patterns
- All components must include full TypeScript typing
- Implement proper error handling for all async operations
- Use TanStack Query for server state, Redux for client state
- Ensure navigation state persists across app restarts
