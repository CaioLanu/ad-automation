import * as XLSX from 'xlsx';
import { normalizeCell, type SeiImportRow, type SeiImportRowValidationError } from './schemas.js';

const headerAliases: Record<string, keyof SeiImportRow> = {
  'setor/sigla': 'sector',
  setor: 'sector',
  nome: 'name',
  'rg/login': 'rgLogin',
  'rg login': 'rgLogin',
  'id func.': 'functionalId',
  'id func': 'functionalId',
  cpf: 'cpf',
  cargo: 'role',
  'e-mail (pessoal)': 'personalEmail',
  'email (pessoal)': 'personalEmail',
  'celular (pessoal)': 'personalPhone',
  perfil: 'profile',
};

const pickSheet = (workbook: XLSX.WorkBook) => workbook.Sheets['Cadastro'] ?? workbook.Sheets.View ?? workbook.Sheets[workbook.SheetNames[0]];

const isEmptyRow = (row: Record<string, unknown>) => Object.values(row).every((value) => normalizeCell(value) === '');

export type ParsedSeiImportRow = {
  rowNumber: number;
  row: SeiImportRow;
  errors: SeiImportRowValidationError[];
};

export const parseSeiWorkbook = (buffer: Buffer): ParsedSeiImportRow[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = pickSheet(workbook);
  if (!sheet) return [];

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return rawRows
    .map((raw: Record<string, unknown>, index: number) => {
      const normalized = Object.entries(raw).reduce<Record<string, string>>((acc, [key, value]) => {
        const target = headerAliases[key.trim().toLowerCase()];
        if (target) acc[target] = normalizeCell(value);
        return acc;
      }, {});
      const row: SeiImportRow = {
        sector: normalized.sector ?? '',
        name: normalized.name ?? '',
        rgLogin: normalized.rgLogin ?? '',
        functionalId: normalized.functionalId || null,
        cpf: normalized.cpf || null,
        role: normalized.role || null,
        personalEmail: normalized.personalEmail || null,
        personalPhone: normalized.personalPhone || null,
        profile: normalized.profile ?? '',
      };
      return { rowNumber: index + 2, row };
    })
    .filter((entry: { row: SeiImportRow }) => !isEmptyRow(entry.row as unknown as Record<string, unknown>))
    .map((entry: { row: SeiImportRow; rowNumber: number }): ParsedSeiImportRow => {
      const { row, rowNumber } = entry;
      const errors: SeiImportRowValidationError[] = [];
      if (!row.sector) errors.push({ rowNumber, message: 'sector is required', fields: ['sector'] });
      if (!row.name) errors.push({ rowNumber, message: 'name is required', fields: ['name'] });
      if (!row.rgLogin) errors.push({ rowNumber, message: 'rgLogin is required', fields: ['rgLogin'] });
      if (!row.profile) errors.push({ rowNumber, message: 'profile is required', fields: ['profile'] });
      return { row, rowNumber, errors };
    });
};
