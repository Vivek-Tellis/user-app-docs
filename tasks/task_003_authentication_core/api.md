# API Requirements - Task 003: Authentication Core

## Primary API Endpoints

### 1. Send OTP
**Endpoint:** POST `/auth/send_otp`
**Purpose:** Send OTP to phone or email for authentication

**Request Schema:**
```typescript
const sendOtpRequestSchema = z.object({
  phone: phoneSchema, // +1234567890 format
  type: z.enum(['login', 'register']),
});

const sendOtpResponseSchema = apiResponseSchema(
  z.object({
    message: nonEmptyStringSchema,
    expires_at: dateStringSchema.optional(),
  })
);
```

**Alternative Approaches:**
- **Email OTP**: Use email instead of SMS (cheaper, slower)
- **Voice OTP**: Voice call for OTP (accessibility)
- **WhatsApp OTP**: WhatsApp Business API (region-specific)

**Recommendation:** SMS OTP (current) + Email backup

---

### 2. Verify OTP Login
**Endpoint:** POST `/auth/verify_otp_login`
**Purpose:** Verify OTP and authenticate user

**Request Schema:**
```typescript
const verifyOtpLoginRequestSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  device_token: z.string().optional(), // For push notifications
});

const loginResponseSchema = apiResponseSchema(
  z.object({
    token: z.string(), // JWT token
    user: userSchema,
    expires_at: dateStringSchema,
  })
);
```

**Dependent API Calls:**
```
1. verify_otp_login → Get auth token
2. /auth/me → Fetch user profile
3. Setup push notifications (optional)
```

---

### 3. Get User Profile
**Endpoint:** GET `/auth/me`
**Purpose:** Get current authenticated user profile

**Response Schema:**
```typescript
const getProfileResponseSchema = apiResponseSchema(
  userSchema
);
```

## Parallel API Calls
**After Login:**
```typescript
// Fetch user profile and setup app in parallel
const [userProfile] = await Promise.all([
  authApi.getProfile(), // Validate response with userSchema
]);
```

## Validation Schemas
**Critical Fields:**
- phone: Must match international format (+1234567890)
- otp: 6-digit numeric code
- token: JWT format validation
- user: Complete user profile with id, name, email, phone

**Schema References:**
- `src/validation/auth.schema.ts` - sendOtpRequestSchema, verifyOtpLoginRequestSchema, loginResponseSchema
- `src/validation/user.schema.ts` - userSchema
- `src/validation/common.schema.ts` - phoneSchema, dateStringSchema

## Caching Strategy
**User Profile Cache:**
- Cache profile for 30 minutes
- Invalidate on profile update
- Auto-refetch on app focus

**Token Handling:**
- Store in secure storage (Keychain)
- Refresh before expiry
- Clear on logout

## Error Scenarios & Handling

### OTP Verification Errors
```typescript
// Invalid OTP
{
  status: false,
  message: 'Invalid OTP code',
  errors: [{ field: 'otp', message: 'Invalid or expired OTP' }]
}

// OTP Expired
{
  status: false,
  message: 'OTP has expired',
  errors: [{ field: 'otp', message: 'Please request a new OTP' }]
}

// Too Many Attempts
{
  status: false,
  message: 'Too many attempts',
  errors: [{ field: 'otp', message: 'Try again in 10 minutes' }]
}
```

### Authentication Errors
```typescript
// Invalid Phone
{
  status: false,
  message: 'Phone number not registered',
  errors: [{ field: 'phone', message: 'Please register first' }]
}

// Network Error
{
  status: false,
  message: 'Network error',
  errors: [{ field: 'general', message: 'Please check your connection' }]
}
```

### Error Handling Pattern
```typescript
try {
  const response = await authApi.sendOtp(data);
  return { success: true, data: response };
} catch (error) {
  if (error.status === 400) {
    // Validation error from server
    return { success: false, error: error.data.message };
  }
  if (error.status === 429) {
    // Rate limited
    return { success: false, error: 'Too many requests. Try again later.' };
  }
  if (!navigator.onLine) {
    // Network error
    return { success: false, error: 'No internet connection' };
  }
  return { success: false, error: 'Authentication failed' };
}
```

## Security Considerations
- **OTP Expiry**: OTP should expire after 5 minutes
- **Rate Limiting**: Max 5 OTP requests per phone per hour
- **Token Storage**: Use Keychain (iOS) / Encrypted SharedPreferences (Android)
- **HTTPS Only**: All auth endpoints must use HTTPS
- **Token Refresh**: Implement silent token refresh
- **Device Binding**: Bind token to device for security
