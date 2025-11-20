# React Native Migration Strategy: Salonnz UserApp

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Web vs Mobile Paradigm Differences](#web-vs-mobile-paradigm-differences)
3. [Component Conversion Approach](#component-conversion-approach)
4. [Routing Strategy](#routing-strategy)
5. [State Management Migration Plan](#state-management-migration-plan)
6. [Authentication Flow Adaptations](#authentication-flow-adaptations)
7. [File Upload/Download Handling](#file-uploaddownload-handling)
8. [Platform-Specific Considerations](#platform-specific-considerations)
9. [Third-Party Library Alternatives](#third-party-library-alternatives)
10. [Performance Optimization Strategies](#performance-optimization-strategies)
11. [Migration Phases and Timeline](#migration-phases-and-timeline)
12. [Risk Mitigation](#risk-mitigation)

---

## Executive Summary

### Project Overview
The Salonnz UserApp is a **complex salon and spa booking platform** with multi-location support, featuring:
- 70+ pages with sophisticated booking flows
- 84+ reusable components
- 13 Redux store slices for state management
- Multiple payment options (Stripe integration)
- Gift cards, memberships, and packages
- Staff directory and appointment management
- Customer feedback and review systems

### Migration Approach
**Recommendation**: Incremental migration using **Expo** framework with **Expo Router** for Next.js-like file-based routing.

**Timeline**: 4-6 months with 2-3 experienced React Native developers
**Total Effort**: 800-1000 developer hours

### Key Success Factors
1. Use Expo for faster development and native module access
2. Maintain Redux for state management (compatible)
3. Use NativeWind for Tailwind-like styling
4. Gradual migration feature-by-feature
5. Comprehensive testing at each phase

---

## 1. Web vs Mobile Paradigm Differences

### 1.1 Navigation Paradigms

#### Web (Current)
- **URL-based navigation** with browser history
- **Link components** (`<Link>`) for navigation
- **Nested layouts** with shared regions
- **Programmatic navigation** via `useRouter()`
- **Back/Forward browser buttons**

#### Mobile (Target)
- **Stack-based navigation** with screen stacks
- **TouchableOpacity/Button components**
- **Tab-based navigation** for primary sections
- **Navigation prop** and navigation service
- **Hardware back button** (Android) and gestures

#### Migration Strategy

**Implementation with React Navigation v6:**

```typescript
// Define navigators
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator (replaces bottom navigation)
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Book" component={BookingFlow} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

// Booking stack (replaces Next.js booking routes)
function BookingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LocationSelection" component={LocationSelection} />
      <Stack.Screen name="SelectServices" component={SelectServices} />
      <Stack.Screen name="SelectStaff" component={SelectStaff} />
      <Stack.Screen name="SelectTime" component={SelectTime} />
      <Stack.Screen name="ReviewConfirm" component={ReviewConfirm} />
      <Stack.Screen name="Confirmed" component={Confirmed} />
    </Stack.Navigator>
  );
}
```

**Key Differences:**
- No URL slugs; use params or state for data passing
- Navigation state managed by React Navigation (not Redux)
- Deep linking requires explicit configuration
- Back button behavior needs custom handling

### 1.2 Gesture-Based Interactions

#### Web (Current)
- **Click events** on all interactions
- **Hover states** for interactive elements
- **Keyboard navigation** (Tab, Enter, Space)
- **Mouse wheel scrolling**
- **Right-click context menus**

#### Mobile (Target)
- **Touch gestures** (tap, swipe, pinch, long-press)
- **No hover states** (use Pressable component)
- **Virtual keyboard** appears/hides dynamically
- **Pull-to-refresh** for lists
- **Swipe gestures** for actions (delete, archive)

#### Migration Strategy

```typescript
// Replace button with TouchableOpacity
import { TouchableOpacity, Pressable } from 'react-native';

// Standard tap
<TouchableOpacity onPress={handlePress}>
  <Text>Book Now</Text>
</TouchableOpacity>

// Press with feedback (hover replacement)
<Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
  {({ pressed }) => (
    <Text style={{ opacity: pressed ? 0.5 : 1 }}>Book Now</Text>
  )}
</Pressable>

// Swipe gesture for actions
import { Swipeable } from 'react-native-gesture-handler';
<Swipeable
  renderRightActions={renderRightActions}
  onSwipeableRightOpen={handleDelete}
>
  <AppointmentCard appointment={appointment} />
</Swipeable>
```

**Best Practices:**
- Use `Pressable` for all interactive elements
- Implement pull-to-refresh for lists
- Add haptic feedback for better UX
- Support safe area insets for notched devices

### 1.3 Layout Differences

#### Web (Current)
- **Fixed layouts** with CSS Grid/Flexbox
- **CSS breakpoints** (@sm, @md, @lg)
- **Scrollable containers** with overflow
- **Position fixed/absolute** for headers/footers
- **Percentage-based widths**

#### Mobile (Target)
- **Dynamic screen sizes** (iPhone SE to Pro Max)
- **Safe area insets** (notches, home indicators)
- **100% width/height** screens
- **Flexbox-based** (no CSS Grid)
- **Pixel-independent units**

#### Migration Strategy

```typescript
// Dimensions API for responsive design
import { Dimensions, StatusBar } from 'react-native';
const { width, height } = Dimensions.get('window');

// Safe area handling
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();

// Screen dimensions
const screenWidth = width;
const screenHeight = height;

// Create responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  },
  staffCard: {
    width: screenWidth < 400 ? '100%' : '48%',
    aspectRatio: 1, // Square cards
  },
});

// Screen size breakpoints
const isSmallScreen = screenWidth < 375;
const isLargeScreen = screenWidth >= 414;
```

**Key Considerations:**
1. **Safe Area**: Handle notches and home indicators
2. **Orientation**: Support portrait/landscape (lock portrait for booking flow)
3. **Pixel Ratio**: Test on 2x and 3x devices
4. **Keyboard**: Use `KeyboardAvoidingView` for forms
5. **Flexible Layouts**: Use flex instead of fixed dimensions

### 1.4 User Interaction Patterns

#### Web (Current)
- **Hover tooltips** for additional information
- **Double-click** for some actions
- **Ctrl/Cmd + click** for new tabs
- **Browser back button** for navigation
- **Scroll to top** on route change

#### Mobile (Target)
- **Long press** for contextual menus
- **Swipe gestures** for navigation
- **Pull to refresh** for updates
- **Tab bar** for primary navigation
- **Persist scroll position** on navigation

#### Migration Strategy

```typescript
// Long press for context menu
<Pressable onLongPress={() => showContextMenu()}>
  <AppointmentCard />
</Pressable>

// Swipe to navigate back (built into stack navigator)
<Stack.Navigator
  screenOptions={{
    gestureEnabled: true,
    gestureResponseDistance: {
      horizontal: 50, // Swipe distance to go back
    },
  }}
>
  {/* Screens */}
</Stack.Navigator>

// Pull to refresh
import { RefreshControl } from 'react-native';

<FlatList
  data={appointments}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#blue']} // Android
      tintColor="#blue" // iOS
    />
  }
  renderItem={renderAppointment}
/>
```

---

## 2. Component Conversion Approach

### 2.1 HTML Elements to React Native Components

| HTML Element | React Native Equivalent | Usage Notes |
|-------------|------------------------|-------------|
| `<div>` | `<View>` | Main container, supports flexbox |
| `<span>` | `<Text>` | Text only, no nesting |
| `<button>` | `<TouchableOpacity>` | Main touch component |
| `<input>` | `<TextInput>` | Form input |
| `<img>` | `<Image>` | Remote and local images |
| `<ul>/<li>` | `<FlatList>` | Scrollable lists |
| `<a>` | `<Pressable>` or Navigation | Use navigation service |
| `<select>` | `<Picker>` | Native picker or custom |
| `<textarea>` | `<TextInput multiline>` | Multi-line input |

#### Conversion Example

**Next.js Component:**
```typescript
// Before (Next.js)
import { Card, Button } from '@nextui-org/react';
import { Iconify } from 'react-iconify';

export default function StaffCard({ staff }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <img
          src={staff.photo}
          alt={staff.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{staff.name}</h3>
          <p className="text-gray-600">{staff.specialty}</p>
          <div className="flex items-center gap-1 mt-2">
            <Iconify icon="mdi:star" />
            <span>{staff.rating}</span>
          </div>
        </div>
        <Button color="primary">Book</Button>
      </div>
    </Card>
  );
}
```

**React Native Component:**
```typescript
// After (React Native)
import { View, Text, Image, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function StaffCard({ staff }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StaffDetails', { staffId: staff.id })}
    >
      <Image source={{ uri: staff.photo }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.specialty}>{staff.specialty}</Text>
        <View style={styles.rating}>
          <Text>⭐ {staff.rating}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleBooking(staff.id)}
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
```

### 2.2 NextUI to React Native UI Library

#### Recommended Library: NativeBase
- **Similar API** to NextUI
- **Theme support** with consistent styling
- **Rich component set** (buttons, inputs, cards, modals)
- **Good TypeScript support**
- **Active maintenance**

#### Component Mapping

| NextUI Component | NativeBase Equivalent |
|------------------|----------------------|
| `<Card>` | `<Box>` or `<Pressable>` |
| `<Button>` | `<Button>` |
| `<Input>` | `<Input>` |
| `<Modal>` | `<Modal>` |
| `<Dropdown>` | `<Select>` |
| `<Chip>` | `<Tag>` |
| `<Tabs>` | `<Tabs>` |
| `<Avatar>` | `<Avatar>` |
| `<Badge>` | `<Badge>` |

#### Theme Migration

**Next.js (CSS Variables):**
```css
:root {
  --primary: #007AFF;
  --secondary: #5856D6;
  --text: #000000;
  --background: #FFFFFF;
}

.app-theme-dark {
  --text: #FFFFFF;
  --background: #000000;
}
```

**React Native (Theme Object):**
```typescript
// themes/index.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    text: '#000000',
    background: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

// Theme context
import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  theme: typeof theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const currentTheme = isDark ? darkTheme : theme;

  return (
    <ThemeContext.Provider value={{ isDark, theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 2.3 Styling Conversion Strategy

#### Current (Tailwind + SCSS)
```typescript
// Tailwind classes
<div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md">
  <Text className="text-lg font-semibold text-gray-900">Booking</Text>
</div>
```

#### Target (NativeWind)
```typescript
// NativeWind classes (similar to Tailwind)
<View className="flex-row justify-between items-center p-4 bg-white rounded-lg shadow-md">
  <Text className="text-lg font-semibold text-gray-900">Booking</Text>
</View>
```

#### Or (StyleSheet)
```typescript
// StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
```

#### Responsive Design

**Tailwind Approach:**
```css
/* Tailwind - responsive classes */
.card {
  @apply p-4;
}
@media (min-width: 768px) {
  .card {
    @apply p-8;
  }
}
```

**React Native Approach:**
```typescript
// Dimensions-based responsive
import { useWindowDimensions } from 'react-native';

const { width } = useWindowDimensions();

const styles = StyleSheet.create({
  card: {
    padding: width >= 768 ? 32 : 16,
  },
});

// NativeWind with breakpoints
<View className="p-4 md:p-8">
  <Text>Content</Text>
</View>
```

### 2.4 Icon Libraries

#### Current: react-iconify
```typescript
<Iconify icon="mdi:star" width={24} height={24} />
```

#### Migration Options

**Option 1: react-native-vector-icons**
```typescript
// Installation
npm install react-native-vector-icons

// Usage
import Icon from 'react-native-vector-icons/MaterialIcons';

<Icon name="star" size={24} color="#FFD700" />

// For custom icons
import { createIconSetFromFontello } from 'react-native-vector-icons';
import fontelloConfig from './config.json';
const Icon = createIconSetFromFontello(fontelloConfig);
```

**Option 2: react-native-svg**
```typescript
// Better for branding/custom icons
import Svg, { Path } from 'react-native-svg';

<Svg width={24} height={24} viewBox="0 0 24 24">
  <Path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
</Svg>
```

**Option 3: @expo/vector-icons**
```typescript
// Comes with Expo, no installation
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="star" size={24} color="#FFD700" />
```

**Recommendation**: Use `@expo/vector-icons` (comes with Expo, extensive icon set)

---

## 3. Routing Strategy

### 3.1 Next.js App Router to React Navigation

#### Current Structure
```
app/
├── [slug]/
│   ├── page.tsx                 # Homepage
│   ├── booking/
│   │   ├── page.tsx            # Location selection
│   │   ├── select-services/    # Service selection
│   │   ├── select-staff/       # Staff selection
│   │   ├── select-time/        # Time selection
│   │   ├── review-confirm/     # Review
│   │   └── confirmed/          # Confirmation
│   ├── appointment/
│   └── account/
```

#### Target Structure
```
src/
├── app/
│   ├── _layout.tsx             # Root layout
│   ├── index.tsx               # Home
│   ├── booking/
│   │   ├── _layout.tsx         # Booking stack layout
│   │   ├── index.tsx           # Location selection
│   │   ├── select-services.tsx # Service selection
│   │   ├── select-staff.tsx    # Staff selection
│   │   ├── select-time.tsx     # Time selection
│   │   ├── review-confirm.tsx  # Review
│   │   └── confirmed.tsx       # Confirmation
│   ├── appointments/
│   ├── account/
│   └── +not-found.tsx          # 404 screen
```

### 3.2 Expo Router Implementation

#### File-based Routing (Similar to Next.js)

```typescript
// app/_layout.tsx (Root layout)
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs will be defined in separate layout */}
    </Stack>
  );
}

// app/_layout.tsx (Tab layout)
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Book',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'image' : 'image-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

#### Dynamic Routing

**Next.js:**
```typescript
// app/[slug]/page.tsx
import { useParams } from 'next/navigation';

export default function SalonPage() {
  const params = useParams();
  const slug = params.slug;
  // ...
}
```

**React Native:**
```typescript
// app/[salonId]/index.tsx
import { useLocalSearchParams } from 'expo-router';

export default function SalonScreen() {
  const params = useLocalSearchParams();
  const salonId = params.salonId as string;
  // ...
}
```

### 3.3 Navigation State Management

#### Current (Next.js)
- State managed by browser
- URL contains all state
- Back/forward browser navigation

#### Target (React Native)
- State in memory (navigation container)
- No URL (unless deep linking)
- Custom back handling

#### Implementation

```typescript
// Navigation service
import * as NavigationService from './NavigationService';

// Initialize (in app entry point)
NavigationService.navigate('BookingFlow');

// Navigate to screen
NavigationService.navigate('SelectStaff', { staffId: '123' });

// Navigate back
NavigationService.goBack();

// Check if can go back
NavigationService.canGoBack();

// NavigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function canGoBack() {
  return navigationRef.canGoBack();
}
```

### 3.4 Deep Linking Configuration

#### URL Scheme
```
salonnz://home
salonnz://booking/location-select
salonnz://booking/services?salonId=123
salonnz://appointments/456
salonnz://account
```

#### Configuration

```typescript
// app.json (Expo)
{
  "expo": {
    "scheme": "salonnz",
    "ios": {
      "bundleIdentifier": "com.salonnz.app",
      "supportsTablet": true,
    },
    "android": {
      "package": "com.salonnz.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "salonnz.com",
              "pathPrefix": "/app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

#### Handle Incoming Links

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const parsedUrl = Linking.parse(url);
      // Handle deep link
      handleDeepLink(parsedUrl);
    }
  }, [url]);

  return (
    <Stack>
      {/* Screens */}
    </Stack>
  );
}
```

---

## 4. State Management Migration Plan

### 4.1 Redux Toolkit Compatibility

**Good News**: Redux Toolkit works **identically** in React Native!

#### Store Structure (No Changes Needed)
```
store/
├── store.ts          // Store configuration
├── bookingSlice.ts   // Booking state
├── homeSlice.ts      // Home page state
├── appointmentSlice.ts // Appointments
└── ...
```

#### Persistence with AsyncStorage

**Current (localStorage):**
```typescript
// hooks/useAuthCheck.ts
const device_type = localStorage.getItem("device_type");
const token = localStorage.getItem("token");
```

**Target (AsyncStorage):**
```typescript
// store/persist.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'booking', 'user', 'theme'], // Only persist these
  blacklist: ['navigation'], // Don't persist navigation
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
```

#### Provider Setup

```typescript
// app/_layout.tsx
import { Provider } from 'react-redux';
import { store, persistor } from '@/store/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <Stack />
      </PersistGate>
    </Provider>
  );
}
```

### 4.2 State Persistence Strategy

#### What to Persist
✅ **Persist:**
- User authentication (token, profile)
- Booking draft (selected services, staff)
- Theme preference (light/dark)
- User preferences (notifications, etc.)
- Recently viewed salons

❌ **Don't Persist:**
- Navigation state
- Temporary form data
- Loading states
- Error states
- Cacheable API data (use React Query)

#### Implementation

```typescript
// store/slices/bookingSlice.ts
interface BookingState {
  selectedServices: Service[];
  selectedStaff: Staff | null;
  selectedTime: Date | null;
  salonId: string | null;
}

const initialState: BookingState = {
  selectedServices: [],
  selectedStaff: null,
  selectedTime: null,
  salonId: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectService: (state, action) => {
      state.selectedServices.push(action.payload);
    },
    clearBooking: (state) => {
      state.selectedServices = [];
      state.selectedStaff = null;
      state.selectedTime = null;
      state.salonId = null;
    },
  },
});

export const { selectService, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
```

### 4.3 Server State Management

#### Current: Redux for everything
- Redux holds both UI state and server state
- No caching strategy
- Re-fetches on every app start

#### Recommended: React Query for Server State

```typescript
// Install react-query
npm install @tanstack/react-query

// QueryClient setup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Provider in layout
export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* App */}
      </QueryClientProvider>
    </Provider>
  );
}
```

#### API Integration

```typescript
// hooks/useSalonData.ts
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/api/homeApi';

export function useSalonData(salonId: string) {
  return useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => homeApi.getSalonData(salonId),
    enabled: !!salonId, // Only run if salonId exists
  });
}

// In component
function SalonScreen() {
  const { data: salonData, isLoading, error } = useSalonData(salonId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <Text>{salonData.name}</Text>
    </View>
  );
}
```

### 4.4 Form State Management

#### Current: useState for forms
```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
});

const handleSubmit = () => {
  // Submit logic
};
```

#### Recommended: React Hook Form + Yup

```typescript
// Install
npm install react-hook-form yup @hookform/resolvers

// Form component
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function ProfileForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = (data: FormData) => {
    // Submit logic
  };

  return (
    <View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Name"
            style={errors.name && { borderColor: 'red' }}
          />
        )}
      />
      {errors.name && <Text style={{ color: 'red' }}>{errors.name.message}</Text>}

      <TouchableOpacity onPress={handleSubmit(onSubmit)}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Benefits:**
- Better performance (fewer re-renders)
- Built-in validation
- Easy error handling
- Less boilerplate code

---

## 5. Authentication Flow Adaptations

### 5.1 Current Authentication (NextAuth.js)

#### OAuth Providers
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
```

### 5.2 React Native Authentication Options

#### Option 1: Firebase Auth (Recommended)

**Why Firebase?**
- Native OAuth support (Google, Facebook)
- Built-in token management
- Easy integration with React Native
- Good documentation

**Installation:**
```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

**Implementation:**
```typescript
// services/auth.ts
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class AuthService {
  // Google Sign In
  static async signInWithGoogle() {
    try {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(googleCredential);
      const token = await userCredential.user.getIdToken();

      return {
        success: true,
        token,
        user: userCredential.user,
      };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Facebook Sign In
  static async signInWithFacebook() {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        return { success: false, error: 'User cancelled login' };
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        return { success: false, error: 'No access token' };
      }

      const credential = auth.FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await auth().signInWithCredential(credential);
      const token = await userCredential.user.getIdToken();

      return {
        success: true,
        token,
        user: userCredential.user,
      };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Sign Out
  static async signOut() {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get current user
  static getCurrentUser() {
    return auth().currentUser;
  }

  // Check if authenticated
  static async isAuthenticated() {
    const user = auth().currentUser;
    return !!user;
  }
}
```

**Auth Hook:**
```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@react-native-firebase/auth';
import { AuthService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithFacebook: () => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return subscriber; // Unsubscribe on unmount
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle: AuthService.signInWithGoogle,
    signInWithFacebook: AuthService.signInWithFacebook,
    signOut: AuthService.signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Auth Guard Component:**
```typescript
// components/AuthGuard.tsx
import { useAuth } from '@/hooks/useAuth';
import { View, Text, ActivityIndicator } from 'react-native';

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
```

#### Option 2: Custom Auth Service

If you want to keep using the existing API:

```typescript
// services/customAuth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://always.click/api/auth';

export class CustomAuthService {
  static async signInWithGoogle(accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: 'Invalid response' };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async getToken() {
    return await AsyncStorage.getItem('token');
  }

  static async getUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static async signOut() {
    await AsyncStorage.multiRemove(['token', 'user']);
  }

  static async refreshToken() {
    // Implement token refresh logic
  }
}
```

### 5.3 Token Storage and Management

#### Secure Storage for Sensitive Data

```typescript
// Install
npm install react-native-keychain

// Usage
import * as Keychain from 'react-native-keychain';

export class SecureStorage {
  static async storeToken(token: string) {
    try {
      await Keychain.setInternetCredentials(
        'authToken',
        'username',
        token
      );
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('authToken');
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  static async removeToken() {
    try {
      await Keychain.resetInternetCredentials('authToken');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
}
```

**Recommendation:**
- Use **Firebase Auth** (easiest integration)
- Fallback to **Custom Auth** if you need to use existing backend
- Store tokens in **Keychain** (secure)
- Implement **automatic token refresh**

---

## 6. File Upload/Download Handling

### 6.1 Current Implementation (Web)

```typescript
// Profile photo upload
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);

  await axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Using browser-image-compression
import imageCompression from 'browser-image-compression';

const handleCompressAndUpload = async (file: File) => {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
  });

  const formData = new FormData();
  formData.append('photo', compressedFile);

  await axios.post('/api/upload', formData);
};
```

### 6.2 React Native Implementation

#### Image Picker

**Installation:**
```bash
npm install expo-image-picker
```

**Implementation:**
```typescript
import * as ImagePicker from 'expo-image-picker';

// Request permissions
async function requestImagePickerPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to photos');
    return false;
  }
  return true;
}

// Pick image from gallery
async function pickImageFromGallery() {
  const hasPermission = await requestImagePickerPermission();
  if (!hasPermission) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Square crop
    quality: 0.8,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    await uploadImage(asset.uri);
  }
}

// Take photo with camera
async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to camera');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    await uploadImage(asset.uri);
  }
}
```

#### Image Compression

**Installation:**
```bash
npm install react-native-image-resizer
```

**Implementation:**
```typescript
import ImageResizer from 'react-native-image-resizer';

async function compressImage(uri: string) {
  try {
    const response = await ImageResizer.createResizedImage(
      uri,
      1920, // Max width
      1920, // Max height
      'JPEG', // Format
      80, // Quality (0-100)
      0, // Rotation
      undefined, // Output path
      false,
      { mode: 'contain', onlyScaleDown: true }
    );

    return response.uri;
  } catch (error) {
    console.error('Failed to compress image:', error);
    return uri;
  }
}
```

#### Upload to Server

```typescript
async function uploadImage(uri: string) {
  try {
    // Compress image first
    const compressedUri = await compressImage(uri);

    // Create form data
    const filename = compressedUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const ext = match?.[1] || 'jpg';

    const formData = new FormData();
    formData.append('photo', {
      uri: compressedUri,
      type: `image/${ext}`,
      name: filename,
    } as any);

    // Upload
    const response = await fetch('https://always.click/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      Alert.alert('Success', 'Image uploaded successfully');
    }

    return data;
  } catch (error) {
    console.error('Upload failed:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
}
```

### 6.3 Document Picker

**Installation:**
```bash
npm install expo-document-picker
```

**Implementation:**
```typescript
import * as DocumentPicker from 'expo-document-picker';

async function pickDocument() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    await uploadDocument(asset);
  } catch (error) {
    console.error('Document picker error:', error);
  }
}

async function uploadDocument(asset: DocumentPicker.DocumentPickerAsset) {
  const formData = new FormData();
  formData.append('document', {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || 'application/pdf',
  } as any);

  await fetch('https://always.click/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
}
```

### 6.4 Download Files

```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function downloadFile(url: string, filename: string) {
  try {
    const fileUri = FileSystem.documentDirectory + filename;

    const { uri } = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

    return uri;
  } catch (error) {
    console.error('Download failed:', error);
  }
}
```

---

## 7. Platform-Specific Considerations

### 7.1 iOS Configuration

#### Required Configurations

**Info.plist Additions:**
```xml
<!-- Location-based features (if needed) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to find nearby salons</string>

<!-- Camera access -->
<key>NSCameraUsageDescription</key>
<string>Camera will be used to take profile photos</string>

<!-- Photo library access -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Photos will be used for profile pictures and gallery</string>

<!-- Push notifications -->
<key>NSUserNotificationsUsageDescription</key>
<string>App will send you appointment reminders</string>

<!-- Face ID / Touch ID -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to quickly sign in</string>
```

**App Transport Security (ATS):**
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

#### iOS-Specific Features

**Native Features Integration:**
```typescript
// Haptic feedback
import { Haptics } from 'expo-haptics';

const triggerHaptic = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Face ID / Touch ID
import * as LocalAuthentication from 'expo-local-authentication';

const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync();
    if (result.success) {
      // Allow access
    }
  }
};

// Share functionality
import { Share } from 'react-native';

const shareContent = async () => {
  await Share.share({
    message: 'Check out this salon on Salonnz!',
    url: 'https://salonnz.com',
  });
};
```

### 7.2 Android Configuration

#### Required Permissions (AndroidManifest.xml)

```xml
<!-- Internet access -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Camera access -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Read external storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Write external storage -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

<!-- Location (if needed) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Push notifications -->
<uses-permission android:name="android.permission.VIBRATE" />
```

**Network Security Config:**
```xml
<!-- res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">always.click</domain>
  </domain-config>
  <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```

#### Android-Specific Features

**Back Button Handling:**
```typescript
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

function useBackButton(handler) {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handler();
        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [handler])
  );
}

// Usage
function BookingFlow() {
  const navigation = useNavigation();

  useBackButton(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  });

  return <BookingScreen />;
}
```

**Android Splash Screen:**
```typescript
// app.json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### 7.3 Platform Detection

```typescript
import { Platform, StatusBar } from 'react-native';

// Detect platform
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Platform-specific styling
const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
  },
  container: {
    ...Platform.select({
      ios: { paddingBottom: 20 },
      android: { paddingBottom: 30 },
    }),
  },
});

// Platform-specific components
if (Platform.OS === 'ios') {
  // iOS-specific code
} else {
  // Android-specific code
}
```

### 7.4 Push Notifications

**Installation:**
```bash
npm install expo-notifications
```

**Setup:**
```typescript
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions
async function registerForPushNotifications() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission required', 'Push notifications need to be enabled');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Listen for notifications
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    // Handle notification received
  });

  return () => subscription.remove();
}, []);

// Schedule local notification
async function scheduleNotification(appointmentDate: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Appointment Reminder',
      body: 'You have an appointment in 1 hour',
      data: { appointmentId: '123' },
    },
    trigger: {
      date: new Date(appointmentDate.getTime() - 60 * 60 * 1000), // 1 hour before
    },
  });
}
```

---

## 8. Third-Party Library Alternatives

### 8.1 Library Migration Table

| Next.js/Web Library | React Native Alternative | Package Name | Migration Notes |
|---------------------|-------------------------|--------------|----------------|
| **Next.js** | **Expo Router** | `expo-router` | File-based routing, similar to Next.js |
| **next-auth** | **Firebase Auth** | `@react-native-firebase/auth` | OAuth support, easier integration |
| **@nextui-org/react** | **NativeBase** | `native-base` | Similar component API, theme support |
| **@iconify/react** | **@expo/vector-icons** | `@expo/vector-icons` | No install needed, extensive set |
| **framer-motion** | **Moti** | `moti` | Animation library for RN |
| **swiper** | **react-native-swiper** | `react-native-swiper` | Touch-based carousels |
| **stripe/react-stripe-js** | **@stripe/stripe-react-native** | `@stripe/stripe-react-native` | Native SDK, different API |
| **tailwindcss** | **NativeWind** | `nativewind` | Tailwind-like syntax |
| **next/image** | **react-native-fast-image** | `react-native-fast-image` | Caching and optimization |
| **axios** | **axios** | `axios` | Works in RN ✓ |
| **date-fns** | **date-fns** | `date-fns` | Works in RN ✓ |
| **lottie-react** | **lottie-react-native** | `lottie-react-native` | Animation support |
| **redux toolkit** | **redux toolkit** | `@reduxjs/toolkit` | Works in RN ✓ |

### 8.2 Critical Migration Examples

#### UI Library: NextUI → NativeBase

**Next.js:**
```typescript
import { Card, Button, Input } from '@nextui-org/react';

export default function BookingCard() {
  return (
    <Card className="p-4">
      <Input
        label="Service"
        placeholder="Select a service"
      />
      <Button color="primary" className="mt-4">
        Continue
      </Button>
    </Card>
  );
}
```

**React Native:**
```typescript
import { Box, Button, Input } from 'native-base';

export default function BookingCard() {
  return (
    <Box bg="white" p="4" borderRadius="lg" shadow="2">
      <Input
        placeholder="Select a service"
        variant="outline"
      />
      <Button mt="4" colorScheme="primary">
        Continue
      </Button>
    </Box>
  );
}
```

#### Stripe Integration

**Next.js:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (!error) {
      // Send to server
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </form>
  );
}
```

**React Native:**
```typescript
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';

export default function PaymentScreen() {
  return (
    <StripeProvider publishableKey="pk_test_...">
      <PaymentForm />
    </StripeProvider>
  );
}

function PaymentForm() {
  const { handleCardAction } = useStripe();

  const handleSubmit = async () => {
    const { error, paymentMethod } = await handleCardAction({
      // Payment method details
    });

    if (!error) {
      // Success
    }
  };

  return (
    <View>
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#30313D',
        }}
        style={{
          width: '100%',
          height: 50,
          marginVertical: 30,
        }}
      />
      <Button onPress={handleSubmit}>Pay</Button>
    </View>
  );
}
```

#### Animation Library: Framer Motion → Moti

**Next.js:**
```typescript
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function StaffList({ staff }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      {staff.map((member) => (
        <motion.div key={member.id} variants={itemVariants}>
          <StaffCard staff={member} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**React Native:**
```typescript
import { MotiView } from 'moti';

export default function StaffList({ staff }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 500 }}
    >
      {staff.map((member) => (
        <MotiView
          key={member.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 500 }}
        >
          <StaffCard staff={member} />
        </MotiView>
      ))}
    </MotiView>
  );
}
```

### 8.3 Package Installation Commands

```bash
# Core navigation and routing
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context
npm install expo-router

# UI library
npm install native-base react-native-svg react-native-vector-icons

# State management
npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage

# Authentication
npm install @react-native-firebase/app @react-native-firebase/auth
npm install @react-native-google-signin/google-signin

# Payment
npm install @stripe/stripe-react-native

# Image handling
npm install react-native-fast-image react-native-image-resizer
npm install expo-image-picker expo-document-picker

# Networking
npm install axios

# Forms
npm install react-hook-form yup @hookform/resolvers

# Notifications
npm install expo-notifications expo-device

# Animations
npm install moti

# Utilities
npm install dayjs date-fns
npm install lottie-react-native
npm install react-native-keychain
npm install @tanstack/react-query
```

---

## 9. Performance Optimization Strategies

### 9.1 Bundle Size Optimization

#### Current Issues
- 84+ components may increase bundle size
- Multiple third-party libraries
- No code splitting implemented

#### Optimization Strategies

**1. Enable Hermes Engine**

```javascript
// app.json
{
  "expo": {
    "jsEngine": "hermes",
    "android": {
      "buildTypes": {
        "debug": {
          "jsEngine": "hermes"
        }
      }
    }
  }
}
```

**Benefits:**
- Smaller bundle size (up to 50% smaller)
- Faster startup time
- Better memory usage
- Bytecode compilation

**2. Implement Code Splitting**

```typescript
// Lazy load screens
import { lazy, Suspense } from 'react';

const BookingFlow = lazy(() => import('@/screens/booking/BookingFlow'));
const StaffDetails = lazy(() => import('@/screens/staff/StaffDetails'));
const Gallery = lazy(() => import('@/screens/gallery/Gallery'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Stack.Screen name="BookingFlow" component={BookingFlow} />
</Suspense>
```

**3. Reduce Dependencies**

**Analysis:**
```bash
# Check bundle size
npx expo export --platform android

# Analyze bundle
npx expo bundle-visualizer
```

**4. Use Expo Development Builds**
- Easier to test updates without app store
- Faster iteration during development

### 9.2 Image Optimization

#### Current Issues
- Large gallery images
- No caching strategy
- next/image not available

#### Solutions

**1. react-native-fast-image**

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  style={styles.avatar}
  source={{
    uri: staff.photo,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

**2. Implement Image Caching**

```typescript
// hooks/useCachedImage.ts
import { useState, useEffect } from 'react';
import FastImage from 'react-native-fast-image';

export function useCachedImage(uri: string) {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    FastImage.preload([{ uri }]);
  }, [uri]);

  return isCached;
}

// Component
function CachedImage({ uri, ...props }) {
  const isCached = useCachedImage(uri);

  return (
    <FastImage
      source={{ uri }}
      {...props}
    />
  );
}
```

**3. Optimize Image Sizes**
- Generate multiple sizes (thumb, medium, large)
- Use WebP format when possible
- Compress on upload (already covered)

### 9.3 List Virtualization

#### Current Implementation
- Standard FlatList (already optimized)
- "Fetch on scroll" implemented

#### Improvements

```typescript
<FlatList
  data={appointments}
  renderItem={renderAppointment}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={5}
  // Performance options
  disableVirtualization={false}
/>
```

**For Image Galleries:**
```typescript
import { MasonryFlashList } from '@shopify/flash-list';

<MasonryFlashList
  data={galleryImages}
  numColumns={2}
  renderItem={({ item }) => (
    <CachedImage uri={item.uri} style={styles.galleryItem} />
  )}
  estimatedItemSize={200}
/>
```

### 9.4 Memory Management

#### Best Practices

**1. Memoize Expensive Components**
```typescript
import { memo, useMemo } from 'react';

const StaffCard = memo(({ staff }) => {
  const formattedName = useMemo(() => {
    return staff.name.toUpperCase();
  }, [staff.name]);

  return (
    <View>
      <Text>{formattedName}</Text>
    </View>
  );
});
```

**2. Avoid Creating Functions in Render**
```typescript
// Bad
<FlatList
  renderItem={({ item }) => (
    <AppointmentItem
      appointment={item}
      onPress={() => handlePress(item.id)} // New function each render
    />
  )}
/>

// Good
const renderItem = useCallback(({ item }) => (
  <AppointmentItem
    appointment={item}
    onPress={handlePress}
  />
), [handlePress]);

<FlatList renderItem={renderItem} />
```

**3. Optimize Redux Selectors**
```typescript
// Install reselect
npm install reselect

// Create selector
import { createSelector } from 'reselect';

const selectAppointments = (state) => state.appointments.items;

const selectUpcomingAppointments = createSelector(
  [selectAppointments],
  (appointments) => appointments.filter(a => a.status === 'upcoming')
);

// Use in component
const upcomingAppointments = useSelector(selectUpcomingAppointments);
```

### 9.5 Navigation Performance

#### Optimization Strategies

```typescript
// Reuse screen components
<Stack.Navigator>
  <Stack.Screen
    name="BookingFlow"
    component={BookingFlow}
    options={{ headerShown: false }}
    // Prevent screen from remounting
    listeners={{
      focus: () => {
        // Screen focused
      },
    }}
  />
</Stack.Navigator>

// Use lazy loading
const LazyComponent = lazy(() => import('./Component'));

// Avoid unnecessary re-renders
const MemoizedScreen = memo(ScreenComponent);
```

### 9.6 Performance Monitoring

#### Tools

**1. Flipper (React Native Inspector)**
- Component inspector
- Performance profiler
- Network monitoring

**2. React Native Performance Monitor**
```typescript
import { Performance } from 'perf-monitor';

Performance.mark('render-start');
// Component render
Performance.mark('render-end');
Performance.measure('render-time', 'render-start', 'render-end');
```

**3. Hermes Profiler**
```typescript
// Enable in development
__DEV__ && console.log('Enable Hermes profiler');
```

---

## 10. Migration Phases and Timeline

### Phase 1: Foundation Setup (Weeks 1-4)

#### Week 1-2: Project Initialization
**Tasks:**
- [ ] Create Expo project with TypeScript
- [ ] Configure project structure
- [ ] Install and configure core dependencies:
  - React Navigation v6
  - Redux Toolkit
  - NativeWind (or StyleSheet setup)
  - Axios
- [ ] Set up linting (ESLint, Prettier)
- [ ] Configure build tools
- [ ] Set up CI/CD pipeline (GitHub Actions)

**Deliverables:**
- Working Expo project with TypeScript
- Basic project structure
- Core dependencies installed and configured

#### Week 3-4: Navigation & State Setup
**Tasks:**
- [ ] Implement stack navigation structure
- [ ] Implement bottom tab navigation (replacing web nav)
- [ ] Configure deep linking
- [ ] Set up Redux store with AsyncStorage persistence
- [ ] Migrate authentication logic (Firebase setup)
- [ ] Create navigation service/helper
- [ ] Set up theme context (light/dark mode)

**Deliverables:**
- Functional navigation between screens
- Redux store working with persistence
- Authentication flow implemented
- Theme switching functional

### Phase 2: Core Components & Services (Weeks 5-8)

#### Week 5-6: UI Component Library
**Tasks:**
- [ ] Set up NativeBase (or chosen UI library)
- [ ] Create custom theme (matching NextUI design)
- [ ] Build reusable UI components:
  - Button variants
  - Input fields
  - Cards
  - Modals
  - Lists
  - Navigation components
- [ ] Implement loading states and skeletons
- [ ] Create layout components (Header, Footer, etc.)

**Deliverables:**
- Complete UI component library
- Consistent theming across app
- Reusable components documented

#### Week 7-8: API Integration
**Tasks:**
- [ ] Migrate API integration layer (axiosInstance)
- [ ] Implement API error handling
- [ ] Set up network state management
- [ ] Create API service modules:
  - homeApi.ts
  - bookingApi.ts
  - appointmentApi.ts
  - buyingcardApi.ts
- [ ] Add request/response interceptors
- [ ] Implement offline caching strategy

**Deliverables:**
- All API integrations working
- Error handling implemented
- Offline support for critical data

### Phase 3: Feature Migration - Authentication & Home (Weeks 9-10)

#### Week 9: Authentication Screens
**Tasks:**
- [ ] Create login screen (Google, Facebook OAuth)
- [ ] Implement authentication flow
- [ ] Create authentication guard components
- [ ] Handle token storage and refresh
- [ ] Test OAuth flows on iOS and Android
- [ ] Create profile setup screen

**Deliverables:**
- Working authentication
- Token management
- Protected routes

#### Week 10: Home Screen
**Tasks:**
- [ ] Implement home screen layout
- [ ] Migrate slider component
- [ ] Add membership/gift card/package cards
- [ ] Implement navigation from home
- [ ] Add pull-to-refresh
- [ ] Test on both platforms

**Deliverables:**
- Functional home screen
- All navigation working
- Loading and error states

### Phase 4: Booking Flow (Weeks 11-16)

This is the **most complex** part - the 7-step booking flow.

#### Week 11: Location Selection
**Tasks:**
- [ ] Create location selection screen
- [ ] Implement location list with search
- [ ] Add location details view
- [ ] Store selected location in Redux
- [ ] Navigate to service selection

**Deliverables:**
- Location selection working
- State persistence

#### Week 12: Service Selection
**Tasks:**
- [ ] Create category list screen
- [ ] Implement service selection with add-ons
- [ ] Add service details view
- [ ] Implement service filtering
- [ ] Add service comparison
- [ ] Store selected services in Redux

**Deliverables:**
- Category browsing functional
- Service selection working

#### Week 13: Staff Selection
**Tasks:**
- [ ] Create staff list screen
- [ ] Implement staff filtering by service
- [ ] Add staff details view with bio and photos
- [ ] Display staff reviews
- [ ] Store selected staff in Redux

**Deliverables:**
- Staff selection functional
- Reviews and ratings displayed

#### Week 14: Time Selection
**Tasks:**
- [ ] Create calendar component
- [ ] Implement time slot selection
- [ ] Add slot availability check
- [ ] Store selected time in Redux
- [ ] Validate appointment availability

**Deliverables:**
- Calendar view working
- Time slot selection

#### Week 15: Review & Confirmation
**Tasks:**
- [ ] Create review screen with all selections
- [ ] Implement gift card/membership application
- [ ] Add promo code support
- [ ] Calculate final price
- [ ] Store review data

**Deliverables:**
- Review screen complete
- Price calculation

#### Week 16: Booking Confirmation
**Tasks:**
- [ ] Create confirmation screen
- [ ] Add booking to backend
- [ ] Handle errors and retries
- [ ] Show success message
- [ ] Navigate to appointments

**Deliverables:**
- Booking flow complete
- Appointment created

### Phase 5: Appointment Management (Weeks 17-18)

#### Week 17: Appointments List
**Tasks:**
- [ ] Create appointments list screen
- [ ] Implement upcoming/past filter
- [ ] Add appointment details view
- [ ] Implement pull-to-refresh
- [ ] Add empty state

**Deliverables:**
- Appointments list functional

#### Week 18: Appointment Actions
**Tasks:**
- [ ] Implement cancel appointment flow
- [ ] Implement reschedule flow
- [ ] Add appointment details screen
- [ ] Handle cancel/reschedule errors
- [ ] Add confirmation dialogs

**Deliverables:**
- Cancel/reschedule working

### Phase 6: Gift Cards, Memberships, Packages (Weeks 19-20)

#### Week 19: Gift Cards
**Tasks:**
- [ ] Create gift card catalog
- [ ] Implement purchase flow
- [ ] Add recipient selection
- [ ] Integrate Stripe payment
- [ ] Create confirmation screen
- [ ] Add user's gift cards view

**Deliverables:**
- Gift card purchase flow

#### Week 20: Memberships & Packages
**Tasks:**
- [ ] Create memberships catalog
- [ ] Create packages catalog
- [ ] Implement purchase flow
- [ ] Integrate Stripe payment
- [ ] Add membership benefits view

**Deliverables:**
- Memberships and packages functional

### Phase 7: Other Features (Weeks 21-22)

#### Week 21: Staff Directory & About
**Tasks:**
- [ ] Create staff directory screen
- [ ] Implement staff search and filter
- [ ] Add staff details with reviews
- [ ] Create about screen with gallery
- [ ] Add salon information

**Deliverables:**
- Staff directory complete

#### Week 22: Account Management & Feedback
**Tasks:**
- [ ] Create account screen
- [ ] Implement profile editing
- [ ] Add notification settings
- [ ] Create feedback flow (multi-step)
- [ ] Implement star ratings and text review
- [ ] Add social sharing

**Deliverables:**
- Account management complete
- Feedback system functional

### Phase 8: Payment Integration (Weeks 23-24)

#### Week 23-24: Stripe Integration
**Tasks:**
- [ ] Install and configure @stripe/stripe-react-native
- [ ] Replace all payment forms
- [ ] Handle 3D Secure authentication
- [ ] Test all payment flows:
  - Deposit payments
  - Full payments
  - Pay at salon
  - Saved cards
- [ ] Handle payment errors
- [ ] Test on both iOS and Android

**Deliverables:**
- All payment flows working
- Tested on both platforms

### Phase 9: Testing & Polish (Weeks 25-28)

#### Week 25-26: Testing
**Tasks:**
- [ ] Write unit tests for business logic (Jest)
- [ ] Write integration tests for API flows
- [ ] Implement E2E tests (Detox or Appium)
- [ ] Test on multiple device sizes
- [ ] Performance testing
- [ ] Memory leak testing
- [ ] Accessibility testing

**Deliverables:**
- Comprehensive test suite
- Test coverage report

#### Week 27-28: Bug Fixes & App Store Prep
**Tasks:**
- [ ] Fix all critical bugs
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Create app store assets
  - App icons
  - Screenshots
  - App descriptions
- [ ] App store metadata
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Submit to App Store (iOS)
- [ ] Submit to Google Play (Android)

**Deliverables:**
- Bug-free app
- Ready for app store submission

### Total Timeline: 28 weeks (6-7 months)

### Critical Path Items (Cannot be Parallelized)
1. Foundation Setup → Navigation
2. Navigation → Feature Migration
3. Feature Migration → Payment Integration
4. Payment Integration → Testing

### Parallelizable Items
- UI Components can be built while navigation is set up
- API Integration can happen alongside UI Components
- Multiple features can be developed in parallel after Phase 2

---

## Risk Mitigation

### High-Risk Areas

#### 1. Stripe Payment Integration
**Risk**: Payment failures, 3D Secure issues, platform differences

**Mitigation**:
- [ ] Start payment integration early (Week 23, not last)
- [ ] Use Stripe test cards extensively
- [ ] Implement comprehensive error handling
- [ ] Test on real devices with real cards
- [ ] Have payment testing checklist
- [ ] Consider staging environment

#### 2. Booking Flow Complexity
**Risk**: State management issues, navigation bugs, data loss

**Mitigation**:
- [ ] Implement Redux persistence for booking draft
- [ ] Add validation at each step
- [ ] Implement "Save and Exit" feature
- [ ] Comprehensive testing of each step
- [ ] Offline mode for booking draft

#### 3. Performance on Low-End Devices
**Risk**: Slow performance, crashes

**Mitigation**:
- [ ] Test on low-end Android devices
- [ ] Optimize images (WebP, multiple sizes)
- [ ] Implement lazy loading everywhere
- [ ] Use Hermes engine
- [ ] Monitor memory usage

#### 4. Authentication Flow
**Risk**: OAuth integration failures, token management issues

**Mitigation**:
- [ ] Use Firebase Auth (well-tested)
- [ ] Implement token refresh
- [ ] Handle token expiry gracefully
- [ ] Test OAuth on iOS and Android
- [ ] Have fallback authentication

### Quality Assurance Strategy

#### Testing Matrix

**Device Testing**:
- iPhone SE (small screen)
- iPhone 14 Pro (standard)
- iPhone 14 Pro Max (large screen)
- iPad (tablet)
- Android low-end (e.g., Galaxy A13)
- Android mid-range (e.g., Pixel 6)
- Android high-end (e.g., Galaxy S23)

**OS Versions**:
- iOS 15, 16, 17
- Android 10, 11, 12, 13, 14

**Network Conditions**:
- WiFi (fast)
- 4G (medium)
- 3G (slow)
- Offline mode

#### Test Scenarios

**Critical User Journeys**:
1. User authentication (Google, Facebook)
2. Complete booking flow (all 7 steps)
3. Cancel appointment
4. Purchase gift card
5. Purchase membership
6. Update profile
7. Upload profile photo
8. View appointments
9. Submit feedback

**Edge Cases**:
- Network interruption during booking
- App killed during booking
- Token expired
- Invalid payment
- Out of stock service
- Staff unavailable at selected time

### Rollback Strategy

If something goes wrong during migration:

1. **Feature Flags**: Use feature flags to enable/disable features
2. **Parallel Development**: Keep web version active during migration
3. **Gradual Rollout**: Deploy to beta testers first
4. **Hot Fix Capability**: Use Expo OTA updates for quick fixes
5. **Database Migration**: Have rollback scripts ready

---

## Conclusion

This migration strategy provides a **comprehensive roadmap** for converting the Salonnz Next.js application to React Native. The key to success is:

1. **Start with solid foundation** (navigation, state, authentication)
2. **Migrate incrementally** (feature by feature)
3. **Test thoroughly** (unit, integration, E2E)
4. **Optimize for performance** (from day 1)
5. **Monitor and measure** (performance, crashes, user feedback)

**Expected Outcome**: A production-ready React Native app with feature parity to the web version, better performance, and improved user experience.

**Total Effort**: 800-1000 developer hours across 6-7 months with 2-3 experienced React Native developers.

---

## Next Steps

1. **Review this strategy** with the development team
2. **Confirm timeline and resources**
3. **Set up development environment**
4. **Begin Phase 1: Foundation Setup**
5. **Establish communication channels** (Slack, project management)
6. **Set up monitoring and analytics**
7. **Schedule weekly progress reviews**

Good luck with the migration! 🚀
