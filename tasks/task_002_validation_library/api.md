# API Requirements - Task 002: Validation Library Integration

## Primary API Endpoints
**All API endpoints require validation:**

### Authentication Endpoints
- POST `/auth/send_otp` - Validate phone/email
- POST `/auth/verify_otp_login` - Validate OTP response
- POST `/auth/login_with_otp` - Validate login request/response
- POST `/auth/register_with_otp` - Validate registration
- GET `/auth/me` - Validate user profile response

### Salon Endpoints
- GET `/location` - Validate salon list response
- GET `/salon/detail` - Validate salon detail response
- GET `/get_salon_services` - Validate services response
- GET `/get_salon_reviews` - Validate reviews response
- POST `/favorite` - Validate favorite/unfavorite request

### Booking Endpoints
- POST `/available_slots` - Validate slots request/response
- POST `/save-booking` - Validate booking request/response
- POST `/get-bookings` - Validate bookings list response
- PUT `/booking-status` - Validate status update request

### Appointment Endpoints
- POST `/appt` - Validate appointments list request/response
- GET `/appointment_detail` - Validate detail response
- POST `/cancel_appt` - Validate cancellation request
- POST `/reschedule_appt` - Validate reschedule request

### Payment Endpoints
- POST `/payment/methods` - Validate payment methods
- POST `/payment/stripe-intent` - Validate Stripe payment intent
- POST `/payment/confirm` - Validate payment confirmation
- GET `/payment/history` - Validate payment history

## Request/Response Schemas

### API Response Wrapper Schema
```typescript
// Common API response structure
const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    errors: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).optional(),
  });

// Usage
const getSalonsResponseSchema = apiResponseSchema(
  z.array(salonSchema)
);
```

### Request Validation Schema
```typescript
const sendOtpRequestSchema = z.object({
  phone: phoneSchema,
  type: z.enum(['login', 'register']),
});

const verifyOtpLoginRequestSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
});
```

## Alternative API Approaches

### Option 1: RTK Query with Transform (Recommended)
**Pros:**
- Automatic validation on all responses
- Type-safe transformation
- Centralized error handling
- Built-in loading states

**Implementation:**
```typescript
getSalons: builder.query<Salon[], void>({
  query: () => '/salons',
  transformResponse: (response: unknown) => {
    const validated = getSalonsResponseSchema.parse(response);
    return validated.data || [];
  },
  transformErrorResponse: (response: unknown) => {
    const validated = apiErrorSchema.parse(response);
    return validated.message;
  },
}),
```

### Option 2: API Client Interceptors
**Pros:**
- Validates all responses automatically
- Works with any API client
- Transparent to endpoints

**Cons:**
- Harder to test
- Less granular control

**Implementation:**
```typescript
apiClient.interceptors.response.use(
  (response) => {
    const schema = getResponseSchema(response.config.url!);
    response.data = schema.parse(response.data);
    return response;
  }
);
```

### Option 3: Manual Validation in Each Endpoint
**Pros:**
- Explicit control
- Easy to understand

**Cons:**
- Repetitive code
- Easy to forget validation
- Inconsistent error handling

**Recommendation:** Use Option 1 (RTK Query transform) for better type safety and control

## Dependent API Calls
**Authentication Flow:**
```
1. send_otp → Validate phone/email format
2. verify_otp_login → Validate OTP
3. login_with_otp → Validate credentials
4. /auth/me → Validate user profile
```

**Booking Flow:**
```
1. get_salons → Validate salon data
2. get_salon_services → Validate service data
3. available_slots → Validate slot availability
4. save-booking → Validate booking confirmation
```

## Parallel API Calls
**Initial App Load:**
```typescript
// Fetch user, slider, and settings in parallel
const [userResult, sliderResult, settingsResult] = await Promise.all([
  api.getUserProfile(),
  api.getSlider(),
  api.getAppSettings(),
]);
// Validate all responses
```

**Salon Detail:**
```typescript
// Fetch salon, services, reviews, and staff in parallel
const [salon, services, reviews, staff] = await Promise.all([
  api.getSalonDetail(id),
  api.getSalonServices(id),
  api.getSalonReviews(id),
  api.getSalonStaff(id),
]);
// Validate all with respective schemas
```

## Validation Schemas (Zod References)

### Schema Files Location
```
src/validation/
├── common.schema.ts - idSchema, emailSchema, phoneSchema, dateSchema
├── auth.schema.ts - loginRequestSchema, loginResponseSchema
├── salon.schema.ts - salonSchema, getSalonsResponseSchema
├── services.schema.ts - serviceSchema, servicesListSchema
├── booking.schema.ts - availableSlotsRequestSchema, saveBookingRequestSchema
└── appointments.schema.ts - getAppointmentsRequestSchema, appointmentSchema
```

### Critical Fields to Validate

**User Data:**
- User ID (number)
- Email format
- Phone format
- Name (non-empty)

**Booking Data:**
- Appointment date (valid date)
- Time slot (within business hours)
- Service ID (exists)
- Staff ID (exists)

**Payment Data:**
- Amount (positive number)
- Currency (valid currency code)
- Payment method (valid enum)

## Caching Strategy
**Schema Compilation Cache:**
```typescript
// Cache compiled schemas for performance
const schemaCache = new Map<string, z.ZodSchema>();

function getSchema(endpoint: string, method: string): z.ZodSchema {
  const key = `${method}:${endpoint}`;
  if (!schemaCache.has(key)) {
    schemaCache.set(key, createSchemaForEndpoint(endpoint, method));
  }
  return schemaCache.get(key)!;
}
```

**Validation Cache:**
```typescript
// Cache validated data for frequent API calls
const validationCache = new Map<string, {
  data: unknown;
  timestamp: number;
}>();

// Cache for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
```

## Error Scenarios & Handling

### Validation Error Types
```typescript
// Zod validation errors
interface ValidationError {
  code: 'validation_error';
  field: string;
  message: string;
  value: unknown;
}

// API response errors
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Network errors
interface NetworkError {
  code: 'network_error';
  message: string;
  status?: number;
}
```

### Error Handling Pattern
```typescript
try {
  const validatedData = schema.parse(rawData);
  return { success: true, data: validatedData };
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format validation errors
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return { success: false, errors: formattedErrors };
  }

  // Other errors
  return { success: false, error: 'Unknown error' };
}
```

### User-Friendly Error Messages
```typescript
const errorMap: Record<string, string> = {
  'Invalid email address': 'Please enter a valid email',
  'Required': 'This field is required',
  'Too small': 'Value is too small',
  'Too big': 'Value is too large',
  'Invalid enum value': 'Please select a valid option',
};

function formatError(error: ZodIssue): string {
  return errorMap[error.message] || error.message;
}
```

## Performance Considerations
- **Schema Compilation:** Cache compiled schemas to avoid recompilation
- **Validation Strategy:** Use `safeParse` instead of `parse` in production (non-throwing)
- **Partial Validation:** Validate only critical fields initially, validate rest asynchronously
- **Batch Validation:** Validate arrays in batches for large datasets
- **Error Logging:** Log validation errors server-side for debugging
