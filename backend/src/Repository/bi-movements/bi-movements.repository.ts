export type BiMovementKind = 'EXONERACAO' | 'NOMEACAO';

export type BiMovementDto = {
  id: string;
  date: string;
  kind: BiMovementKind;
  name: string;
  functionalId: string;
  sector: string;
  role: string;
  symbol: string;
  sourceFile: string;
  createdAt: string;
  updatedAt: string;
};

export type BiMovementUpsertInput = {
  date: string;
  kind: BiMovementKind;
  name: string;
  functionalId: string;
  sector: string;
  role: string;
  symbol: string;
  sourceFile: string;
};

export type BiMovementFilters = {
  startDate?: string;
  endDate?: string;
  kind?: BiMovementKind | '';
};

export type BiMovementsRepository = {
  list: (filters: BiMovementFilters) => Promise<BiMovementDto[]>;
  upsert: (actorUserId: string, input: BiMovementUpsertInput) => Promise<BiMovementDto>;
  upsertMany: (actorUserId: string, inputs: BiMovementUpsertInput[]) => Promise<BiMovementDto[]>;
  remove: (actorUserId: string, id: string) => Promise<void>;
};
