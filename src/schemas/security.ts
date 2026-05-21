import { z } from "zod";

export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(1, { message: "Current password is required" }),
    new_password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z.string().min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
