# React Native App Architecture: Salonnz UserApp

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Naming Conventions](#naming-conventions)
4. [Tech Stack Decisions](#tech-stack-decisions)
5. [Development Dependencies](#development-dependencies)
6. [Build Configuration](#build-configuration)
7. [Environment Management](#environment-management)
8. [State Management Architecture](#state-management-architecture)
9. [API Layer Architecture](#api-layer-architecture)
10. [Component Architecture](#component-architecture)
11. [Testing Strategy](#testing-strategy)
12. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### Architecture Pattern: **Feature-Based Modular Architecture**

**Primary Pattern**: Feature-based modular architecture with clean separation of concerns, inspired by **Domain-Driven Design (DDD)** and **Feature-Sliced Design (FSD)**.

**Core Principles**:
1. **Feature Modularity**: Each feature is self-contained with its own components, hooks, and logic
2. **Layer Separation**: Clear separation between UI, business logic, data, and infrastructure
3. **Single Responsibility**: Each module has one clear purpose
4. **Scalability**: Easy to add new features without affecting existing ones
5. **Testability**: Each layer can be tested independently
6. **Maintainability**: Clear structure makes the codebase easy to navigate

### High-Level Architecture Layers

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (UI Components, Screens, Navigation)  │
├─────────────────────────────────────────┤
│           Business Logic Layer          │
│     (Hooks, State, Business Rules)     │
├─────────────────────────────────────────┤
│              Data Layer                 │
│  (API Services, Repositories, Storage) │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (Storage, Auth, Config, Utilities)    │
└─────────────────────────────────────────┘
```

---

## Folder Structure

### Recommended Expo Router Structure

```
salonnz-app/
│
├── app/                          # Expo Router (File-based routing)
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home screen
│   ├── (auth)/                  # Auth routes group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (main)/                  # Main app routes group (protected)
│   │   ├── _layout.tsx          # Bottom tab layout
│   │   ├── home/
│   │   │   ├── index.tsx        # Home screen
│   │   │   └── [salonId].tsx    # Dynamic salon page
│   │   ├── booking/
│   │   │   ├── _layout.tsx      # Booking stack layout
│   │   │   ├── index.tsx        # Location selection
│   │   │   ├── services/        # Service selection
│   │   │   ├── staff/           # Staff selection
│   │   │   ├── time/            # Time selection
│   │   │   ├── review/          # Review & confirm
│   │   │   └── confirmed/       # Confirmation
│   │   ├── appointments/
│   │   │   ├── index.tsx        # Appointments list
│   │   │   └── [id].tsx         # Appointment details
│   │   ├── account/
│   │   │   ├── index.tsx        # Account home
│   │   │   ├── profile.tsx      # Profile settings
│   │   │   └── settings.tsx     # App settings
│   │   └── gallery/
│   │       └── index.tsx        # Gallery
│   ├── gift-cards/
│   │   ├── index.tsx            # Gift cards list
│   │   └── buy/
│   │       └── index.tsx        # Buy flow
│   ├── memberships/
│   │   └── index.tsx
│   ├── packages/
│   │   └── index.tsx
│   └── +not-found.tsx           # 404 screen
│
├── src/                          # Source code
│   │
│   ├── features/                 # Feature modules (Domain-driven)
│   │   ├── auth/                 # Authentication feature
│   │   │   ├── components/       # Auth-specific components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── OAuthButtons.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useOAuth.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   ├── store/            # Feature-specific state (if needed)
│   │   │   │   └── authSlice.ts
│   │   │   └── index.ts          # Public API
│   │   │
│   │   ├── booking/              # Booking feature
│   │   │   ├── components/
│   │   │   │   ├── ServiceSelector.tsx
│   │   │   │   ├── StaffSelector.tsx
│   │   │   │   ├── TimeSlot.tsx
│   │   │   │   └── BookingSummary.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useBooking.ts
│   │   │   │   └── useAvailableSlots.ts
│   │   │   ├── services/
│   │   │   │   └── bookingService.ts
│   │   │   ├── types/
│   │   │   │   └── booking.types.ts
│   │   │   ├── store/
│   │   │   │   └── bookingSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── appointments/         # Appointments feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── store/
│   │   │   └── index.ts
│   │   │
│   │   ├── payments/             # Payments feature
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── store/
│   │   │
│   │   └── user/                 # User profile feature
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── store/
│   │
│   ├── entities/                 # Shared business entities
│   │   ├── User/
│   │   │   ├── User.ts           # TypeScript interface
│   │   │   ├── user.schema.ts    # Zod validation schema
│   │   │   └── index.ts
│   │   ├── Salon/
│   │   ├── Service/
│   │   ├── Appointment/
│   │   ├── Payment/
│   │   └── Staff/
│   │
│   ├── shared/                   # Shared utilities and components
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── LoadingSpinner/
│   │   │   └── index.ts
│   │   ├── hooks/                # Shared hooks
│   │   │   ├── useApi.ts
│   │   │   ├── useStorage.ts
│   │   │   └── useTheme.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts
│   │   │   ├── validation.ts
│   │   │   └── helpers.ts
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   └── api.ts
│   │   └── styles/               # Global styles and themes
│   │       ├── theme.ts
│   │       ├── globalStyles.ts
│   │       └── components/
│   │
│   ├── services/                 # External service integrations
│   │   ├── api/                  # API layer
│   │   │   ├── client.ts         # Axios instance
│   │   │   ├── interceptors.ts
│   │   │   ├── endpoints/        # API endpoint definitions
│   │   │   │   ├── auth.ts
│   │   │   │   ├── booking.ts
│   │   │   │   ├── appointments.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── auth/                 # Authentication service
│   │   │   ├── firebase.ts
│   │   │   ├── oauth.ts
│   │   │   └── tokenManager.ts
│   │   ├── storage/              # Storage services
│   │   │   ├── asyncStorage.ts
│   │   │   ├── secureStorage.ts
│   │   │   └── index.ts
│   │   ├── payments/
│   │   │   └── stripe.ts
│   │   └── notifications/
│   │       └── expoPush.ts
│   │
│   ├── store/                    # Global state management
│   │   ├── store.ts              # Root store configuration
│   │   ├── reducers.ts           # Root reducer
│   │   ├── persist.ts            # Persistence configuration
│   │   ├── slices/               # Redux Toolkit slices
│   │   │   ├── authSlice.ts
│   │   │   ├── themeSlice.ts
│   │   │   └── index.ts
│   │   └── selectors/            # Reselect selectors
│   │       ├── auth.selectors.ts
│   │       └── index.ts
│   │
│   └── types/                    # Global TypeScript types
│       ├── global.d.ts
│       ├── navigation.ts
│       └── api.ts
│
├── assets/                       # Static assets
│   ├── images/
│   │   ├── icons/
│   │   ├── logos/
│   │   └── placeholders/
│   ├── fonts/
│   └── animations/
│
├── config/                       # Configuration files
│   ├── env.ts                    # Environment configuration
│   ├── constants.ts              # App constants
│   └── index.ts
│
├── scripts/                      # Build and deployment scripts
│   ├── build-ios.sh
│   ├── build-android.sh
│   └── deploy.sh
│
├── .env                          # Environment variables
├── .env.development
├── .env.staging
├── .env.production
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Folder Structure Rationale

#### **app/** - Expo Router
- **Rationale**: File-based routing similar to Next.js, reducing boilerplate
- **Benefit**: Easier migration from Next.js, automatic code splitting
- **Convention**: Use parentheses `(group)` for route groups without adding to URL path

#### **features/** - Feature Modules
- **Rationale**: Domain-driven design; each feature is self-contained
- **Benefit**: Team can work on features independently, easy to remove/add features
- **Structure**: Each feature follows the "components/hooks/services/types" pattern

#### **entities/** - Business Entities
- **Rationale**: Reusable business objects shared across features
- **Benefit**: Single source of truth for data models, validation schemas
- **Contents**: TypeScript interfaces, Zod schemas, validation logic

#### **shared/** - Cross-cutting Concerns
- **Rationale**: DRY principle; components and utilities used across features
- **Benefit**: Consistent UI/UX, reduced code duplication
- **Structure**: Organized by type (components, hooks, utils, constants, styles)

#### **services/** - External Integrations
- **Rationale**: Separation of concerns; isolate external API logic
- **Benefit**: Easy to swap services, test independently, clear dependencies
- **Structure**: Each service type has its own folder (api, auth, storage, payments)

#### **store/** - State Management
- **Rationale**: Centralized global state with Redux Toolkit
- **Benefit**: Predictable state updates, time-travel debugging, middleware support
- **Structure**: Slices for feature-specific state, selectors for derived state

---

## Naming Conventions

### 1. **File Naming**

#### General Rules
- **Use kebab-case** for files and folders: `user-profile.tsx`
- **Use PascalCase** for components: `UserProfile.tsx`
- **Use camelCase** for utilities, hooks, and services: `formatDate.ts`
- **Use kebab-case** for configuration files: `app-config.json`

#### Specific Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase + Component suffix | `BookingCard.tsx`, `ServiceSelector.tsx` |
| **Screens** | PascalCase + no suffix | `HomeScreen.tsx`, `ProfileScreen.tsx` |
| **Hooks** | camelCase + "use" prefix | `useAuth.ts`, `useBooking.ts` |
| **Services** | camelCase + "Service" suffix | `authService.ts`, `paymentService.ts` |
| **Types** | camelCase + ".types.ts" suffix | `booking.types.ts`, `user.types.ts` |
| **Schemas** | camelCase + ".schema.ts" suffix | `user.schema.ts`, `appointment.schema.ts` |
| **Selectors** | camelCase + "selectors" suffix | `auth.selectors.ts`, `booking.selectors.ts` |
| **Utils** | camelCase, descriptive | `formatCurrency.ts`, `validateEmail.ts` |
| **Constants** | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts`, `COLORS.ts` |
| **Styles** | camelCase + "styles" suffix | `authStyles.ts`, `buttonStyles.ts` |
| **Features** | kebab-case, descriptive | `user-profile/`, `booking-flow/` |

### 2. **Variable Naming**

```typescript
// Constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://always.click/api/customers';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

// Types
type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

// Enums (or const objects)
enum BookingStep {
  LOCATION = 'location',
  SERVICES = 'services',
  STAFF = 'staff',
  TIME = 'time',
  REVIEW = 'review',
  CONFIRMED = 'confirmed',
}

// Regular variables (camelCase)
const userProfile = await getUserProfile();
const selectedServices = useSelector(selectSelectedServices);
const isLoading = ref(false);

// Boolean variables (should sound like true/false)
const isAuthenticated = true;
const hasPermission = false;
const shouldShowModal = true;
const canBookAppointment = true;
```

### 3. **Function Naming**

```typescript
// Use camelCase with verbs
function getUserProfile() {}
function validateForm() {}
function saveBooking() {}
function navigateToServices() {}

// Event handlers (handle + action)
function handleLogin() {}
function handleServiceSelect(serviceId: string) {}
function handleBookingConfirm() {}

// Custom hooks (use + functionality)
function useAuth() {}
function useAvailableSlots(date: Date) {}
function useTheme() {}

// Private methods (prefix with underscore)
class BookingService {
  private async _fetchAvailableSlots() {}
}
```

### 4. **CSS/Style Naming**

#### StyleSheet.create naming

```typescript
const styles = StyleSheet.create({
  // Container styles
  container: {},
  contentContainer: {},
  scrollContainer: {},

  // Layout styles
  row: {},
  column: {},
  center: {},

  // Typography
  headingLarge: {},
  headingMedium: {},
  bodyText: {},
  captionText: {},

  // Spacing
  marginBottom: { marginBottom: 16 },
  paddingHorizontal: { paddingHorizontal: 16 },

  // Colors
  primaryText: { color: colors.primary },
  secondaryText: { color: colors.text.secondary },

  // Component-specific
  bookingCard: {},
  serviceItem: {},
  staffAvatar: {},
});

// For complex styles, use descriptive names
const styles = StyleSheet.create({
  bookingSummaryContainer: {},
  bookingSummaryRow: {},
  bookingSummaryLabel: {},
  bookingSummaryValue: {},
});
```

#### Tailwind/NativeWind classes (if using)

```tsx
// Use semantic, component-based class names
<View className="booking-card">
  <Text className="booking-card-title">Haircut</Text>
  <View className="booking-card-content">
    <Text className="booking-card-price">$50</Text>
  </View>
</View>
```

### 5. **Import/Export Conventions**

```typescript
// Named exports (preferred for utilities and constants)
export const colors = {
  primary: '#d350bb',
  secondary: '#737373',
};

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

// Default exports (only for components and pages)
export default function BookingScreen() {
  return <View />;
}

// Barrel exports (index.ts files)
export * from './authService';
export * from './oauth';

// Re-exports for convenience
export { UserProfile } from './components/UserProfile';

// Internal imports (use relative paths)
import { User } from '../../entities/User/User';
import { useAuth } from '../../../shared/hooks/useAuth';

// External imports (use absolute paths from src/)
import { Button } from '@/shared/components/Button/Button';
import { apiClient } from '@/services/api/client';
```

---

## Tech Stack Decisions

### 1. **React Native Version: ^0.73.x (Latest Stable)**

**Rationale**:
- Latest stable version with improved Hermes engine support
- New Architecture support (Fabric, TurboModules)
- Better TypeScript support
- Active maintenance and bug fixes
- Expo SDK 50+ supports this version

**Version Constraint**: `"react-native": "^0.73.0"`

### 2. **Navigation Library: Expo Router + React Navigation v6**

**Choice**: Expo Router (recommended for Next.js migration)

**Rationale**:
- **File-based routing** similar to Next.js App Router
- **Built-in deep linking** support
- **Automatic code splitting** per route
- **Type-safe routing** with TypeScript
- **Grouping support** with parentheses `(auth)`
- **Simpler API** than React Navigation
- **Built by Expo** team with excellent support

**Implementation**:
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Screens */}
    </Stack>
  );
}
```

**Alternative (if needed)**: React Navigation v6
- `react-navigation/native` v6
- `react-navigation/bottom-tabs` v6
- `react-navigation/stack` v6

### 3. **State Management: Redux Toolkit + RTK Query**

**Choice**: Redux Toolkit (primary) + RTK Query (server state)

**Rationale**:
- **Already used in Next.js** → easier migration
- **Predictable state updates** with Redux
- **Excellent DevTools** for debugging
- **Middleware support** for async logic
- **RTK Query** for server state caching
- **Persistent storage** ready
- **Well-documented** and widely used

**Implementation**:
```typescript
// store/slices/bookingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  selectedServices: Service[];
  selectedStaff: Staff | null;
  currentStep: BookingStep;
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectService: (state, action: PayloadAction<Service>) => {
      state.selectedServices.push(action.payload);
    },
  },
});

// API slice with RTK Query
import { createApi } from '@reduxjs/toolkit/query/react';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/booking' }),
  endpoints: (builder) => ({
    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: '/create',
        method: 'POST',
        body,
      }),
    }),
  }),
});
```

**When to use Redux vs RTK Query**:
- **Redux**: UI state, user preferences, app settings, auth state
- **RTK Query**: Server state, API responses, caching

### 4. **API Client: Axios + Custom Wrapper**

**Choice**: Axios with custom wrapper

**Rationale**:
- **Already used in Next.js** → code reuse
- **Type safety** with TypeScript
- **Request/response interceptors** for auth tokens
- **Built-in error handling**
- **Request cancellation** support
- **Familiar API** for the team

**Implementation**:
```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh
          await this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  // ... other HTTP methods
}

export const apiClient = new ApiClient();
```

### 5. **Form Handling: React Hook Form + Zod**

**Choice**: React Hook Form + Zod validation

**Rationale**:
- **Excellent performance** (minimal re-renders)
- **Built-in validation** with schema support
- **TypeScript integration** (type inference from schemas)
- **Small bundle size**
- **DevTools** for debugging forms
- **Zod** for runtime type checking and validation

**Implementation**:
```typescript
// entities/User/user.schema.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

// components/UserProfileForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, User } from '@/entities/User/user.schema';

export function UserProfileForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: User) => {
    await updateProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Name"
          />
        )}
      />
      {errors.name && <Text style={{ color: 'red' }}>{errors.name.message}</Text>}

      <Button title="Save" onPress={handleSubmit(onSubmit)} />
    </form>
  );
}
```

### 6. **Storage Solution: AsyncStorage + Keychain**

**Choice**: AsyncStorage (general) + React Native Keychain (sensitive data)

**Rationale**:
- **AsyncStorage**: Simple key-value storage for non-sensitive data
- **Keychain**: Secure storage for auth tokens, payment info
- **Persistent state** across app restarts
- **Familiar API**
- **Good performance** for small data

**Implementation**:
```typescript
// services/storage/asyncStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Generic storage
  async setItem(key: string, value: any): Promise<void> {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  }

  async getItem<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  // Specific methods
  async setUser(user: User): Promise<void> {
    await this.setItem('user', user);
  }

  async getUser(): Promise<User | null> {
    return this.getItem<User>('user');
  }
}

export const storage = new StorageService();

// services/storage/secureStorage.ts
import * as Keychain from 'react-native-keychain';

class SecureStorageService {
  async setToken(token: string): Promise<void> {
    await Keychain.setInternetCredentials(
      'authToken',
      'username',
      token
    );
  }

  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getInternetCredentials('authToken');
    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  }

  async removeToken(): Promise<void> {
    await Keychain.resetInternetCredentials('authToken');
  }
}

export const secureStorage = new SecureStorageService();
```

### 7. **Data Validation: Zod**

**Choice**: Zod (for all runtime validation)

**Rationale**:
- **TypeScript-first** (infers types from schemas)
- **Runtime validation** (catches data shape errors)
- **Excellent documentation**
- **Small bundle size**
- **Composes well** with forms (react-hook-form)
- **Used across the app** for consistency

**Implementation**:
```typescript
// Validation schemas
import { z } from 'zod';

// API response validation
export const appointmentSchema = z.object({
  id: z.string(),
  date: z.date(),
  status: z.enum(['upcoming', 'completed', 'cancelled']),
  services: z.array(z.string()),
  totalPrice: z.number(),
});

// TypeScript inference
type Appointment = z.infer<typeof appointmentSchema>;

// Function parameter validation
export async function createBooking(data: unknown): Promise<Booking> {
  const validated = bookingSchema.parse(data);
  return apiClient.createBooking(validated);
}

// Nested objects
export const userSchema = z.object({
  profile: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
});
```

### 8. **UI Component Library: NativeBase**

**Choice**: NativeBase (or Tamagui for better performance)

**Rationale for NativeBase**:
- **Similar to NextUI** (current web library)
- **Pre-built components** (Button, Input, Card, etc.)
- **Theme support** with custom theming
- **TypeScript support**
- **Active maintenance**
- **Large community**

**Alternative**: Tamagui (better performance)
- **Optimized for React Native**
- **Cross-platform** (web + mobile)
- **Better performance** with server-side rendering
- **CSS-in-JS** with optimized runtime

**Implementation**:
```typescript
// styles/theme.ts
import { extendTheme } from 'native-base';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#ffe4fb',
      500: '#d350bb',
      600: '#b0459f',
    },
    gray: {
      50: '#f9fafb',
      500: '#737373',
      900: '#111827',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '10px',
        height: '48px',
      },
      variants: {
        solid: {
          bg: 'primary.500',
        },
        outline: {
          borderColor: 'primary.500',
          borderWidth: 1,
        },
      },
    },
  },
});

// app/_layout.tsx
import { NativeBaseProvider } from 'native-base';

export default function RootLayout() {
  return (
    <NativeBaseProvider theme={theme}>
      <Stack />
    </NativeBaseProvider>
  );
}
```

### 9. **Styling: NativeWind (Tailwind for React Native)**

**Choice**: NativeWind (if want Tailwind-like syntax)

**Rationale**:
- **Familiar syntax** (already using Tailwind in web)
- **Utility-first** approach
- **Good TypeScript support**
- **Smaller bundle** with unused CSS purging

**Alternative**: StyleSheet.create
- **Faster runtime** (no CSS processing)
- **Full TypeScript support**
- **More control** over styles
- **Better for complex styles**

**Implementation (NativeWind)**:
```typescript
// tailwind.config.js
/** @type {import('nativewind').TailwindConfig} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#d350bb',
        gray: {
          500: '#737373',
        },
      },
    },
  },
  plugins: [],
};

// Component usage
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-semibold text-gray-900">
    Book Appointment
  </Text>
  <View className="mt-4 bg-primary p-4 rounded-lg">
    <Text className="text-white">Selected Services</Text>
  </View>
</View>
```

---

## Development Dependencies

### **Core Dependencies**

```json
{
  "dependencies": {
    // Core React Native
    "react": "^18.2.0",
    "react-native": "^0.73.0",

    // Navigation & Routing
    "expo-router": "^3.4.7",
    "expo-linking": "~6.2.2",
    "expo-constants": "~15.4.5",

    // State Management
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "redux-persist": "^6.0.0",

    // API & Networking
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.12.2",

    // Forms & Validation
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",

    // UI Components
    "native-base": "^3.4.28",
    "react-native-svg": "^14.1.0",
    "@expo/vector-icons": "^14.0.0",

    // Styling
    "nativewind": "^2.0.11",
    "tailwindcss": "^3.3.5",

    // Storage
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-keychain": "^8.1.2",

    // Authentication
    "@react-native-firebase/app": "^18.6.2",
    "@react-native-firebase/auth": "^18.6.2",
    "@react-native-google-signin/google-signin": "^11.0.0",

    // Payment
    "@stripe/stripe-react-native": "^0.35.0",

    // Image Handling
    "expo-image-picker": "~14.7.1",
    "react-native-fast-image": "^8.6.3",

    // Utilities
    "date-fns": "^3.0.0",
    "lodash": "^4.17.21",
    "react-native-mmkv": "^2.12.1",
    "expo-device": "~5.9.3"
  }
}
```

### **Dev Dependencies**

```json
{
  "devDependencies": {
    // TypeScript & Types
    "typescript": "^5.3.2",
    "@types/react": "^18.2.45",
    "@types/react-native": "^0.73.0",
    "@types/lodash": "^4.14.202",

    // Testing
    "@testing-library/react-native": "^12.4.3",
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.7.0",
    "react-test-renderer": "^18.2.0",
    "msw": "^2.0.9",

    // Linting & Formatting
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.1",

    // Build & CI/CD
    "eas-cli": "^5.9.0",
    "@react-native-community/eslint-config": "^3.2.0",

    // Documentation
    "typedoc": "^0.25.7"
  }
}
```

### **Installation Command**

```bash
# Core dependencies
npm install expo-router expo-linking expo-constants

# State management
npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage

# API & forms
npm install axios @tanstack/react-query react-hook-form @hookform/resolvers zod

# UI & styling
npm install native-base react-native-svg @expo/vector-icons nativewind tailwindcss

# Auth & payments
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-google-signin/google-signin @stripe/stripe-react-native

# Image & storage
npm install expo-image-picker react-native-fast-image react-native-keychain

# Utilities
npm install date-fns lodash react-native-mmkv

# Development dependencies
npm install -D typescript @types/react @types/react-native @types/lodash
npm install -D @testing-library/react-native @testing-library/jest-native jest react-test-renderer
npm install -D eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eas-cli
```

---

## Build Configuration

### 1. **Expo Application Services (EAS)**

**Choice**: EAS Build for simplified builds

**Rationale**:
- **Simplifies build process** (no native config needed)
- **Consistent builds** across platforms
- **Easy CI/CD** integration
- **OTA updates** support (Expo Updates)
- **App store submission** automation

**Configuration**:

```json
// eas.json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. **Project Configuration**

```json
// app.json
{
  "expo": {
    "name": "Salonnz",
    "slug": "salonnz-app",
    "version": "1.0.0",
    "scheme": "salonnz",
    "orientation": "portrait",
    "icon": "./assets/icons/app-icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/icons/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#d350bb"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.salonnz.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/app-icon.png",
        "backgroundColor": "#d350bb"
      },
      "package": "com.salonnz.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/icons/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "nativewind/babel",
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.salonnz.app",
          "enableGooglePay": true
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/icons/notification-icon.png",
          "color": "#d350bb"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 3. **Metro Configuration**

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver.assetExts.push('svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
```

### 4. **Build Scripts**

```json
// package.json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",

    "build:dev": "eas build --profile development --platform all",
    "build:preview": "eas build --profile preview --platform all",
    "build:prod": "eas build --profile production --platform all",

    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",

    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",

    "generate:types": "apicodegen"
  }
}
```

### 5. **Continuous Integration (GitHub Actions)**

```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --profile preview --non-interactive
```

---

## Environment Management

### 1. **Environment Variables Strategy**

**Choice**: Expo public environment variables + EAS secrets

**Rationale**:
- **Public variables** (non-sensitive): `EXPO_PUBLIC_*` prefix
- **Sensitive data** (API keys, secrets): EAS secrets
- **Type-safe** with TypeScript
- **Different values** per environment

### 2. **Environment File Structure**

```
.env                      # Default values (git-ignored)
.env.development          # Development values
.env.staging              # Staging values
.env.production           # Production values
```

### 3. **Environment Variables Definition**

```typescript
// config/env.ts
import Constants from 'expo-constants';

interface EnvConfig {
  API_BASE_URL: string;
  STRIPE_PUBLISHABLE_KEY: string;
  GOOGLE_CLIENT_ID: string;
  FACEBOOK_APP_ID: string;
  SENTRY_DSN: string;
  FEATURE_FLAGS: {
    enableDarkMode: boolean;
    enablePayments: boolean;
  };
}

const getEnvVars = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra as any;

  return {
    API_BASE_URL: extra?.API_BASE_URL || 'https://always.click/api/customers',
    STRIPE_PUBLISHABLE_KEY: extra?.STRIPE_PUBLISHABLE_KEY || '',
    GOOGLE_CLIENT_ID: extra?.GOOGLE_CLIENT_ID || '',
    FACEBOOK_APP_ID: extra?.FACEBOOK_APP_ID || '',
    SENTRY_DSN: extra?.SENTRY_DSN || '',
    FEATURE_FLAGS: {
      enableDarkMode: extra?.FEATURE_FLAGS?.enableDarkMode ?? true,
      enablePayments: extra?.FEATURE_FLAGS?.enablePayments ?? true,
    },
  };
};

export const env = getEnvVars();
export type { EnvConfig };
```

### 4. **Expo Configuration with Extra Fields**

```json
// app.json
{
  "expo": {
    "extra": {
      "API_BASE_URL": "https://always.click/api/customers",
      "STRIPE_PUBLISHABLE_KEY": "pk_test_...",
      "GOOGLE_CLIENT_ID": "your-google-client-id",
      "FACEBOOK_APP_ID": "your-facebook-app-id",
      "SENTRY_DSN": "https://...",
      "FEATURE_FLAGS": {
        "enableDarkMode": true,
        "enablePayments": true
      }
    }
  }
}
```

### 5. **EAS Secrets for Sensitive Data**

```bash
# Set secrets for EAS builds
eas secret:create --scope project --name GOOGLE_CLIENT_SECRET --value "your-secret"

# View secrets
eas secret:list
```

### 6. **Environment-Based Configuration**

```bash
# Development
EXPO_PUBLIC_API_BASE_URL=https://dev-api.always.click/api/customers
EXPO_PUBLIC_ENV=development

# Staging
EXPO_PUBLIC_API_BASE_URL=https://staging-api.always.click/api/customers
EXPO_PUBLIC_ENV=staging

# Production
EXPO_PUBLIC_API_BASE_URL=https://always.click/api/customers
EXPO_PUBLIC_ENV=production
```

### 7. **Configuration Validation**

```typescript
// config/validateEnv.ts
import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
});

export function validateConfig(config: any) {
  try {
    return envSchema.parse(config);
  } catch (error) {
    throw new Error('Invalid environment configuration');
  }
}
```

### 8. **Build Configuration Per Environment**

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "extra": {
        "ENVIRONMENT": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "extra": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "extra": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

---

## State Management Architecture

### Global State Structure

```
store/
├── store.ts                  # Store configuration
├── persist.ts                # Persistence config
├── reducers.ts               # Root reducer
├── slices/                   # Feature slices
│   ├── authSlice.ts          # Authentication state
│   ├── themeSlice.ts         # Theme preferences
│   ├── bookingSlice.ts       # Booking flow state
│   ├── appointmentsSlice.ts  # Appointments state
│   └── settingsSlice.ts      # App settings
└── selectors/                # Memoized selectors
    ├── auth.selectors.ts
    ├── booking.selectors.ts
    └── index.ts
```

### State Slices Design

#### **1. Auth Slice**

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/entities/User/User';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
```

#### **2. Booking Slice**

```typescript
// store/slices/bookingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service, Staff, Appointment } from '@/entities';

export type BookingStep = 'location' | 'services' | 'staff' | 'time' | 'review' | 'confirmed';

interface BookingState {
  selectedLocation: Salon | null;
  selectedServices: Service[];
  selectedStaff: Staff | null;
  selectedTime: Date | null;
  currentStep: BookingStep;
  appointmentData: Partial<Appointment> | null;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  selectedLocation: null,
  selectedServices: [],
  selectedStaff: null,
  selectedTime: null,
  currentStep: 'location',
  appointmentData: null,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectLocation: (state, action: PayloadAction<Salon>) => {
      state.selectedLocation = action.payload;
      state.currentStep = 'services';
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.selectedServices.push(action.payload);
      state.totalPrice += action.payload.price;
    },
    removeService: (state, action: PayloadAction<string>) => {
      const service = state.selectedServices.find(s => s.id === action.payload);
      if (service) {
        state.totalPrice -= service.price;
      }
      state.selectedServices = state.selectedServices.filter(s => s.id !== action.payload);
    },
    selectStaff: (state, action: PayloadAction<Staff>) => {
      state.selectedStaff = action.payload;
      state.currentStep = 'time';
    },
    selectTime: (state, action: PayloadAction<Date>) => {
      state.selectedTime = action.payload;
      state.currentStep = 'review';
    },
    goToNextStep: (state) => {
      const steps: BookingStep[] = ['location', 'services', 'staff', 'time', 'review', 'confirmed'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    },
    goToPreviousStep: (state) => {
      const steps: BookingStep[] = ['location', 'services', 'staff', 'time', 'review', 'confirmed'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
      }
    },
    resetBooking: () => initialState,
  },
});

export const {
  selectLocation,
  addService,
  removeService,
  selectStaff,
  selectTime,
  goToNextStep,
  goToPreviousStep,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
```

#### **3. Theme Slice**

```typescript
// store/slices/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  isDark: boolean;
  primaryColor: string;
}

const initialState: ThemeState = {
  mode: 'system',
  isDark: false,
  primaryColor: '#d350bb',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.mode = action.payload;
      // Update isDark based on mode
      if (action.payload === 'system') {
        state.isDark = /* check system preference */ false;
      } else {
        state.isDark = action.payload === 'dark';
      }
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
  },
});

export const { setThemeMode, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;
```

### Selectors with Reselect

```typescript
// store/selectors/booking.selectors.ts
import { createSelector, createFeatureSelector } from '@reduxjs/toolkit';
import { BookingState } from '@/store/slices/bookingSlice';

const selectBookingState = createFeatureSelector<BookingState>('booking');

export const selectSelectedServices = createSelector(
  selectBookingState,
  (state) => state.selectedServices
);

export const selectBookingTotal = createSelector(
  selectSelectedServices,
  (services) => services.reduce((total, service) => total + service.price, 0)
);

export const selectBookingStep = createSelector(
  selectBookingState,
  (state) => state.currentStep
);

export const selectCanProceedToNextStep = createSelector(
  selectBookingState,
  (state) => {
    switch (state.currentStep) {
      case 'location':
        return !!state.selectedLocation;
      case 'services':
        return state.selectedServices.length > 0;
      case 'staff':
        return !!state.selectedStaff;
      case 'time':
        return !!state.selectedTime;
      default:
        return false;
    }
  }
);
```

### Store Configuration

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import themeReducer from './slices/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  booking: bookingReducer,
  theme: themeReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'theme'], // Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## API Layer Architecture

### 1. **API Client Structure**

```
services/api/
├── client.ts              # Axios instance
├── interceptors.ts        # Request/response interceptors
├── endpoints/             # API endpoint definitions
│   ├── auth.ts
│   ├── booking.ts
│   ├── appointments.ts
│   └── index.ts
└── index.ts               # Exports
```

### 2. **Axios Instance Configuration**

```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Platform': 'mobile',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add salon slug from context
        const currentSalon = await AsyncStorage.getItem('currentSalon');
        if (currentSalon) {
          config.headers['X-Client-Slug'] = currentSalon;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request
            return this.client.request(error.config);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  async refreshToken(): Promise<boolean> {
    // Implement token refresh logic
    return false;
  }

  private formatError(error: any) {
    if (error.response) {
      return {
        message: error.response.data.message || 'API Error',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        message: 'Network error',
        status: 0,
      };
    } else {
      return {
        message: error.message,
        status: 0,
      };
    }
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

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }
}

export const apiClient = new ApiClient();
```

### 3. **Endpoint Definitions**

```typescript
// services/api/endpoints/booking.ts
import { apiClient } from '../client';
import { z } from 'zod';
import { bookingSchema } from '@/entities/Booking/booking.schema';

const CreateBookingRequest = z.object({
  salonId: z.string(),
  services: z.array(z.string()),
  staffId: z.string().optional(),
  appointmentDate: z.string(),
  notes: z.string().optional(),
});

export const bookingApi = {
  // Get available time slots
  getAvailableSlots: async (salonId: string, date: string): Promise<TimeSlot[]> => {
    return apiClient.get(`/booking/slots/${salonId}`, { params: { date } });
  },

  // Get service add-ons
  getServiceAddons: async (serviceId: string): Promise<Addon[]> => {
    return apiClient.get(`/services/${serviceId}/addons`);
  },

  // Create booking
  createBooking: async (data: z.infer<typeof CreateBookingRequest>): Promise<Booking> => {
    const validated = CreateBookingRequest.parse(data);
    return apiClient.post('/booking/create', validated);
  },

  // Cancel booking
  cancelBooking: async (bookingId: string): Promise<void> => {
    return apiClient.post(`/booking/${bookingId}/cancel`);
  },

  // Update booking
  updateBooking: async (bookingId: string, data: Partial<CreateBookingRequest>): Promise<Booking> => {
    return apiClient.patch(`/booking/${bookingId}`, data);
  },
};
```

### 4. **RTK Query Alternative**

```typescript
// services/api/rtkApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiClient } from './client';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAvailableSlots: builder.query<TimeSlot[], { salonId: string; date: string }>({
      query: ({ salonId, date }) => `/booking/slots/${salonId}?date=${date}`,
    }),
    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: '/booking/create',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetAvailableSlotsQuery, useCreateBookingMutation } = bookingApi;
```

---

## Component Architecture

### Component Hierarchy

```
Component (Base)
├── Screen Component (Page)
│   ├── Layout Component
│   │   ├── Presentation Components
│   │   │   ├── UI Components (Button, Input)
│   │   │   └── Composite Components (Card, List)
│   │   └── Custom Hooks (useAuth, useApi)
│   └── Business Logic
│       ├── Event Handlers
│       └── State Selectors
```

### Component Patterns

#### 1. **Screen Component**

```typescript
// app/(main)/booking/_layout.tsx (Stack layout)
import { Stack } from 'expo-router';
import { useBooking } from '@/features/booking/hooks/useBooking';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="services" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="time" />
      <Stack.Screen name="review" />
      <Stack.Screen name="confirmed" />
    </Stack>
  );
}

// app/(main)/booking/index.tsx (Screen)
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Button } from '@/shared/components';

export default function LocationSelectionScreen() {
  const { goToNextStep } = useBooking();
  const router = useRouter();

  const handleSelectLocation = (location: Salon) => {
    // Update state
    goToNextStep();
    // Navigate to next step
    router.push('/booking/services');
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>Select Location</Text>
      {/* Location list */}
    </View>
  );
}
```

#### 2. **Feature Component**

```typescript
// features/booking/components/ServiceSelector.tsx
import { View, FlatList } from 'react-native';
import { Service } from '@/entities';
import { ServiceCard } from './ServiceCard';
import { useAvailableServices } from '@/features/booking/hooks/useAvailableServices';

interface ServiceSelectorProps {
  salonId: string;
  onServiceSelect: (service: Service) => void;
}

export function ServiceSelector({ salonId, onServiceSelect }: ServiceSelectorProps) {
  const { data: services, isLoading, error } = useAvailableServices(salonId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={services}
      renderItem={({ item }) => (
        <ServiceCard service={item} onPress={() => onServiceSelect(item)} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}
```

#### 3. **UI Component**

```typescript
// shared/components/Button/Button.tsx
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/shared/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.gray[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.gray[300],
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary,
  },
});
```

---

## Testing Strategy

### 1. **Testing Stack**

- **Unit Testing**: Jest + React Native Testing Library
- **Integration Testing**: Jest + Testing Library
- **E2E Testing**: Detox (for React Native)
- **Component Testing**: Storybook (optional)

### 2. **Testing Structure**

```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── integration/
│   └── screens/
└── e2e/
    └── booking-flow.spec.ts
```

### 3. **Example Test**

```typescript
// __tests__/unit/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/shared/components/Button/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Click me" onPress={() => {}} />
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} />
    );
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## Performance Optimization

### 1. **Performance Strategies**

- **Hermes Engine**: Enable for better performance
- **Lazy Loading**: Use React.lazy for route-based code splitting
- **Image Optimization**: Use FastImage with caching
- **List Virtualization**: Use FlatList with getItemLayout
- **Memoization**: Use React.memo and useMemo
- **Bundle Splitting**: Leverage Expo Router's automatic code splitting

### 2. **Optimized Components**

```typescript
// components/AppointmentList.tsx
import { memo, useMemo } from 'react';
import { FlatList } from 'react-native';
import { AppointmentCard } from './AppointmentCard';

const AppointmentList = memo(({ appointments }: { appointments: Appointment[] }) => {
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [appointments]);

  const renderItem = useCallback(({ item }: { item: Appointment }) => (
    <AppointmentCard appointment={item} />
  ), []);

  return (
    <FlatList
      data={sortedAppointments}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
});
```

---

## Summary

This architecture provides a **scalable, maintainable, and performant** foundation for the React Native application:

### Key Architectural Decisions

1. **Feature-Based Structure**: Easy to maintain and scale
2. **Expo Router**: Next.js-like file-based routing
3. **Redux Toolkit**: Familiar state management
4. **Type Safety**: TypeScript + Zod validation
5. **Clean Code**: Consistent naming and separation of concerns
6. **Modern Stack**: Latest React Native with Expo

### Benefits

✅ **Scalability**: Feature modules can grow independently
✅ **Maintainability**: Clear structure and conventions
✅ **Type Safety**: End-to-end type checking
✅ **Developer Experience**: Familiar patterns and tools
✅ **Performance**: Optimized for mobile
✅ **Testability**: Each layer is testable in isolation

### Migration Path

The architecture is designed to make migration from Next.js **as smooth as possible** by:
- Maintaining similar file structures (app directory)
- Reusing existing business logic
- Preserving Redux state management
- Keeping API integration patterns

**Total Dependencies**: 30+ carefully selected packages
**Estimated Build Time**: 5-7 minutes with EAS
**Bundle Size Target**: <50MB (uncompressed)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Architecture Type**: Feature-Based Modular Architecture
