/**
 * Appointments Schemas
 * Validation schemas for viewing, managing, and modifying appointments
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  dateStringSchema,
  timeStringSchema,
  moneyAmountSchema,
  apiResponseSchema,
  paginatedResponseSchema,
} from './common.schema';
import { serviceAddonSchema } from './services.schema';

// ============================================================================
// Appointment Status
// ============================================================================

export const appointmentStatusEnum = z.enum(['upcoming', 'completed', 'cancelled']);

// ============================================================================
// Appointment Service Item
// ============================================================================

export const appointmentServiceSchema = z.object({
  service_id: idSchema,
  service_name: nonEmptyStringSchema,
  staff_id: idSchema,
  staff_name: nonEmptyStringSchema,
  staff_image: z.string().url().optional(),
  duration: z.number().int().positive(),
  price: moneyAmountSchema,
  addons: z.array(serviceAddonSchema).optional(),
});

// ============================================================================
// Appointment Schema
// ============================================================================

export const appointmentSchema = z.object({
  id: idSchema,
  appointment_number: nonEmptyStringSchema,
  date: dateStringSchema,
  start_time: timeStringSchema,
  end_time: timeStringSchema.optional(),
  status: appointmentStatusEnum,
  amount: moneyAmountSchema,
  services: z.array(appointmentServiceSchema),
  customer: z
    .object({
      name: nonEmptyStringSchema,
      email: z.string().email(),
      phone: z.string(),
    })
    .optional(),
  location: z
    .object({
      id: idSchema,
      name: nonEmptyStringSchema,
      address: nonEmptyStringSchema,
    })
    .optional(),
  payment: z
    .object({
      type: z.string(),
      status: z.string(),
      transaction_id: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// Get Appointments
// ============================================================================

export const getAppointmentsRequestSchema = z.object({
  status: appointmentStatusEnum,
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

export const getAppointmentsResponseSchema = paginatedResponseSchema(appointmentSchema);

// ============================================================================
// Get Appointment Detail
// ============================================================================

export const getAppointmentDetailResponseSchema = apiResponseSchema(appointmentSchema);

// ============================================================================
// Cancel Appointment
// ============================================================================

export const cancelAppointmentRequestSchema = z.object({
  appointment_id: idSchema,
  reason: z.string().optional(),
});

export const cancelAppointmentResponseSchema = apiResponseSchema(
  z.object({
    appointment_id: idSchema,
    status: z.literal('cancelled'),
    refund_amount: moneyAmountSchema.optional(),
    refund_processed: z.boolean(),
    message: z.string(),
  })
);

// ============================================================================
// Reschedule Appointment
// ============================================================================

export const rescheduleAppointmentRequestSchema = z.object({
  appointment_id: idSchema,
  new_date: dateStringSchema,
  new_time: timeStringSchema,
  reason: z.string().optional(),
});

export const rescheduleAppointmentResponseSchema = apiResponseSchema(
  z.object({
    appointment_id: idSchema,
    new_date: dateStringSchema,
    new_time: timeStringSchema,
    status: z.literal('rescheduled'),
    message: z.string(),
  })
);

// ============================================================================
// Invoice Schema
// ============================================================================

export const invoiceItemSchema = z.object({
  description: nonEmptyStringSchema,
  quantity: z.number().int().positive(),
  price: moneyAmountSchema,
  total: moneyAmountSchema,
});

export const invoiceSchema = z.object({
  invoice_number: nonEmptyStringSchema,
  date: dateStringSchema,
  customer: z.object({
    name: nonEmptyStringSchema,
    email: z.string().email(),
    phone: z.string(),
  }),
  items: z.array(invoiceItemSchema),
  subtotal: moneyAmountSchema,
  tax: moneyAmountSchema,
  discount: moneyAmountSchema.optional(),
  total: moneyAmountSchema,
  payment_method: z.string(),
  status: z.enum(['paid', 'pending', 'failed']),
});

export const getInvoiceRequestSchema = z.object({
  sales_id: idSchema,
});

export const getInvoiceResponseSchema = apiResponseSchema(invoiceSchema);

// ============================================================================
// Type Exports
// ============================================================================

export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;
export type AppointmentService = z.infer<typeof appointmentServiceSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type GetAppointmentsRequest = z.infer<typeof getAppointmentsRequestSchema>;
export type CancelAppointmentRequest = z.infer<typeof cancelAppointmentRequestSchema>;
export type RescheduleAppointmentRequest = z.infer<typeof rescheduleAppointmentRequestSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type GetInvoiceRequest = z.infer<typeof getInvoiceRequestSchema>;
