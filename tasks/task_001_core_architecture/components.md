# Component Requirements - Task 001: Core Architecture Implementation

## Components Involved

### 1. AppProviders.tsx
**Purpose:** Global context providers wrapper
**Type:** Provider Component

```typescript
interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
}
```

**Props:**
- children: React.ReactNode (required)

**State Requirements:**
- Redux store state
- TanStack Query client state
- Persistor state
- Auth context state
- Theme context state

---

### 2. RootLayout.tsx
**Purpose:** Root layout with providers
**Type:** Layout Component

```typescript
export default function RootLayout() {
  const [fontsLoaded] = useFontAsync();

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <AppProviders>
      <Stack>
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(app)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Oops!' }}
        />
      </Stack>
      <NetworkStatus />
    </AppProviders>
  );
}
```

**Props:** None

**State Requirements:**
- Font loading state
- Navigation state
- Network connectivity

---

### 3. LoadingScreen.tsx
**Purpose:** Loading state component
**Type:** Atomic Component

```typescript
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}
```

**Props:**
- message?: string (optional loading message)

**State Requirements:** None

---

### 4. ErrorBoundary.tsx
**Purpose:** Error boundary wrapper
**Type:** Higher-Order Component

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

**Props:**
- children: React.ReactNode (required)
- fallback?: React.ComponentType (optional custom fallback)

**State Requirements:**
- Error state (hasError, error)

---

### 5. AuthGuard.tsx
**Purpose:** Route protection component
**Type:** Composite Component

```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.replace(redirectTo);
    return null;
  }

  return <>{children}</>;
}
```

**Props:**
- children: React.ReactNode (required)
- redirectTo?: string (optional redirect path)

**State Requirements:**
- Auth context state (isAuthenticated, isLoading)
- Navigation state

---

### 6. NetworkStatus.tsx
**Purpose:** Network connectivity indicator
**Type:** Atomic Component

```typescript
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(netInfo.isConnected);
    const unsubscribe = netInfo.addEventListener(updateOnlineStatus);

    return () => unsubscribe();
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>No internet connection</Text>
    </View>
  );
}
```

**Props:** None

**State Requirements:**
- Network connectivity status
- App state (active/inactive)

## Component Hierarchy

```
AppProviders (Provider)
├── Redux Provider
│   ├── Store Provider
│   └── Persist Gate
├── QueryClient Provider
├── Auth Provider
├── Theme Provider
└── RootLayout (Layout)
    ├── Stack Navigator
    │   ├── (auth) Route Group
    │   ├── (app) Route Group
    │   └── +not-found Screen
    ├── NetworkStatus (Overlay)
    ├── AuthGuard (Wrapper)
    │   └── Protected Content
    └── ErrorBoundary (Wrapper)
        └── Protected Content
```

## Props and State Requirements

### State Management
```typescript
// Redux Store Structure
interface RootState {
  auth: AuthState;
  // Other slices added in subsequent tasks
}

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Theme State
interface ThemeState {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}
```

### Context Requirements
```typescript
// Auth Context
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Theme Context
interface ThemeContextValue {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
}
```

## Integration Requirements

### Navigation Integration
- Root layout must wrap all navigators
- Route groups must be properly configured
- Deep linking must be set up
- Navigation state must persist

### State Integration
- Redux store must be properly typed
- RTK Query must be integrated
- State persistence must be configured
- All contexts must be properly typed

### Error Handling Integration
- Error boundaries must catch all errors
- Global error handler must be set up
- Error reporting service must be integrated
- User-friendly error messages must be shown

## Reusable Components
These components should be available in `src/components/shared/`:
- LoadingScreen
- ErrorBoundary
- NetworkStatus
- AuthGuard

## Component Dependencies
- react-redux (Redux Provider)
- @reduxjs/toolkit/query (RTK Query)
- @tanstack/react-query (Query Client)
- redux-persist (State persistence)
- expo-router (Navigation)
- expo-font (Font loading)
- @react-native-async-storage/async-storage (Persisted storage)
