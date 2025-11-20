# Development Guidelines: Salonnz UserApp

## Table of Contents
1. [Critical Rules](#critical-rules)
2. [Code Style & Formatting](#code-style--formatting)
3. [Component Creation Patterns](#component-creation-patterns)
4. [State Management Best Practices](#state-management-best-practices)
5. [API Validation Requirements](#api-validation-requirements)
6. [File Naming Conventions](#file-naming-conventions)
7. [Git Commit Message Format](#git-commit-message-format)
8. [Testing Requirements](#testing-requirements)
9. [Documentation Standards](#documentation-standards)
10. [Performance Benchmarks](#performance-benchmarks)
11. [Accessibility Requirements](#accessibility-requirements)

---

## Critical Rules

### 🚨 Non-Negotiable Requirements

These rules are **mandatory** and must be followed without exception:

#### 1. **Always Validate External Data with Zod**

```typescript
// ✅ REQUIRED: Validate all external data
import { userSchema } from '@/validation';

const user = userSchema.parse(apiResponse.data);

// ❌ FORBIDDEN: Using external data without validation
const user = apiResponse.data as User; // NEVER DO THIS!
```

**What must be validated:**
- All API responses
- User input from forms
- Route/navigation parameters
- Data from AsyncStorage
- Query parameters
- Deep links/URLs
- Third-party service responses

#### 2. **Do Not Deviate from ARCHITECTURE.md**

- Follow the defined folder structure exactly
- Use feature-based modular architecture
- Keep components in designated directories
- Respect separation of concerns

**Architecture structure must be maintained:**
```
src/
├── features/           # Feature modules (domain-driven)
├── entities/           # Business entities with schemas
├── shared/             # Reusable components & utilities
├── services/           # External integrations
└── store/              # Global state management
```

#### 3. **Never Store Sensitive Data Unencrypted**

```typescript
// ✅ REQUIRED: Use secure storage for sensitive data
import * as Keychain from 'react-native-keychain';

await Keychain.setInternetCredentials('authToken', 'username', token);

// ❌ FORBIDDEN: Storing sensitive data in AsyncStorage
await AsyncStorage.setItem('authToken', token); // NEVER DO THIS!
```

#### 4. **All API Calls Must Have Error Handling**

```typescript
// ✅ REQUIRED: Comprehensive error handling
try {
  const response = await apiClient.get('/endpoint');
  return responseSchema.parse(response);
} catch (error) {
  if (error instanceof z.ZodError) {
    logValidationError(error);
  }
  handleApiError(error);
  throw error;
}

// ❌ FORBIDDEN: Unhandled API calls
const response = await apiClient.get('/endpoint'); // NEVER DO THIS!
```

#### 5. **No Direct Mutations of State**

```typescript
// ✅ REQUIRED: Use Redux Toolkit reducers
dispatch(updateUser({ name: 'John' }));

// ❌ FORBIDDEN: Direct state mutation
state.user.name = 'John'; // NEVER DO THIS!
```

---

## Code Style & Formatting

### TypeScript Configuration

**Required TypeScript Settings:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### ESLint Rules

**Enforced Rules:**
```javascript
module.exports = {
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // Errors
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Best Practices
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

### Import Organization

**Order of imports (enforced by eslint-plugin-import):**

```typescript
// 1. React & React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal imports (absolute paths)
import { Button } from '@/shared/components';
import { useAuth } from '@/features/auth/hooks';
import { apiClient } from '@/services/api';
import { userSchema } from '@/validation';

// 4. Relative imports
import { LocalComponent } from './LocalComponent';

// 5. Types
import type { User } from '@/entities/User';

// 6. Styles (last)
import styles from './styles';
```

### Code Formatting Rules

#### 1. Line Length
- **Maximum**: 100 characters
- Break long lines at logical points

#### 2. Function Length
- **Maximum**: 50 lines per function
- If longer, refactor into smaller functions

#### 3. File Length
- **Maximum**: 300 lines per file
- Split large files into smaller modules

#### 4. Naming Conventions
See [File Naming Conventions](#file-naming-conventions) section

---

## Component Creation Patterns

### Component Hierarchy

```
Components (3 levels)
├── Atomic (Basic UI primitives)
│   └── Examples: Button, Input, Icon
├── Composite (Composed of atomic)
│   └── Examples: Card, Modal, Form
└── Page-Level (Feature-specific)
    └── Examples: BookingFlow, AppointmentCard
```

### When to Create a New Component

**Create a component when:**
- ✅ Logic/UI is used in 2+ places
- ✅ Component exceeds 150 lines
- ✅ Has clear single responsibility
- ✅ Needs isolated testing

**Don't create a component when:**
- ❌ Used only once with no reuse potential
- ❌ Too small (< 10 lines)
- ❌ Tightly coupled to parent

### Component File Structure

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.styles.ts    # Styles (if StyleSheet)
├── ComponentName.test.tsx     # Tests
├── types.ts                   # TypeScript types
└── index.ts                   # Public exports
```

### Component Template

```typescript
/**
 * ComponentName
 *
 * Description of what this component does
 *
 * @example
 * <ComponentName prop1="value" onPress={handlePress} />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// ============================================================================
// Types
// ============================================================================

interface ComponentNameProps {
  /**
   * Description of prop1
   */
  prop1: string;

  /**
   * Description of prop2
   * @default false
   */
  prop2?: boolean;

  /**
   * Callback when component is pressed
   */
  onPress?: () => void;

  /**
   * Optional custom styles
   */
  style?: any;
}

// ============================================================================
// Component
// ============================================================================

export function ComponentName({
  prop1,
  prop2 = false,
  onPress,
  style,
}: ComponentNameProps) {
  // ========================================
  // Hooks (in order)
  // ========================================
  // 1. State hooks
  const [localState, setLocalState] = React.useState(false);

  // 2. Context hooks
  // const { user } = useAuth();

  // 3. Redux hooks
  // const dispatch = useDispatch();
  // const data = useSelector(selectData);

  // 4. Query hooks
  // const { data, isLoading } = useQuery(...);

  // 5. Other hooks
  // const navigation = useNavigation();

  // 6. Refs
  // const ref = useRef(null);

  // 7. Effects (last)
  React.useEffect(() => {
    // Effect logic
  }, []);

  // ========================================
  // Event Handlers
  // ========================================
  const handlePress = () => {
    onPress?.();
  };

  // ========================================
  // Render Helpers
  // ========================================
  const renderContent = () => {
    return <Text>{prop1}</Text>;
  };

  // ========================================
  // Early Returns (Loading/Error states)
  // ========================================
  // if (isLoading) return <LoadingSpinner />;
  // if (error) return <ErrorMessage error={error} />;

  // ========================================
  // Main Render
  // ========================================
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={handlePress}>
        {renderContent()}
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

// ============================================================================
// Exports
// ============================================================================

export type { ComponentNameProps };
```

### Prop Naming Conventions

| Prop Type | Convention | Example |
|-----------|-----------|---------|
| Boolean | `is*`, `has*`, `should*` | `isVisible`, `hasError`, `shouldAutoFocus` |
| Callback | `on*`, `handle*` | `onPress`, `onChange`, `handleSubmit` |
| Number | Descriptive noun | `count`, `duration`, `maxItems` |
| String | Descriptive noun | `title`, `placeholder`, `errorMessage` |
| Array | Plural noun | `items`, `users`, `services` |
| Object | Singular noun | `user`, `config`, `data` |

---

## State Management Best Practices

### Local vs Global State Decision Tree

```
Is state needed in multiple screens/features?
├── YES → Use Redux (global state)
└── NO → Is state needed in multiple child components?
    ├── YES → Use Context or lift state up
    └── NO → Use local state (useState)
```

### Redux Toolkit Patterns

#### 1. Slice Structure

```typescript
// store/slices/featureSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeatureState {
  data: DataType[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  data: [],
  isLoading: false,
  error: null,
};

const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Use clear, action-oriented names
    setData: (state, action: PayloadAction<DataType[]>) => {
      state.data = action.payload;
    },

    addItem: (state, action: PayloadAction<DataType>) => {
      state.data.push(action.payload);
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(item => item.id !== action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setData, addItem, removeItem, setLoading, setError } = featureSlice.actions;
export default featureSlice.reducer;
```

#### 2. Selector Patterns

```typescript
// store/selectors/feature.selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

// Base selector
const selectFeatureState = (state: RootState) => state.feature;

// Memoized selectors
export const selectAllData = createSelector(
  selectFeatureState,
  (state) => state.data
);

export const selectIsLoading = createSelector(
  selectFeatureState,
  (state) => state.isLoading
);

// Derived selectors
export const selectDataById = (id: string) =>
  createSelector(selectAllData, (data) => data.find((item) => item.id === id));

export const selectFilteredData = (filter: string) =>
  createSelector(selectAllData, (data) =>
    data.filter((item) => item.category === filter)
  );
```

#### 3. Async Actions (Thunks)

```typescript
// features/booking/store/bookingThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { bookingApi } from '@/services/api';
import { saveBookingRequestSchema } from '@/validation';

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData: unknown, { rejectWithValue }) => {
    try {
      // Validate request data
      const validated = saveBookingRequestSchema.parse(bookingData);

      // Make API call
      const response = await bookingApi.createBooking(validated);

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Server State with TanStack Query

**Use for server-side data:**

```typescript
// features/appointments/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/services/api';

export function useAppointments(status: 'upcoming' | 'completed') {
  return useQuery({
    queryKey: ['appointments', status],
    queryFn: () => appointmentsApi.getAppointments(status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.cancelAppointment,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
```

---

## API Validation Requirements

### ⚠️ Critical: When to Use Zod Validation

**ALWAYS validate in these scenarios:**

#### 1. API Response Validation (REQUIRED)

```typescript
// ✅ REQUIRED: Validate ALL API responses
import { apiClient } from '@/services/api';
import { userSchema } from '@/validation';

export const authApi = {
  async getProfile() {
    const response = await apiClient.get('/user/me');

    // ALWAYS validate response data
    return userSchema.parse(response.data);
  },
};
```

#### 2. Form Input Validation (REQUIRED)

```typescript
// ✅ REQUIRED: Validate form data before submission
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginRequestSchema } from '@/validation';

export function LoginForm() {
  const { handleSubmit } = useForm({
    resolver: zodResolver(loginRequestSchema), // REQUIRED
  });

  const onSubmit = async (data: unknown) => {
    // data is already validated by react-hook-form
    await authApi.login(data);
  };
}
```

#### 3. Route Parameter Validation (REQUIRED)

```typescript
// ✅ REQUIRED: Validate route params
import { useLocalSearchParams } from 'expo-router';
import { idSchema } from '@/validation';

export default function DetailScreen() {
  const params = useLocalSearchParams();

  // ALWAYS validate route params
  const result = idSchema.safeParse(Number(params.id));

  if (!result.success) {
    return <ErrorScreen />;
  }

  const id = result.data;
  // Use validated id
}
```

#### 4. AsyncStorage Data (REQUIRED)

```typescript
// ✅ REQUIRED: Validate stored data
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userSchema } from '@/validation';

async function getStoredUser() {
  const stored = await AsyncStorage.getItem('user');
  if (!stored) return null;

  const parsed = JSON.parse(stored);

  // ALWAYS validate stored data (schema may have changed)
  return userSchema.parse(parsed);
}
```

#### 5. Deep Link/URL Parameters (REQUIRED)

```typescript
// ✅ REQUIRED: Validate deep link data
import { Linking } from 'react-native';
import { appointmentIdSchema } from '@/validation';

Linking.addEventListener('url', ({ url }) => {
  const params = new URL(url).searchParams;
  const appointmentId = params.get('appointmentId');

  // ALWAYS validate URL params
  const validated = appointmentIdSchema.parse(appointmentId);
});
```

### What Data Must Be Validated

| Data Source | Required | Example |
|-------------|----------|---------|
| API Responses | ✅ YES | `userSchema.parse(response.data)` |
| User Input | ✅ YES | `loginSchema.parse(formData)` |
| Route Params | ✅ YES | `idSchema.parse(params.id)` |
| Query Params | ✅ YES | `filterSchema.parse(query)` |
| AsyncStorage | ✅ YES | `userSchema.parse(storedData)` |
| Deep Links | ✅ YES | `linkSchema.parse(linkData)` |
| Environment Variables | ✅ YES | `envSchema.parse(process.env)` |
| Internal State | ❌ NO | Already type-safe with TS |
| Constants | ❌ NO | Defined in codebase |

### Validation Error Handling

```typescript
// Standard validation error handling pattern
import { z } from 'zod';

try {
  const validated = schema.parse(data);
  // Use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format validation errors for user
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    // Show to user
    showToast(formattedErrors[0].message);

    // Log for debugging
    console.error('Validation failed:', formattedErrors);

    // Send to monitoring service
    logValidationError(error, data);
  }

  throw error;
}
```

---

## File Naming Conventions

### Components

```
PascalCase for files and directories

Button.tsx                    # ✅ Correct
button.tsx                    # ❌ Wrong
Button/                       # ✅ Correct directory
  Button.tsx
  Button.test.tsx
  index.ts
```

### Hooks

```
camelCase with "use" prefix

useAuth.ts                    # ✅ Correct
UseAuth.ts                    # ❌ Wrong
auth-hook.ts                  # ❌ Wrong
```

### Services

```
camelCase with Service suffix

apiClient.ts                  # ✅ Correct (client)
authService.ts                # ✅ Correct (service)
api-client.ts                 # ❌ Wrong (kebab-case)
ApiClient.ts                  # ❌ Wrong (PascalCase)
```

### Utilities

```
camelCase, descriptive

formatDate.ts                 # ✅ Correct
validateEmail.ts              # ✅ Correct
format_date.ts                # ❌ Wrong
```

### Schemas (Validation)

```
camelCase with .schema.ts suffix

user.schema.ts                # ✅ Correct
booking.schema.ts             # ✅ Correct
UserSchema.ts                 # ❌ Wrong
user-schema.ts                # ❌ Wrong
```

### Types

```
camelCase with .types.ts suffix

auth.types.ts                 # ✅ Correct
booking.types.ts              # ✅ Correct
auth.d.ts                     # ✅ Also acceptable
```

### Styles

```
camelCase with .styles.ts suffix

button.styles.ts              # ✅ Correct
Button.styles.ts              # ✅ Also acceptable
```

### Tests

```
Same name as file being tested + .test.ts(x)

Button.test.tsx               # ✅ Correct
Button.spec.tsx               # ✅ Also acceptable
button_test.tsx               # ❌ Wrong
```

### Complete Example

```
src/features/booking/
├── components/
│   ├── ServiceSelector/
│   │   ├── ServiceSelector.tsx          # Component
│   │   ├── ServiceSelector.styles.ts    # Styles
│   │   ├── ServiceSelector.test.tsx     # Tests
│   │   └── index.ts                     # Exports
│   └── TimeSlot.tsx                     # Simple component
├── hooks/
│   ├── useBooking.ts
│   └── useAvailableSlots.ts
├── services/
│   └── bookingService.ts
├── types/
│   └── booking.types.ts
├── store/
│   ├── bookingSlice.ts
│   └── bookingSelectors.ts
└── index.ts
```

---

## Git Commit Message Format

### Conventional Commits Standard

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(booking): add service selection step` |
| `fix` | Bug fix | `fix(auth): resolve OTP validation error` |
| `docs` | Documentation | `docs(api): update API documentation` |
| `style` | Code style (formatting) | `style(button): apply consistent spacing` |
| `refactor` | Code refactoring | `refactor(api): consolidate duplicate endpoints` |
| `perf` | Performance improvement | `perf(list): implement virtualization` |
| `test` | Add/update tests | `test(booking): add unit tests for slots` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |
| `ci` | CI/CD changes | `ci(github): add automated tests` |
| `revert` | Revert previous commit | `revert: feat(booking): add payment step` |

### Scope Examples

- `auth` - Authentication
- `booking` - Booking flow
- `appointments` - Appointments
- `payments` - Payment processing
- `ui` - UI components
- `api` - API integration
- `validation` - Zod schemas

### Subject Line Rules

- ✅ Use imperative mood ("add" not "added")
- ✅ Don't capitalize first letter
- ✅ No period at the end
- ✅ Maximum 50 characters
- ✅ Clear and concise

### Body (Optional)

- Explain **what** and **why**, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

- Reference issues: `Fixes #123`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

```bash
# Good examples
feat(auth): add Google OAuth login support

fix(booking): prevent double-booking same time slot

refactor(api): parallelize waterfall API calls
Reduces initial load time from 8s to 1s by using Promise.all

perf(appointments): add memoization to appointment list
Fixes #456

BREAKING CHANGE: auth token format changed to JWT

# Bad examples
Update stuff                          # ❌ Too vague
Fixed bug                             # ❌ Not descriptive
feat(booking): Added payment step.    # ❌ Wrong tense, period
```

### Branch Naming

```bash
# Format: <type>/<scope>-<short-description>

feature/booking-payment-integration
fix/auth-otp-validation-error
refactor/api-waterfall-optimization
docs/update-api-documentation
```

---

## Testing Requirements

### Test Coverage Targets

| Category | Minimum Coverage | Target Coverage |
|----------|-----------------|-----------------|
| **Overall** | 70% | 80%+ |
| **Critical paths** | 90% | 100% |
| **Utilities** | 80% | 90% |
| **Components** | 60% | 75% |
| **Services** | 80% | 90% |

### What to Test

#### 1. Unit Tests (Required)

**Test:**
- ✅ Utility functions
- ✅ Validation schemas
- ✅ Reducers & selectors
- ✅ Custom hooks
- ✅ Service functions

```typescript
// __tests__/utils/formatDate.test.ts
import { formatDate } from '@/shared/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
  });

  it('should handle invalid dates', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow();
  });
});
```

#### 2. Component Tests (Required)

**Test:**
- ✅ Rendering with different props
- ✅ User interactions
- ✅ Conditional rendering
- ✅ Error states

```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/shared/components';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Click me" onPress={() => {}} />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click" onPress={onPress} />);

    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should show loading indicator when loading', () => {
    const { getByTestId } = render(
      <Button title="Click" onPress={() => {}} loading />
    );
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
```

#### 3. Integration Tests (Recommended)

**Test:**
- ✅ Feature flows
- ✅ API integration
- ✅ Navigation flows
- ✅ State management

```typescript
// __tests__/integration/booking-flow.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BookingFlow } from '@/features/booking';

describe('Booking Flow', () => {
  it('should complete booking flow', async () => {
    const { getByText, getByTestId } = render(<BookingFlow />);

    // Select service
    fireEvent.press(getByText('Haircut'));
    fireEvent.press(getByText('Next'));

    // Select staff
    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText('Next'));

    // Select time
    fireEvent.press(getByText('10:00 AM'));
    fireEvent.press(getByText('Confirm'));

    // Verify booking created
    await waitFor(() => {
      expect(getByText('Booking Confirmed')).toBeTruthy();
    });
  });
});
```

### Test File Organization

```
__tests__/
├── unit/
│   ├── utils/
│   ├── hooks/
│   ├── services/
│   └── validation/
├── integration/
│   ├── booking-flow.test.ts
│   ├── appointment-management.test.ts
│   └── payment-processing.test.ts
└── e2e/
    └── critical-paths.test.ts
```

### Test Naming Convention

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do expected behavior when condition', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

---

## Documentation Standards

### Code Comments

#### When to Comment

**DO comment:**
- ✅ Complex algorithms
- ✅ Non-obvious business logic
- ✅ Workarounds/hacks
- ✅ Public APIs
- ✅ Configuration rationale

**DON'T comment:**
- ❌ Obvious code
- ❌ What code does (use good naming instead)
- ❌ Redundant information

```typescript
// ❌ BAD: Obvious comment
// Set user name to John
const userName = 'John';

// ✅ GOOD: Explains WHY
// Use lowercase to ensure case-insensitive email matching
const normalizedEmail = email.toLowerCase();

// ✅ GOOD: Explains complex logic
/**
 * Calculate available time slots excluding:
 * - Already booked slots
 * - Staff breaks
 * - Business hours outside 9am-6pm
 * - Slots too close to existing bookings (< 15min buffer)
 */
function calculateAvailableSlots(date, bookings, staffBreaks) {
  // ...
}
```

### JSDoc for Complex Functions

```typescript
/**
 * Creates a new booking with validation and payment processing
 *
 * @param bookingData - Booking information including services, staff, and time
 * @param paymentMethod - Payment method ('card' | 'cash' | 'pay_later')
 * @returns Promise resolving to booking confirmation with appointment number
 *
 * @throws {ValidationError} If booking data is invalid
 * @throws {PaymentError} If payment processing fails
 * @throws {AvailabilityError} If selected time slot is no longer available
 *
 * @example
 * ```typescript
 * const booking = await createBooking({
 *   locationId: 1,
 *   services: [{ serviceId: 5, staffId: 3 }],
 *   appointmentDate: '2024-01-15',
 *   startTime: '10:00',
 * }, 'card');
 * ```
 */
export async function createBooking(
  bookingData: BookingRequest,
  paymentMethod: PaymentMethod
): Promise<BookingConfirmation> {
  // Implementation
}
```

### Component Documentation

```typescript
/**
 * ServiceCard - Displays service information with pricing and duration
 *
 * @component
 * @example
 * ```tsx
 * <ServiceCard
 *   service={{
 *     id: 1,
 *     name: 'Haircut',
 *     price: 5000,
 *     duration: 30
 *   }}
 *   onPress={() => selectService(1)}
 * />
 * ```
 */
export function ServiceCard({ service, onPress }: ServiceCardProps) {
  // ...
}
```

### README Requirements

**Every feature module must have README.md:**

```markdown
# Feature Name

## Overview
Brief description of the feature

## Architecture
Component hierarchy and data flow

## API Endpoints
List of endpoints used

## State Management
Redux slices, selectors, and thunks

## Testing
How to test this feature

## Known Issues
Current limitations or bugs
```

---

## Performance Benchmarks

### Load Time Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| **App Launch** | < 2s | < 3s |
| **Screen Navigation** | < 300ms | < 500ms |
| **API Response** | < 1s | < 2s |
| **List Scroll (60fps)** | 16ms/frame | 20ms/frame |

### Bundle Size Limits

| Platform | Target | Maximum |
|----------|--------|---------|
| **iOS (IPA)** | < 40MB | < 50MB |
| **Android (APK)** | < 35MB | < 45MB |
| **JavaScript Bundle** | < 3MB | < 5MB |

### Memory Usage

| Metric | Target | Maximum |
|--------|--------|---------|
| **Idle Memory** | < 50MB | < 80MB |
| **Active Use** | < 150MB | < 200MB |
| **Peak Usage** | < 250MB | < 300MB |

### Performance Checklist

**Before merging, verify:**

- [ ] No unnecessary re-renders (use React DevTools)
- [ ] Images optimized (compressed, appropriate size)
- [ ] Lists virtualized (FlatList with proper config)
- [ ] Heavy computations memoized
- [ ] API calls parallelized where possible
- [ ] Bundle size under limit
- [ ] No memory leaks (listeners cleaned up)
- [ ] Animations run at 60fps

### Optimization Techniques

```typescript
// ✅ GOOD: Memoized expensive computation
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.date - b.date);
}, [data]);

// ✅ GOOD: Memoized component
const MemoizedItem = React.memo(({ item }) => <Item data={item} />);

// ✅ GOOD: Optimized FlatList
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={10}
/>

// ✅ GOOD: Parallel API calls
const [users, services, staff] = await Promise.all([
  api.getUsers(),
  api.getServices(),
  api.getStaff(),
]);
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance (Required)

**Minimum requirements:**

#### 1. Screen Reader Support

```typescript
// ✅ REQUIRED: All interactive elements must have labels
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Book appointment"
  accessibilityHint="Opens booking form"
  accessibilityRole="button"
  onPress={handlePress}
>
  <Text>Book Now</Text>
</TouchableOpacity>
```

#### 2. Color Contrast Ratios

| Text Type | Minimum Contrast |
|-----------|------------------|
| **Normal text** | 4.5:1 |
| **Large text (18pt+)** | 3:1 |
| **UI components** | 3:1 |

```typescript
// ✅ GOOD: Sufficient contrast
const styles = StyleSheet.create({
  text: {
    color: '#000000', // Black text
    backgroundColor: '#FFFFFF', // White background
    // Contrast ratio: 21:1 ✅
  },
});

// ❌ BAD: Insufficient contrast
const styles = StyleSheet.create({
  text: {
    color: '#CCCCCC', // Light gray text
    backgroundColor: '#FFFFFF', // White background
    // Contrast ratio: 1.6:1 ❌
  },
});
```

#### 3. Touch Target Size

```typescript
// ✅ REQUIRED: Minimum 44x44 points for all touch targets
const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
  },
});
```

#### 4. Keyboard Navigation

```typescript
// ✅ REQUIRED: Support keyboard navigation
<TextInput
  accessibilityLabel="Email address"
  returnKeyType="next"
  onSubmitEditing={() => passwordRef.current?.focus()}
/>

<TextInput
  ref={passwordRef}
  accessibilityLabel="Password"
  returnKeyType="done"
  onSubmitEditing={handleSubmit}
/>
```

### Accessibility Checklist

**Before release:**

- [ ] All images have alt text (`accessibilityLabel`)
- [ ] All buttons have descriptive labels
- [ ] Color is not the only means of conveying information
- [ ] Forms have proper labels and error messages
- [ ] Focus order is logical
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader testing completed (TalkBack/VoiceOver)
- [ ] Tested with 200% text size
- [ ] No time-based auto-dismissing content

---

## Summary

### Development Workflow

1. **Before Starting:**
   - Review ARCHITECTURE.md
   - Check VALIDATION_GUIDE.md for schemas
   - Follow file naming conventions

2. **While Coding:**
   - Always validate external data with Zod
   - Follow component creation patterns
   - Write tests as you go
   - Run linter regularly

3. **Before Committing:**
   - Run tests (`npm test`)
   - Run linter (`npm run lint`)
   - Format code (`npm run format`)
   - Write conventional commit message

4. **Before Merging:**
   - Code review approved
   - All tests passing
   - Coverage targets met
   - Performance benchmarks met
   - Accessibility checked

### Quick Reference

| Task | Command |
|------|---------|
| Run tests | `npm test` |
| Test coverage | `npm run test:coverage` |
| Lint code | `npm run lint` |
| Fix lint | `npm run lint:fix` |
| Format code | `npm run format` |
| Type check | `npm run type-check` |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Status**: Official Development Guidelines
