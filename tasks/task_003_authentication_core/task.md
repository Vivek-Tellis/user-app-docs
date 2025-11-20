# Task 003: Authentication Core (Phone/Email Login)

## Overview
Implement the core authentication system using phone/email login with OTP verification. This includes the login screen, authentication logic, Redux auth slice, and integration with the validation library.

## Description
Build the foundational authentication flow that allows users to log in using their phone number or email address. This involves creating the login UI, implementing OTP sending and verification, managing authentication state, and handling authentication errors.

## Acceptance Criteria
- [ ] Login screen UI with phone/email input
- [ ] OTP input screen UI
- [ ] Auth Redux slice with state management
- [ ] RTK Query endpoints for send_otp and verify_otp_login
- [ ] Form validation using Zod schemas
- [ ] Loading states during authentication
- [ ] Error handling and display
- [ ] Navigation after successful login
- [ ] Auth token storage and retrieval
- [ ] Auto-login if valid token exists
- [ ] Logout functionality
- [ ] Auth context integration

## Dependencies
**Prerequisites:**
- task_000: Project Setup & Configuration
- task_001: Core Architecture Implementation
- task_002: Validation Library Integration

**Blocked Tasks:** All protected routes and user-specific features

## Component Requirements
### New Components Created
1. **LoginScreen.tsx** - Main login screen
2. **OtpScreen.tsx** - OTP verification screen
3. **AuthHeader.tsx** - Shared header for auth screens
4. **LoginForm.tsx** - Login form component

### Redux Slice
1. **authSlice.ts** - Authentication state management

### API Endpoints
1. **authApi** - RTK Query endpoints

## API Requirements
### Endpoints Required
- POST `/auth/send_otp` - Send OTP to phone/email
- POST `/auth/verify_otp_login` - Verify OTP and login
- GET `/auth/me` - Get current user profile (after login)

### Validation Schemas
- sendOtpRequestSchema - Validate phone/email
- verifyOtpLoginRequestSchema - Validate OTP
- loginResponseSchema - Validate login response

## Complexity Estimate
**M (Medium)** - 1-2 weeks effort

## Priority Level
**P0 (Critical)** - Required for app access

## Estimated Effort
60-80 hours

## Testing Requirements
- Unit tests for auth slice
- Unit tests for auth API endpoints
- Integration tests for login flow
- E2E tests for authentication
- Form validation tests
