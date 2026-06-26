import * as XLSX from 'xlsx';
import { importAdUserRowSchema } from '../validation/ad-users.schemas.js';
import { normalizeCell } from '../validation/sei-tasks.schemas.js';
import { normalizeDisplayText, normalizeEmailText, normalizeNumericText } from './xlsx-normalizers.js';

type AdWorkbookRow = {
  sector: string;
  name: string;
  rgLogin: string;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string;
};

const headerAliases: Record<string, keyof AdWorkbookRow> = {
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

const pickSheet = (workbook: XLSX.WorkBook) => workbook.Sheets.Cadastro ?? workbook.Sheets.View ?? workbook.Sheets[workbook.SheetNames[0]];

const isEmptyRow = (row: Record<string, unknown>) => Object.values(row).every((value) => normalizeCell(value) === '');

export type ParsedAdImportRow = {
  rowNumber: number;
  row: AdWorkbookRow;
  errors: { rowNumber: number; message: string; fields: string[] }[];
};

export const parseAdWorkbook = (buffer: Buffer): ParsedAdImportRow[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = pickSheet(workbook);
  if (!sheet) return [];

  const headerRow = findHeaderRow(sheet);
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false, range: headerRow - 1 });
  return rawRows
    .map((raw, index) => {
      const normalized = Object.entries(raw).reduce<Record<string, string>>((acc, [key, value]) => {
        const target = headerAliases[normalizeHeader(key)];
        if (target) acc[target] = normalizeCell(value);
        return acc;
      }, {});

      return {
        rowNumber: headerRow + index + 1,
        row: {
          sector: normalizeDisplayText(normalized.sector),
          name: normalizeDisplayText(normalized.name),
          rgLogin: normalizeNumericText(normalized.rgLogin),
          functionalId: normalized.functionalId || null,
          cpf: normalized.cpf ? normalizeNumericText(normalized.cpf) : null,
          role: normalized.role ? normalizeDisplayText(normalized.role) : null,
          personalEmail: normalized.personalEmail ? normalizeEmailText(normalized.personalEmail) : null,
          personalPhone: normalized.personalPhone ? normalizeNumericText(normalized.personalPhone) : null,
          profile: normalizeDisplayText(normalized.profile),
        },
      };
    })
    .filter((entry) => !isEmptyRow(entry.row as unknown as Record<string, unknown>))
    .map((entry) => {
      const parsed = importAdUserRowSchema.safeParse(entry.row);
      const errors: ParsedAdImportRow['errors'] = parsed.success
        ? []
        : parsed.error.issues.map((issue) => ({
          rowNumber: entry.rowNumber,
          message: issue.message,
          fields: issue.path.length ? issue.path.map(String) : ['row'],
        }));
      return { ...entry, errors };
    });
};
