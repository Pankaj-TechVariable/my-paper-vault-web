import { z } from "zod";

export const GenerateLinkSchema = z
  .object({
    directory_id: z.string().min(1, { message: "Please select a directory" }),
    expires_at: z.string().min(1, { message: "Please select an expiry date" }),
    max_file_count: z.number().min(1).max(5),
    max_file_size_mb: z.number().min(1).max(10),
    pin_enabled: z.boolean(),
    pin: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.pin_enabled ||
      (!!data.pin && /^\d{6}$/.test(data.pin)),
    { message: "PIN must be exactly 6 digits", path: ["pin"] },
  );

export type GenerateLinkFormData = z.infer<typeof GenerateLinkSchema>;
