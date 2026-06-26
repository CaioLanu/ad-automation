import type { ParsedAdImportRow } from '../../utils/parsers/ad-users-xlsx-parser.js';
import type { CreateAdUserInput, UpdateAdUserInput } from '../../utils/validation/ad-users.schemas.js';

export type AdUserDto = {
  id: string;
  adId: string;
  rg: string;
  rgLogin: string;
  name: string;
  isActive: boolean;
  sector: string | null;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string | null;
  memberOf: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdUserImportError = { rowNumber: number; message: string; fields: string[] };

export type AdUserImportSummary = {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  invalidRows: number;
  users: AdUserDto[];
  errors: AdUserImportError[];
};

export type AdUsersRepository = {
  list(): Promise<AdUserDto[]>;
  findById(id: string): Promise<AdUserDto | null>;
  create(actorUserId: string, data: CreateAdUserInput): Promise<AdUserDto>;
  update(actorUserId: string, id: string, data: UpdateAdUserInput): Promise<AdUserDto>;
  deactivate(actorUserId: string, id: string): Promise<AdUserDto>;
  importUsers(actorUserId: string, fileName: string, batchId: string, rows: ParsedAdImportRow[]): Promise<AdUserImportSummary>;
};
