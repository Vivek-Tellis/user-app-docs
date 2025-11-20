/**
 * Authentication & Authorization Schemas
 * Validation schemas for login, registration, and OAuth flows
 */

import { z } from 'zod';
import { emailSchema, phoneSchema, nonEmptyStringSchema, apiResponseSchema } from './common.schema';

// ============================================================================
// User Schema
// ============================================================================

export const userSchema = z.object({
  id: z.number().int().positive(),
  name: nonEmptyStringSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  profile_image: z.string().url().optional(),
  role: z.string().default('customer'),
  created_at: z.string(),
  preferences: z.object({
    notifications: z.boolean(),
    marketing: z.boolean(),
  }).optional(),
});

export type User = z.infer<typeof userSchema>;

// ============================================================================
// Login Schemas
// ============================================================================

/**
 * Phone OTP login request
 */
export const sendOtpRequestSchema = z.object({
  phone: phoneSchema,
  type: z.enum(['login', 'register']),
});

export const sendOtpResponseSchema = apiResponseSchema(
  z.object({
    status: z.boolean(),
    message: z.string(),
    verification_id: z.string(),
  })
);

/**
 * Verify OTP for login
 */
export const verifyOtpLoginRequestSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  verification_id: z.string(),
});

export const verifyOtpLoginResponseSchema = apiResponseSchema(
  z.object({
    user: userSchema,
    token: z.string(),
    expires_at: z.string(),
  })
);

/**
 * Verify OTP for registration
 */
export const verifyOtpRegisterRequestSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6),
  verification_id: z.string(),
  name: nonEmptyStringSchema.min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
});

export const verifyOtpRegisterResponseSchema = apiResponseSchema(
  z.object({
    user: userSchema,
    token: z.string(),
  })
);

// ============================================================================
// OAuth Schemas
// ============================================================================

/**
 * Google OAuth login
 */
export const googleLoginRequestSchema = z.object({
  token: z.string(),
});

export const googleLoginResponseSchema = apiResponseSchema(
  z.object({
    user: userSchema,
    token: z.string(),
    expires_at: z.string(),
  })
);

/**
 * Facebook OAuth login
 */
export const facebookLoginRequestSchema = z.object({
  token: z.string(),
});

export const facebookLoginResponseSchema = apiResponseSchema(
  z.object({
    user: userSchema,
    token: z.string(),
    expires_at: z.string(),
  })
);

/**
 * Register with Google
 */
export const registerGoogleRequestSchema = z.object({
  google_token: z.string(),
  name: nonEmptyStringSchema.min(2),
  email: emailSchema,
  phone: phoneSchema.optional(),
});

export const registerGoogleResponseSchema = apiResponseSchema(
  z.object({
    user: userSchema,
    token: z.string(),
  })
);

// ============================================================================
// Guest User Schema
// ============================================================================

export const createGuestRequestSchema = z.object({
  name: nonEmptyStringSchema.min(2),
  email: emailSchema,
  phone: phoneSchema,
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const createGuestResponseSchema = apiResponseSchema(
  z.object({
    guest_id: z.number().int().positive(),
    token: z.string(),
    user: userSchema,
  })
);

// ============================================================================
// User Existence Check
// ============================================================================

export const checkUserExistsRequestSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
});

export const checkUserExistsResponseSchema = apiResponseSchema(
  z.object({
    exists: z.boolean(),
    user_id: z.number().int().positive().optional(),
  })
);

// ============================================================================
// Token Refresh
// ============================================================================

export const refreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export const refreshTokenResponseSchema = apiResponseSchema(
  z.object({
    token: z.string(),
    expires_at: z.string(),
  })
);

// ============================================================================
// Logout
// ============================================================================

export const logoutResponseSchema = apiResponseSchema(
  z.object({
    message: z.string(),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type SendOtpRequest = z.infer<typeof sendOtpRequestSchema>;
export type VerifyOtpLoginRequest = z.infer<typeof verifyOtpLoginRequestSchema>;
export type VerifyOtpRegisterRequest = z.infer<typeof verifyOtpRegisterRequestSchema>;
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>;
export type FacebookLoginRequest = z.infer<typeof facebookLoginRequestSchema>;
export type RegisterGoogleRequest = z.infer<typeof registerGoogleRequestSchema>;
export type CreateGuestRequest = z.infer<typeof createGuestRequestSchema>;
export type CheckUserExistsRequest = z.infer<typeof checkUserExistsRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
