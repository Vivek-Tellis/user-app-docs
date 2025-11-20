# Task 004: OTP Verification

## Overview
Implement enhanced OTP verification with countdown timer, resend functionality, auto-verification, and error handling for expired/invalid OTPs.

## Acceptance Criteria
- [ ] Countdown timer (5 minutes)
- [ ] Resend OTP functionality with rate limiting
- [ ] Auto-advance when OTP is complete
- [ ] Edit phone number option
- [ ] OTP expiry handling
- [ ] Validation for invalid/expired OTPs
- [ ] Accessibility for OTP input

## Components
- CountdownTimer.tsx
- ResendButton.tsx
- OtpInput.tsx

## API
- POST /auth/resend_otp

## Priority
P0 (Critical)

## Effort
40-60 hours

## Dependencies
task_003: Authentication Core
