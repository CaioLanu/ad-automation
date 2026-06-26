export type AuthenticatedUser = {
  id: string;
  rg: string;
  name: string;
  permission: string;
  isActive: boolean;
};

export type ActorContext = Pick<AuthenticatedUser, 'id' | 'permission'>;
