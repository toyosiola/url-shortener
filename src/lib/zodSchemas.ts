import { z } from "zod";

// Validation schema for user signup data
export const signUpSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Maximum of 100 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .transform((val) => val.toLowerCase()), // transform email to lowercase
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    // ensures both passwords match
    message: "Passwords do not match",
    path: ["confirm_password"], // Show error on confirm_password field
  });

// Schema for validating login form data
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

// Validation schema for URL shortening
export const urlShortenSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Only HTTPS URLs are allowed",
    }),
});
