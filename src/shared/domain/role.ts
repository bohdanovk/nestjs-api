/**
 * Roles are part of the shared kernel because every bounded context
 * authorises requests against them.
 */
export const Role = {
  Admin: 'admin',
  User: 'user',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: readonly Role[] = Object.values(Role);

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ALL_ROLES as readonly string[]).includes(value);
}
