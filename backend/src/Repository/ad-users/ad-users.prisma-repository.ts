import type { Prisma } from '@prisma/client';
import type {
  AdUserDto,
  AdUserImportSummary,
  AdUsersRepository,
} from './ad-users.repository.js';
import type { ParsedAdImportRow } from '../../utils/parsers/ad-users-xlsx-parser.js';
import type { CreateAdUserInput, UpdateAdUserInput } from '../../utils/validation/ad-users.schemas.js';
import { prisma } from '../prisma-client.js';

const includeGroups = {
  groups: { include: { adGroup: true } },
} satisfies Prisma.AdUserInclude;

type AdUserWithGroups = Prisma.AdUserGetPayload<{ include: typeof includeGroups }>;

type AdUserRecord = {
  id: string;
  adId: string;
  rg: string;
  name: string;
  sector: string | null;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  groups: { adGroup: { name: string } }[];
};

type AdUserAuditSnapshot = {
  rg: string;
  adId: string;
  name: string;
  sector: string | null;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string | null;
  isActive: boolean;
  groups: string[];
};

const toDto = (user: AdUserWithGroups): AdUserDto => ({
  id: user.id,
  adId: user.adId,
  rg: user.rg,
  rgLogin: user.rg,
  name: user.name,
  isActive: user.isActive,
  sector: (user as any).sector ?? null,
  functionalId: (user as any).functionalId ?? null,
  cpf: (user as any).cpf ?? null,
  role: (user as any).role ?? null,
  personalEmail: (user as any).personalEmail ?? null,
  personalPhone: (user as any).personalPhone ?? null,
  profile: (user as any).profile ?? null,
  memberOf: user.groups.map((group) => group.adGroup.name),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const snapshotAdUser = (user: AdUserWithGroups): AdUserAuditSnapshot => ({
  rg: user.rg,
  adId: user.adId,
  name: user.name,
  sector: (user as any).sector ?? null,
  functionalId: (user as any).functionalId ?? null,
  cpf: (user as any).cpf ?? null,
  role: (user as any).role ?? null,
  personalEmail: (user as any).personalEmail ?? null,
  personalPhone: (user as any).personalPhone ?? null,
  profile: (user as any).profile ?? null,
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

  importUsers: (actorUserId, fileName, batchId, rows) => importAdUsersWithPrisma(actorUserId, fileName, batchId, rows),
};

const toGroups = (profile: string, memberOf?: string[]) => [...new Set(memberOf?.length ? memberOf : [profile])];
const toNullable = (value: string | null | undefined) => value?.trim() || null;

const snapshotAdUserRecord = (user: AdUserRecord) => ({
  rg: user.rg,
  adId: user.adId,
  name: user.name,
  sector: user.sector,
  functionalId: user.functionalId,
  cpf: user.cpf,
  role: user.role,
  personalEmail: user.personalEmail,
  personalPhone: user.personalPhone,
  profile: user.profile,
  isActive: user.isActive,
  groups: user.groups.map((group) => group.adGroup.name),
});

const createAdUserWithPrisma = async (actorUserId: string, data: CreateAdUserInput) =>
  prisma.$transaction(async (tx) => {
    const isActive = data.isActive ?? true;
    const rg = (data.rg ?? data.rgLogin ?? data.adId)!;
    const adId = (data.adId ?? data.rgLogin ?? data.rg)!;
    const profile = data.profile ?? data.memberOf?.[0] ?? data.name;
    const memberOf = toGroups(profile, data.memberOf);
    const groups = await upsertGroups(tx, memberOf);

    const created = await (tx.adUser as any).create({
      data: {
        rg,
        name: data.name,
        adId,
        sector: toNullable(data.sector),
        functionalId: toNullable(data.functionalId),
        cpf: toNullable(data.cpf),
        role: toNullable(data.role),
        personalEmail: toNullable(data.personalEmail),
        personalPhone: toNullable(data.personalPhone),
        profile,
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
          rg,
          adId,
          name: data.name,
          sector: toNullable(data.sector),
          functionalId: toNullable(data.functionalId),
          cpf: toNullable(data.cpf),
          role: toNullable(data.role),
          personalEmail: toNullable(data.personalEmail),
          personalPhone: toNullable(data.personalPhone),
          profile,
          isActive,
          groups: memberOf,
        }),
      },
    });

    const user = await tx.adUser.findUniqueOrThrow({ where: { id: created.id }, include: includeGroups });
    return toDto(user);
  });

const importAdUsersWithPrisma = async (actorUserId: string, fileName: string, batchId: string, rows: ParsedAdImportRow[]): Promise<AdUserImportSummary> =>
  prisma.$transaction(async (tx) => {
    const users: AdUserDto[] = [];
    const seenRgLogins = new Set<string>();
    const parsedRows = rows.map((entry) => {
      const errors = [...entry.errors];
      if (errors.length === 0) {
        if (seenRgLogins.has(entry.row.rgLogin)) {
          errors.push({ rowNumber: entry.rowNumber, message: 'Rg/Login duplicado no arquivo.', fields: ['rgLogin'] });
        } else {
          seenRgLogins.add(entry.row.rgLogin);
        }
      }
      return { ...entry, errors };
    });
    const errors: AdUserImportSummary['errors'] = parsedRows.flatMap((entry) => entry.errors);
    const validRows = parsedRows.filter((entry) => entry.errors.length === 0);

    for (const entry of validRows) {
      const row = entry.row;

      const rg = row.rgLogin;
      const adId = row.rgLogin;
      const memberOf = toGroups(row.profile);
      const groups = await upsertGroups(tx, memberOf);
      const existing = await tx.adUser.findUnique({ where: { rg }, include: includeGroups });
      const existingByAdId = await tx.adUser.findUnique({ where: { adId }, include: includeGroups });
      if (existingByAdId && existingByAdId.rg !== rg) {
        errors.push({ rowNumber: entry.rowNumber, message: 'Rg/Login conflita com um Identificador AD já existente.', fields: ['rgLogin'] });
        continue;
      }
      const before = existing ? snapshotAdUser(existing) : null;

      const saved = existing
        ? await (tx.adUser as any).update({ where: { id: existing.id }, data: { rg, adId, name: row.name, isActive: true, sector: row.sector, functionalId: row.functionalId, cpf: row.cpf, role: row.role, personalEmail: row.personalEmail, personalPhone: row.personalPhone, profile: row.profile } })
        : await (tx.adUser as any).create({ data: { rg, adId, name: row.name, isActive: true, sector: row.sector, functionalId: row.functionalId, cpf: row.cpf, role: row.role, personalEmail: row.personalEmail, personalPhone: row.personalPhone, profile: row.profile } });

      await tx.adUserGroup.deleteMany({ where: { adUserId: saved.id } });
      await tx.adUserGroup.createMany({ data: groups.map((group) => ({ adUserId: saved.id, adGroupId: group.id })) });
      const reloaded = await tx.adUser.findUniqueOrThrow({ where: { id: saved.id }, include: includeGroups });
      users.push(toDto(reloaded));
      await tx.auditLog.create({ data: { actorUserId, adUserId: saved.id, action: existing ? 'AD_USER_UPDATED' : 'AD_USER_CREATED', entityType: 'AdUser', entityId: saved.id, metadata: { batchId, fileName, ...(before ? { before } : {}), after: snapshotAdUserRecord(reloaded as unknown as AdUserRecord) } } });
    }

    return { batchId, fileName, totalRows: rows.length, importedRows: users.length, invalidRows: new Set(errors.map((error) => error.rowNumber)).size, users, errors };
  });

const updateAdUserWithPrisma = async (actorUserId: string, id: string, data: UpdateAdUserInput) =>
  prisma.$transaction(async (tx) => {
    const current = await tx.adUser.findUniqueOrThrow({ where: { id }, include: includeGroups });
    const before = snapshotAdUser(current);
    const derivedMemberOf = data.memberOf ?? (data.profile ? [data.profile] : undefined);
    const groups = derivedMemberOf ? await upsertGroups(tx, derivedMemberOf) : current.groups.map((group) => group.adGroup);
    const nextRg = data.rg ?? data.rgLogin ?? undefined;
    const nextAdId = data.adId ?? undefined;

    const updated = await (tx.adUser as any).update({
      where: { id: current.id },
      data: {
        rg: nextRg,
        name: data.name,
        adId: nextAdId,
        sector: data.sector === undefined ? undefined : toNullable(data.sector),
        functionalId: data.functionalId === undefined ? undefined : toNullable(data.functionalId),
        cpf: data.cpf === undefined ? undefined : toNullable(data.cpf),
        role: data.role === undefined ? undefined : toNullable(data.role),
        personalEmail: data.personalEmail === undefined ? undefined : toNullable(data.personalEmail),
        personalPhone: data.personalPhone === undefined ? undefined : toNullable(data.personalPhone),
        profile: data.profile,
        isActive: data.isActive,
      },
    });

    if (derivedMemberOf) {
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
          sector: updated.sector ?? null,
          functionalId: updated.functionalId ?? null,
          cpf: updated.cpf ?? null,
          role: updated.role ?? null,
          personalEmail: updated.personalEmail ?? null,
          personalPhone: updated.personalPhone ?? null,
          profile: updated.profile ?? null,
          isActive: updated.isActive,
          groups: derivedMemberOf ?? before.groups,
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
