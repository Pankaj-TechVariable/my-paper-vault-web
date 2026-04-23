import { z } from "zod";

export const RenameDocumentSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(255, { message: "Name is too long" }),
});

export type RenameDocumentFormData = z.infer<typeof RenameDocumentSchema>;
