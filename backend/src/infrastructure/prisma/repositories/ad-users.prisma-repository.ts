import type { Prisma } from '@prisma/client';
import type {
  AdUserDto,
  AdUsersRepository,
} from '../../../application/ad-users/ad-users.repository.js';
import type { CreateAdUserInput, UpdateAdUserInput } from '../../../application/ad-users/ad-users.schemas.js';
import { prisma } from '../client.js';

const includeGroups = {
  groups: { include: { adGroup: true } },
} satisfies Prisma.AdUserInclude;

type AdUserWithGroups = Prisma.AdUserGetPayload<{ include: typeof includeGroups }>;

type AdUserAuditSnapshot = {
  rg: string;
  adId: string;
  name: string;
  isActive: boolean;
  groups: string[];
};

const toDto = (user: AdUserWithGroups): AdUserDto => ({
  id: user.id,
  adId: user.adId,
  rg: user.rg,
  name: user.name,
  isActive: user.isActive,
  memberOf: user.groups.map((group) => group.adGroup.name),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const snapshotAdUser = (user: AdUserWithGroups): AdUserAuditSnapshot => ({
  rg: user.rg,
  adId: user.adId,
  name: user.name,
  isActive: user.isActive,
  groups: user.groups.map((group) => group.adGroup.name),
});

const buildAuditMetadata = (before: AdUserAuditSnapshot | null, after: AdUserAuditSnapshot) => ({
  ...(before ? { before } : {}),
  after,
});

const upsertGroups = (tx: Prisma.TransactionClient, names: string[]) =>
  Promise.all(
    names.map((name) =>
      tx.adGroup.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

export const adUsersRepository: AdUsersRepository = {
  list: async () => {
    const users = await prisma.adUser.findMany({ include: includeGroups, orderBy: { createdAt: 'desc' } });
    return users.map(toDto);
  },

  findById: async (id) => {
    const user = await prisma.adUser.findUnique({ where: { id }, include: includeGroups });
    return user ? toDto(user) : null;
  },

  create: (actorUserId, data) => createAdUserWithPrisma(actorUserId, data),

  update: (actorUserId, id, data) => updateAdUserWithPrisma(actorUserId, id, data),

  deactivate: (actorUserId, id) => deactivateAdUserWithPrisma(actorUserId, id),
};

const createAdUserWithPrisma = async (actorUserId: string, data: CreateAdUserInput) =>
  prisma.$transaction(async (tx) => {
    const isActive = data.isActive ?? true;
    const groups = await upsertGroups(tx, data.memberOf);

    const created = await tx.adUser.create({
      data: {
        rg: data.rg,
        name: data.name,
        adId: data.adId,
        isActive,
      },
    });

    await tx.adUserGroup.createMany({
      data: groups.map((group) => ({ adUserId: created.id, adGroupId: group.id })),
    });

    await tx.auditLog.create({
      data: {
        actorUserId,
        adUserId: created.id,
        action: 'AD_USER_CREATED',
        entityType: 'AdUser',
        entityId: created.id,
        metadata: buildAuditMetadata(null, {
          rg: data.rg,
          adId: data.adId,
          name: data.name,
          isActive,
          groups: data.memberOf,
        }),
      },
    });

    const user = await tx.adUser.findUniqueOrThrow({ where: { id: created.id }, include: includeGroups });
    return toDto(user);
  });

const updateAdUserWithPrisma = async (actorUserId: string, id: string, data: UpdateAdUserInput) =>
  prisma.$transaction(async (tx) => {
    const current = await tx.adUser.findUniqueOrThrow({ where: { id }, include: includeGroups });
    const before = snapshotAdUser(current);
    const groups = data.memberOf ? await upsertGroups(tx, data.memberOf) : current.groups.map((group) => group.adGroup);

    const updated = await tx.adUser.update({
      where: { id: current.id },
      data: {
        rg: data.rg,
        name: data.name,
        adId: data.adId,
        isActive: data.isActive,
      },
    });

    if (data.memberOf) {
      await tx.adUserGroup.deleteMany({ where: { adUserId: current.id } });
      await tx.adUserGroup.createMany({
        data: groups.map((group) => ({ adUserId: current.id, adGroupId: group.id })),
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId,
        adUserId: updated.id,
        action: 'AD_USER_UPDATED',
        entityType: 'AdUser',
        entityId: updated.id,
        metadata: buildAuditMetadata(before, {
          rg: updated.rg,
          adId: updated.adId,
          name: updated.name,
          isActive: updated.isActive,
          groups: data.memberOf ?? before.groups,
        }),
      },
    });

    const user = await tx.adUser.findUniqueOrThrow({ where: { id: updated.id }, include: includeGroups });
    return toDto(user);
  });

const deactivateAdUserWithPrisma = async (actorUserId: string, id: string) =>
  prisma.$transaction(async (tx) => {
    const current = await tx.adUser.findUniqueOrThrow({ where: { id }, include: includeGroups });
    const before = snapshotAdUser(current);

    const updated = await tx.adUser.update({
      where: { id: current.id },
      data: { isActive: false },
      include: includeGroups,
    });

    await tx.auditLog.create({
      data: {
        actorUserId,
        adUserId: updated.id,
        action: 'AD_USER_DEACTIVATED',
        entityType: 'AdUser',
        entityId: updated.id,
        metadata: buildAuditMetadata(before, snapshotAdUser(updated)),
      },
    });

    return toDto(updated);
  });
