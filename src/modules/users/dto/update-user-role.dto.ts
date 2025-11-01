import { z } from 'zod';

export class UpdateUserRoleDto {
  role: string;
}

export const updateUserRoleSchema = z.object({
  role: z
    .string()
    .min(1, 'Role không được để trống')
    .refine(
      (role) => ['Admin', 'User', 'Shop'].includes(role),
      'Role phải là Admin, User hoặc Shop',
    ),
});
