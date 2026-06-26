import * as XLSX from 'xlsx';
import { normalizeCell, type SeiImportRow, type SeiImportRowValidationError } from '../validation/sei-tasks.schemas.js';
import { normalizeDisplayText, normalizeEmailText, normalizeNumericText } from './xlsx-normalizers.js';

const headerAliases: Record<string, keyof SeiImportRow> = {
  setorsigla: 'sector',
  setor: 'sector',
  sigla: 'sector',
  lotacao: 'sector',
  unidade: 'sector',
  nome: 'name',
  nomecompleto: 'name',
  servidor: 'name',
  usuario: 'name',
  rglogin: 'rgLogin',
  rg: 'rgLogin',
  login: 'rgLogin',
  idfunc: 'functionalId',
  idfuncional: 'functionalId',
  funcional: 'functionalId',
  matricula: 'functionalId',
  cpf: 'cpf',
  cargo: 'role',
  funcao: 'role',
  emailpessoal: 'personalEmail',
  email: 'personalEmail',
  telefonepessoal: 'personalPhone',
  telefone: 'personalPhone',
  celularpessoal: 'personalPhone',
  celular: 'personalPhone',
  perfil: 'profile',
  perfildeacesso: 'profile',
};

const pickSheet = (workbook: XLSX.WorkBook) => workbook.Sheets['Cadastro'] ?? workbook.Sheets.View ?? workbook.Sheets[workbook.SheetNames[0]];

const isEmptyRow = (row: Record<string, unknown>) => Object.values(row).every((value) => normalizeCell(value) === '');

const normalizeHeader = (value: unknown) =>
  normalizeCell(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\s./()\-_]+/g, '');

const findHeaderRow = (sheet: XLSX.WorkSheet) => {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>[]>(sheet, { header: 1, defval: '', raw: false, blankrows: true });
  for (let i = 0; i < Math.min(rows.length, 10); i += 1) {
    const row = rows[i] ?? [];
    const recognized = row.reduce((count, cell) => (headerAliases[normalizeHeader(cell)] ? count + 1 : count), 0);
    if (recognized >= 3 || (recognized >= 2 && row.length >= 4)) {
      return i + 1;
    }
  }
  return 1;
};

export type ParsedSeiImportRow = {
  rowNumber: number;
  row: SeiImportRow;
  errors: SeiImportRowValidationError[];
};

export const parseSeiWorkbook = (buffer: Buffer): ParsedSeiImportRow[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = pickSheet(workbook);
  if (!sheet) return [];

  const headerRow = findHeaderRow(sheet);
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false, range: headerRow - 1 });
  return rawRows
    .map((raw: Record<string, unknown>, index: number) => {
      const normalized = Object.entries(raw).reduce<Record<string, string>>((acc, [key, value]) => {
        const target = headerAliases[normalizeHeader(key)];
        if (target) acc[target] = normalizeCell(value);
        return acc;
      }, {});
      const row: SeiImportRow = {
        sector: normalizeDisplayText(normalized.sector),
        name: normalizeDisplayText(normalized.name),
        rgLogin: normalizeNumericText(normalized.rgLogin),
        functionalId: normalized.functionalId || null,
        cpf: normalized.cpf ? normalizeNumericText(normalized.cpf) : null,
        role: normalized.role ? normalizeDisplayText(normalized.role) : null,
        personalEmail: normalized.personalEmail ? normalizeEmailText(normalized.personalEmail) : null,
        personalPhone: normalized.personalPhone ? normalizeNumericText(normalized.personalPhone) : null,
        profile: normalizeDisplayText(normalized.profile),
      };
      return { rowNumber: headerRow + index + 1, row };
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
