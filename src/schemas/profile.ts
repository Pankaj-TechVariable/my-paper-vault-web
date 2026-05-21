import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).trim(),
  phone_number: z.string().trim().nullable().optional(),
  gender: z.string().trim().nullable().optional(),
  age: z
    .number()
    .int()
    .min(1, { message: "Age must be at least 1" })
    .max(120, { message: "Age must be at most 120" })
    .nullable()
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;
