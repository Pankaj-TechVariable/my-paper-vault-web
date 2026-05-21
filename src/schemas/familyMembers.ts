import { z } from "zod";

export const InviteMemberSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email address",
    })
    .trim(),
  relation: z.string().trim().optional(),
});

export type InviteMemberFormData = z.infer<typeof InviteMemberSchema>;
