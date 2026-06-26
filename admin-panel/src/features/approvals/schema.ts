import { z } from 'zod';

export const reviewApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejection_reason: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'REJECTED' && (!data.rejection_reason || data.rejection_reason.length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rejection reason must be at least 5 characters long',
      path: ['rejection_reason'],
    });
  }
});

export type ReviewApprovalFormData = z.infer<typeof reviewApprovalSchema>;
