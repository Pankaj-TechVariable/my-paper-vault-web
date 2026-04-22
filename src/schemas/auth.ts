import { z } from "zod";

export const SigninSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email address",
    })
    .trim(),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Password is required" : "Password must be a string",
    })
    .trim()
    .min(2, { message: "Password must be at least 2 characters" }),
});

export type SigninFormData = z.infer<typeof SigninSchema>;
