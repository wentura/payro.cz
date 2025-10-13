/**
 * Form Validation Schemas
 *
 * Zod schemas for form validation with Czech localization
 */

import { z } from "zod";
import { validateICO } from "./utils";

/**
 * User registration schema
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
    contact_email: z.string().email("Neplatná emailová adresa"),
    password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
    password_confirm: z.string(),
    company_id: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Hesla se neshodují",
    path: ["password_confirm"],
  });

/**
 * Login schema
 */
export const loginSchema = z.object({
  contact_email: z.string().email("Neplatná emailová adresa"),
  password: z.string().min(1, "Zadejte heslo"),
});

/**
 * Client schema
 */
export const clientSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  company_id: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      house_number: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().default("Česká republika"),
    })
    .optional(),
  contact_email: z
    .string()
    .email("Neplatná emailová adresa")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().optional(),
  note: z.string().optional(),
});

/**
 * Invoice schema
 */
export const invoiceSchema = z.object({
  client_id: z.string().uuid("Vyberte klienta"),
  issue_date: z.string().min(1, "Datum vystavení je povinné"),
  due_term_id: z.number().or(z.string()).optional(),
  payment_type_id: z.number().or(z.string()).optional(),
  currency: z.enum(["CZK", "EUR"]).default("CZK"),
  note: z.string().optional(),
});

/**
 * Invoice item schema
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Popis je povinný"),
  quantity: z
    .number()
    .positive("Množství musí být větší než 0")
    .or(
      z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message: "Množství musí být větší než 0",
        })
    ),
  unit_id: z.number().or(z.string()).optional(),
  unit_price: z
    .number()
    .min(0, "Cena nesmí být záporná")
    .or(
      z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
          message: "Cena nesmí být záporná",
        })
    ),
});

/**
 * User settings schema
 */
export const userSettingsSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  company_id: z.string().optional(),
  billing_details: z
    .object({
      street: z.string().optional(),
      house_number: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().default("Česká republika"),
    })
    .optional(),
  contact_website: z.string().url("Neplatná URL").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Neplatná emailová adresa"),
  default_settings: z
    .object({
      currency_id: z.enum(["CZK", "EUR"]).default("CZK"),
      language_id: z.enum(["cs", "en"]).default("cs"),
      due_term_id: z.number().optional(),
      payment_type_id: z.number().optional(),
      footer_text: z.string().optional(),
      invoice_text: z.string().optional(),
    })
    .optional(),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  contact_email: z.string().email("Neplatná emailová adresa"),
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Token je povinný"),
    password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Hesla se neshodují",
    path: ["password_confirm"],
  });
