# Validation Guide: Zod Schema Library

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Schema Organization](#schema-organization)
4. [Basic Usage](#basic-usage)
5. [Validation Patterns](#validation-patterns)
6. [Custom Validators](#custom-validators)
7. [Error Handling](#error-handling)
8. [TypeScript Integration](#typescript-integration)
9. [Testing Strategies](#testing-strategies)
10. [Best Practices](#best-practices)

---

## Overview

This centralized validation library provides **comprehensive Zod schemas** for all API request and response types in the Salonnz UserApp. It ensures:

- **Type safety**: TypeScript types automatically inferred from schemas
- **Runtime validation**: Catch data shape errors at runtime
- **Consistent validation**: Single source of truth for all data structures
- **Developer experience**: Autocomplete and IntelliSense support
- **Error handling**: Descriptive, user-friendly error messages

---

## Installation

### Dependencies

```bash
npm install zod
# or
yarn add zod
```

### Import Schemas

```typescript
// Import specific schemas
import { userSchema, emailSchema } from '@/validation/auth.schema';

// Import all schemas (barrel export)
import * as schemas from '@/validation';

// Import common utilities
import { apiResponseSchema, nullable, withDefault } from '@/validation/common.schema';
```

---

## Schema Organization

```
src/validation/
├── index.ts                    # Barrel exports (import all)
├── common.schema.ts            # Shared schemas & utilities
├── auth.schema.ts              # Authentication & OAuth
├── user.schema.ts              # User profile & account
├── salon.schema.ts             # Salon, locations, themes
├── services.schema.ts          # Services & categories
├── staff.schema.ts             # Staff members
├── booking.schema.ts           # Booking flow
├── appointments.schema.ts      # Appointments management
├── payments.schema.ts          # Payment processing
├── notifications.schema.ts     # Notifications
├── giftcards.schema.ts         # Gift cards
├── memberships.schema.ts       # Memberships
├── packages.schema.ts          # Service packages
└── feedback.schema.ts          # Feedback & reviews
```

### Schema Naming Conventions

| Pattern | Description | Example |
|---------|-------------|---------|
| `*Schema` | Data structure schema | `userSchema`, `serviceSchema` |
| `*RequestSchema` | API request body schema | `loginRequestSchema` |
| `*ResponseSchema` | API response schema | `loginResponseSchema` |
| `*Enum` | Enum/union type | `statusEnum`, `paymentMethodEnum` |

---

## Basic Usage

### 1. Validate Data

```typescript
import { z } from 'zod';
import { userSchema, emailSchema } from '@/validation';

// Parse and validate
try {
  const user = userSchema.parse(userData);
  console.log('Valid user:', user);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors);
  }
}

// Safe parse (doesn't throw)
const result = emailSchema.safeParse('invalid-email');
if (!result.success) {
  console.error('Invalid email:', result.error.errors);
} else {
  console.log('Valid email:', result.data);
}
```

### 2. Infer TypeScript Types

```typescript
import { userSchema, type User } from '@/validation/auth.schema';

// Type is automatically inferred from schema
type User = z.infer<typeof userSchema>;

// Use the type
const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer',
  created_at: '2024-01-01',
};
```

### 3. Validate API Requests

```typescript
import { apiClient } from '@/services/api/client';
import { loginRequestSchema, loginResponseSchema } from '@/validation';

async function login(credentials: unknown) {
  // Validate request data
  const validatedRequest = loginRequestSchema.parse(credentials);

  // Make API call
  const response = await apiClient.post('/auth/login', validatedRequest);

  // Validate response data
  return loginResponseSchema.parse(response);
}
```

---

## Validation Patterns

### Pattern 1: API Request Validation

**Where**: Before making API call
**Why**: Prevent invalid requests, fast feedback to user

```typescript
// services/api/endpoints/booking.api.ts
import { apiClient } from '../client';
import { saveBookingRequestSchema, saveBookingResponseSchema } from '@/validation';

export const bookingApi = {
  async createBooking(data: unknown) {
    // Validate request
    const validatedRequest = saveBookingRequestSchema.parse(data);

    // Make API call
    const response = await apiClient.post('/booking/save-booking', validatedRequest);

    // Validate response
    return saveBookingResponseSchema.parse(response);
  },
};
```

### Pattern 2: API Response Validation

**Where**: After receiving API response
**Why**: Ensure data integrity, catch API changes

```typescript
// services/api/endpoints/appointments.api.ts
import { apiClient } from '../client';
import { getAppointmentsResponseSchema } from '@/validation';

export const appointmentsApi = {
  async getAppointments(status: 'upcoming' | 'completed' | 'cancelled') {
    const response = await apiClient.post('/appt', { status });

    // Validate response structure
    const validated = getAppointmentsResponseSchema.parse(response);

    return validated.data;
  },
};
```

### Pattern 3: Form Validation

**Where**: On form submit
**Why**: Validate user input before network call

```typescript
// features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyOtpLoginRequestSchema } from '@/validation';

export function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpLoginRequestSchema),
  });

  const onSubmit = async (data: unknown) => {
    // data is already validated by react-hook-form + zod
    await authApi.verifyOtpLogin(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Pattern 4: Route Parameter Validation

**Where**: On navigation/screen mount
**Why**: Prevent invalid routes

```typescript
// app/(main)/appointments/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { idSchema } from '@/validation';

export default function AppointmentDetailScreen() {
  const params = useLocalSearchParams();

  // Validate route parameter
  const result = idSchema.safeParse(Number(params.id));

  if (!result.success) {
    return <ErrorScreen message="Invalid appointment ID" />;
  }

  const appointmentId = result.data;

  // Fetch appointment with validated ID
  const { data } = useAppointment(appointmentId);

  return <AppointmentDetail appointment={data} />;
}
```

---

## Custom Validators

### 1. Email with Custom Domain

```typescript
import { z } from 'zod';

const corporateEmailSchema = z
  .string()
  .email()
  .refine(
    (email) => email.endsWith('@company.com'),
    'Must be a company email address'
  );
```

### 2. Phone Number with Country Code

```typescript
const internationalPhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format')
  .transform((phone) => phone.replace(/\s/g, ''));
```

### 3. Date Range Validation

```typescript
const dateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    'End date must be after start date'
  );
```

### 4. Conditional Required Fields

```typescript
const bookingSchema = z
  .object({
    paymentType: z.enum(['full', 'deposit', 'pay_later']),
    cardDetails: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentType === 'full' || data.paymentType === 'deposit') {
        return !!data.cardDetails;
      }
      return true;
    },
    {
      message: 'Card details required for card payments',
      path: ['cardDetails'],
    }
  );
```

### 5. Password Strength

```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');
```

---

## Error Handling

### 1. Parse Errors

```typescript
import { z } from 'zod';
import { userSchema } from '@/validation';

try {
  const user = userSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Access all errors
    console.log(error.errors);

    // Format errors for display
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    // Example output:
    // [
    //   { field: 'email', message: 'Invalid email address' },
    //   { field: 'name', message: 'Name must be at least 2 characters' }
    // ]
  }
}
```

### 2. Safe Parse

```typescript
const result = emailSchema.safeParse(input);

if (!result.success) {
  // Handle error without throwing
  const errors = result.error.format();
  // { _errors: ['Invalid email address'] }
} else {
  // Use validated data
  const email = result.data;
}
```

### 3. Global Error Handler

```typescript
// utils/validation.ts
import { z } from 'zod';

export function validateOrThrow<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
  errorMessage = 'Validation failed'
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      throw new Error(`${errorMessage}: ${formattedErrors}`);
    }
    throw error;
  }
}

// Usage
const validData = validateOrThrow(userSchema, data, 'Invalid user data');
```

### 4. User-Friendly Error Messages

```typescript
// Custom error map for better UX
const customErrorMap: z.ZodErrorMap = (error, ctx) => {
  if (error.code === z.ZodIssueCode.invalid_type) {
    if (error.expected === 'string') {
      return { message: 'This field is required' };
    }
  }
  if (error.code === z.ZodIssueCode.too_small) {
    if (error.type === 'string') {
      return { message: `Must be at least ${error.minimum} characters` };
    }
  }
  return { message: ctx.defaultError };
};

// Use custom error map
z.setErrorMap(customErrorMap);
```

---

## TypeScript Integration

### 1. Type Inference

```typescript
import { z } from 'zod';
import { userSchema } from '@/validation';

// Automatically infer TypeScript type
type User = z.infer<typeof userSchema>;

// Use in function signatures
function displayUser(user: User) {
  console.log(user.name, user.email);
}
```

### 2. Partial Types

```typescript
// Full type
type User = z.infer<typeof userSchema>;

// Partial type (all fields optional)
type PartialUser = Partial<User>;

// Zod equivalent
const partialUserSchema = userSchema.partial();
```

### 3. Pick & Omit

```typescript
// Pick specific fields
const userSummarySchema = userSchema.pick({
  id: true,
  name: true,
  email: true,
});
type UserSummary = z.infer<typeof userSummarySchema>;

// Omit fields
const userWithoutPasswordSchema = userSchema.omit({ password: true });
```

### 4. Extend Schemas

```typescript
const baseUserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const extendedUserSchema = baseUserSchema.extend({
  email: z.string().email(),
  phone: z.string().optional(),
});
```

---

## Testing Strategies

### 1. Test Schema Validation

```typescript
// __tests__/validation/user.schema.test.ts
import { userSchema } from '@/validation';

describe('userSchema', () => {
  it('should validate valid user data', () => {
    const validUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      created_at: '2024-01-01',
    };

    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidUser = {
      id: 1,
      name: 'John Doe',
      email: 'invalid-email',
      role: 'customer',
      created_at: '2024-01-01',
    };

    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('email');
    }
  });

  it('should require name field', () => {
    const userWithoutName = {
      id: 1,
      email: 'john@example.com',
      role: 'customer',
      created_at: '2024-01-01',
    };

    const result = userSchema.safeParse(userWithoutName);
    expect(result.success).toBe(false);
  });
});
```

### 2. Test API Response Validation

```typescript
// __tests__/api/appointments.api.test.ts
import { appointmentsApi } from '@/services/api';
import { getAppointmentsResponseSchema } from '@/validation';

describe('appointmentsApi', () => {
  it('should validate API response', async () => {
    const mockResponse = {
      status: true,
      data: [
        {
          id: 1,
          appointment_number: 'APT-001',
          date: '2024-01-15',
          status: 'upcoming',
          amount: 5000,
          services: [],
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
        per_page: 10,
      },
    };

    // Validate mock response structure
    const result = getAppointmentsResponseSchema.safeParse(mockResponse);
    expect(result.success).toBe(true);
  });
});
```

### 3. Mock Data Factories

```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User } from '@/validation';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role: 'customer',
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

// Usage in tests
const testUser = createMockUser({ email: 'test@example.com' });
```

---

## Best Practices

### 1. Always Validate External Data

```typescript
// ✅ Good: Validate data from API
const user = userSchema.parse(apiResponse.data);

// ❌ Bad: Trust external data without validation
const user = apiResponse.data as User; // Unsafe!
```

### 2. Use Descriptive Error Messages

```typescript
// ✅ Good: User-friendly message
const emailSchema = z.string().email('Please enter a valid email address');

// ❌ Bad: Generic message
const emailSchema = z.string().email();
```

### 3. Compose Schemas

```typescript
// ✅ Good: Reuse common schemas
const userProfileSchema = z.object({
  name: nonEmptyStringSchema,
  email: emailSchema,
  phone: phoneSchema,
});

// ❌ Bad: Duplicate validation logic
const userProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10,15}$/),
});
```

### 4. Validate at Boundaries

```typescript
// Validate when data enters your system
// 1. API responses
// 2. User input (forms)
// 3. Route parameters
// 4. External services

// Once validated, use TypeScript types internally
```

### 5. Handle Errors Gracefully

```typescript
// ✅ Good: Handle validation errors
const result = schema.safeParse(data);
if (!result.success) {
  showToast('Please check your input');
  return;
}

// ❌ Bad: Let validation errors crash app
const data = schema.parse(unknownData); // Can throw!
```

### 6. Use Type Inference

```typescript
// ✅ Good: Infer type from schema
type User = z.infer<typeof userSchema>;

// ❌ Bad: Manually maintain separate type
type User = {
  id: number;
  name: string;
  // ... manually kept in sync with schema
};
```

### 7. Test Your Schemas

```typescript
// ✅ Good: Test validation logic
describe('emailSchema', () => {
  it('should accept valid emails', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(emailSchema.safeParse('invalid').success).toBe(false);
  });
});
```

---

## Common Patterns

### Pattern: Optional with Default

```typescript
import { withDefault } from '@/validation/common.schema';

const settingsSchema = z.object({
  theme: withDefault(z.enum(['light', 'dark']), 'light'),
  notifications: withDefault(z.boolean(), true),
});
```

### Pattern: Nullable Fields

```typescript
import { nullable } from '@/validation/common.schema';

const userSchema = z.object({
  name: z.string(),
  bio: nullable(z.string()), // string | null
});
```

### Pattern: Transform Data

```typescript
const dateSchema = z.string().transform((str) => new Date(str));

const trimmedStringSchema = z.string().transform((str) => str.trim());

const uppercaseSchema = z.string().transform((str) => str.toUpperCase());
```

### Pattern: Union Types

```typescript
const paymentMethodSchema = z.union([
  z.literal('card'),
  z.literal('cash'),
  z.literal('gift_card'),
]);

// Or use enum
const paymentMethodEnum = z.enum(['card', 'cash', 'gift_card']);
```

---

## Summary

This validation library provides:

✅ **70+ schemas** for all API endpoints
✅ **Type-safe** TypeScript integration
✅ **Runtime validation** with descriptive errors
✅ **Reusable compositions** (email, phone, dates)
✅ **Consistent patterns** across the app
✅ **Easy testing** with safe parse

### Quick Reference

| Task | Code |
|------|------|
| Validate data | `schema.parse(data)` |
| Safe validate | `schema.safeParse(data)` |
| Infer type | `type T = z.infer<typeof schema>` |
| Optional field | `z.string().optional()` |
| Default value | `z.string().default('value')` |
| Custom error | `z.string().min(5, 'Custom message')` |
| Transform | `z.string().transform(fn)` |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Total Schemas**: 70+
**Schema Files**: 14
