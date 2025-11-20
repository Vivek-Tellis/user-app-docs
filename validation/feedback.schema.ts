/**
 * Feedback & Reviews Schemas
 * Validation schemas for customer feedback and review system
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  ratingSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Review Schema
// ============================================================================

export const reviewSchema = z.object({
  id: idSchema,
  customer_name: nonEmptyStringSchema,
  rating: ratingSchema,
  review: z.string().optional(),
  date: z.string(),
  images: z.array(z.string().url()).optional(),
});

// ============================================================================
// Get Reviews
// ============================================================================

export const getReviewsRequestSchema = z.object({
  source_id: idSchema,
  type: z.enum(['staff', 'salon', 'service']),
});

export const reviewsDataSchema = z.object({
  average_rating: z.number().min(0).max(5),
  total_reviews: z.number().int().nonnegative(),
  rating_distribution: z.object({
    5: z.number().int().nonnegative(),
    4: z.number().int().nonnegative(),
    3: z.number().int().nonnegative(),
    2: z.number().int().nonnegative(),
    1: z.number().int().nonnegative(),
  }),
  reviews: z.array(reviewSchema),
});

export const getReviewsResponseSchema = apiResponseSchema(reviewsDataSchema);

// ============================================================================
// Get Review Details (Filtered by Rating)
// ============================================================================

export const getReviewDetailsRequestSchema = z.object({
  source_id: idSchema,
  type: z.enum(['staff', 'salon', 'service']),
  rating: ratingSchema,
});

export const getReviewDetailsResponseSchema = apiResponseSchema(
  z.object({
    filtered_reviews: z.array(reviewSchema),
    total_filtered: z.number().int().nonnegative(),
  })
);

// ============================================================================
// Check Feedback Status
// ============================================================================

export const checkFeedbackStatusResponseSchema = apiResponseSchema(
  z.object({
    can_give_feedback: z.boolean(),
    appointment_id: idSchema.optional(),
  })
);

// ============================================================================
// Create Feedback
// ============================================================================

export const createFeedbackRequestSchema = z.object({
  appointment_id: idSchema,
  overall_rating: ratingSchema,
  service_rating: ratingSchema,
  staff_rating: ratingSchema,
  cleanliness_rating: ratingSchema,
  comment: z.string().max(1000).optional(),
  images: z.array(z.instanceof(File)).optional(),
  would_recommend: z.boolean(),
});

export const createFeedbackResponseSchema = apiResponseSchema(
  z.object({
    feedback_id: idSchema,
    message: nonEmptyStringSchema,
  })
);

// ============================================================================
// Staff Feedback
// ============================================================================

export const createStaffFeedbackRequestSchema = z.object({
  staff_id: idSchema,
  customer_id: idSchema,
  rating: ratingSchema,
  review: z.string().max(1000).optional(),
  images: z.array(z.instanceof(File)).optional(),
});

export const createStaffFeedbackResponseSchema = apiResponseSchema(
  z.object({
    feedback_id: idSchema,
    message: nonEmptyStringSchema,
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type Review = z.infer<typeof reviewSchema>;
export type ReviewsData = z.infer<typeof reviewsDataSchema>;
export type GetReviewsRequest = z.infer<typeof getReviewsRequestSchema>;
export type GetReviewDetailsRequest = z.infer<typeof getReviewDetailsRequestSchema>;
export type CreateFeedbackRequest = z.infer<typeof createFeedbackRequestSchema>;
export type CreateStaffFeedbackRequest = z.infer<typeof createStaffFeedbackRequestSchema>;
