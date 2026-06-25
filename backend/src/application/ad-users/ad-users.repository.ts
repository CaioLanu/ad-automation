import type { CreateAdUserInput, UpdateAdUserInput } from './ad-users.schemas.js';

export type AdUserDto = {
  id: string;
  adId: string;
  rg: string;
  name: string;
  isActive: boolean;
  memberOf: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActorContext = {
  id: string;
  permission: string;
};

export type AdUsersRepository = {
  list(): Promise<AdUserDto[]>;
  findById(id: string): Promise<AdUserDto | null>;
  create(actorUserId: string, data: CreateAdUserInput): Promise<AdUserDto>;
  update(actorUserId: string, id: string, data: UpdateAdUserInput): Promise<AdUserDto>;
  deactivate(actorUserId: string, id: string): Promise<AdUserDto>;
};
