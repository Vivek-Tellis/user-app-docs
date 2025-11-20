# Task 002: Validation Library Integration

## Overview
Implement and integrate the complete Zod validation schema library throughout the application, ensuring all external data is validated before use. This includes setting up the schema directory structure, implementing all validation schemas, creating validation utilities, and integrating validation with RTK Query and form handling.

## Description
Build upon the existing validation schemas (already created in `/src/validation/` directory) to create a comprehensive validation system. Integrate Zod validation with RTK Query for API response validation, with React Hook Form for form validation, and create validation utilities for route parameters, AsyncStorage data, and other external data sources.

## Acceptance Criteria
- [ ] All 14 validation schema files implemented (auth, user, salon, services, staff, booking, appointments, payments, notifications, giftcards, memberships, packages, feedback, common)
- [ ] Common schemas implemented (id, email, phone, URL, date, money, etc.)
- [ ] API response validation integrated with RTK Query
- [ ] Form validation hooks created using react-hook-form + zod
- [ ] Route parameter validation utilities created
- [ ] AsyncStorage data validation implemented
- [ ] Validation error handling utilities created
- [ ] Custom validation error messages in user-friendly language
- [ ] Validation middleware for API client
- [ ] TypeScript types inferred from all schemas
- [ ] Validation schema tests created (unit tests)
- [ ] Integration tests for validation with forms and API
- [ ] Validation documentation updated (VALIDATION_GUIDE.md)
- [ ] Example validation usage patterns documented

## Dependencies
**Prerequisites:**
- task_000: Project Setup & Configuration
- task_001: Core Architecture Implementation

**Blocked Tasks:** All feature tasks that validate data

## Component Requirements
### New Components Created
1. **ValidationProvider.tsx** - Global validation context provider
2. **FormField.tsx** - Reusable form field with validation
3. **ValidationMessage.tsx** - Display validation errors
4. **useValidatedForm.tsx** - Custom hook for validated forms
5. **validateRouteParams.ts** - Route parameter validation utility

### Updated Components
- AppProviders - Add ValidationProvider wrapper

## API Requirements
**RTK Query Integration:**
- Validate all API responses with schemas
- Transform validation errors for user-friendly display
- Log validation errors for debugging
- Retry API calls on validation failures

**API Client Middleware:**
- Request validation before sending
- Response validation on receive
- Error transformation

## Validation Requirements

### Data Sources to Validate
1. **API Responses** - All endpoints must validate responses
2. **Form Inputs** - All user input must be validated
3. **Route Parameters** - All dynamic routes must validate params
4. **AsyncStorage Data** - All persisted data must be validated
5. **Deep Link Data** - All URL parameters must be validated
6. **Third-party Data** - All external service data

### Schema Implementation Priority
1. Common schemas (id, email, phone, etc.)
2. Auth schemas (login, register, OTP)
3. User schemas (profile, settings)
4. Business logic schemas (booking, appointments)
5. Supporting schemas (salon, services, staff, etc.)

## Complexity Estimate
**L (Large)** - 2-3 weeks effort

This involves creating 70+ schemas, integrating with multiple systems (RTK Query, forms, storage), and ensuring comprehensive validation coverage.

## Priority Level
**P0 (Critical)** - Required for all data handling

## Estimated Effort
100-140 hours

## Testing Requirements
- Unit tests for all schemas
- Integration tests for API validation
- Form validation tests
- Route parameter validation tests
- AsyncStorage validation tests
- Error handling tests
- E2E tests for validation flow

## Schema Files Structure
```
src/validation/
├── index.ts                    # Barrel exports
├── common.schema.ts            # Reusable primitives
├── auth.schema.ts              # Authentication
├── user.schema.ts              # User profiles
├── salon.schema.ts             # Salons & locations
├── services.schema.ts          # Services
├── staff.schema.ts             # Staff members
├── booking.schema.ts           # Booking flow
├── appointments.schema.ts      # Appointments
├── payments.schema.ts          # Payments
├── notifications.schema.ts     # Notifications
├── giftcards.schema.ts         # Gift cards
├── memberships.schema.ts       # Memberships
├── packages.schema.ts          # Packages
└── feedback.schema.ts          # Reviews & feedback
```

## Key Implementation Details

### RTK Query Integration
```typescript
// services/api/withValidation.ts
export const apiWithValidation = createApi({
  baseQuery: baseQueryWithValidation,
  endpoints: (builder) => ({
    getSalons: builder.query<Salon[], void>({
      query: () => '/salons',
      transformResponse: (response: unknown) => {
        return getSalonsResponseSchema.parse(response).data;
      },
      transformErrorResponse: (response: unknown) => {
        return apiErrorSchema.parse(response);
      },
    }),
  }),
});
```

### Form Validation Hook
```typescript
// hooks/useValidatedForm.ts
export function useValidatedForm<T extends z.ZodSchema>(
  schema: T,
  defaultValues: z.infer<T>
) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return form;
}
```

### Route Validation Utility
```typescript
// utils/validateRouteParams.ts
export function validateRouteParams<T extends z.ZodSchema>(
  params: Record<string, any>,
  schema: T
): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new Error(`Invalid route parameters: ${result.error.message}`);
  }

  return result.data;
}
```

### API Client Validation Middleware
```typescript
// services/api/client.ts
apiClient.interceptors.request.use((config) => {
  if (config.data) {
    // Validate request data
    const schema = getSchemaForEndpoint(config.url!, config.method!);
    config.data = schema.parse(config.data);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Validate response data
    const schema = getResponseSchemaForEndpoint(response.config.url!);
    response.data = schema.parse(response.data);
    return response;
  },
  (error) => {
    // Transform validation errors
    if (error.response?.data) {
      const validationError = apiErrorSchema.parse(error.response.data);
      error.message = validationError.message;
    }
    return Promise.reject(error);
  }
);
```

## Notes
- Follow VALIDATION_GUIDE.md for all validation patterns
- Use DEVELOPMENT_GUIDELINES.md for code standards
- All schemas must have comprehensive TypeScript types
- Validation errors must be user-friendly
- Performance: Cache schema compilations
- All validation failures must be logged for debugging
