import { z } from 'zod';

export const reviewApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejection_reason: z.string().optional(),
});
