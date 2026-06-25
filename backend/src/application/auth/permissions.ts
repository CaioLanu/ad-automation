export const LOGIN_PERMISSIONS = ['ADMINISTRATORS', 'DESENVOLVIMENTO'] as const;

export type LoginPermission = (typeof LOGIN_PERMISSIONS)[number];

export const hasLoginPermission = (permission: string): permission is LoginPermission =>
  LOGIN_PERMISSIONS.includes(permission as LoginPermission);
