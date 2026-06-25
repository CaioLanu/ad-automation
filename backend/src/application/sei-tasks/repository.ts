import type { CreateSeiTaskInput, ListSeiTasksQuery, UpdateSeiTaskInput } from './schemas.js';
import type { ParsedSeiImportRow } from './xlsx-parser.js';

export type SeiTaskAction = 'CREATE' | 'UPDATE';
export type SeiTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'INVALID';

export type SeiTaskDto = {
  id: string;
  batchId: string | null;
  sector: string;
  name: string;
  rgLogin: string;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string;
  action: SeiTaskAction;
  status: SeiTaskStatus;
  validationErrors: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export type SeiImportBatchDto = {
  id: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  invalidRows: number;
  actorUserId: string | null;
  createdAt: string;
};

export type SeiImportSummary = {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  invalidRows: number;
  tasks: SeiTaskDto[];
};

export type SeiTasksRepository = {
  list: (filters: ListSeiTasksQuery) => Promise<SeiTaskDto[]>;
  create: (actorUserId: string, data: CreateSeiTaskInput) => Promise<SeiTaskDto>;
  update: (actorUserId: string, id: string, data: UpdateSeiTaskInput) => Promise<SeiTaskDto>;
  importFromRows: (actorUserId: string, fileName: string, rows: ParsedSeiImportRow[]) => Promise<SeiImportSummary>;
};
