type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
};

export type SeiTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'INVALID';
export type SeiTaskAction = 'CREATE' | 'UPDATE';

export type SeiTask = {
  id: string;
  batchId?: string | null;
  sector: string;
  name: string;
  rgLogin: string;
  functionalId?: string | null;
  cpf?: string | null;
  role?: string | null;
  personalEmail?: string | null;
  personalPhone?: string | null;
  profile: string;
  action: SeiTaskAction;
  status: SeiTaskStatus;
  validationErrors?: unknown[] | null;
  createdAt: string;
  updatedAt: string;
};

export type SeiTaskUpsertInput = {
  sector: string;
  name: string;
  rgLogin: string;
  functionalId?: string | null;
  cpf?: string | null;
  role?: string | null;
  personalEmail?: string | null;
  personalPhone?: string | null;
  profile: string;
  action: SeiTaskAction;
  status: SeiTaskStatus;
  validationErrors?: unknown[] | null;
};

export type SeiTaskImportSummary = {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  invalidRows: number;
  tasks: SeiTask[];
};

export type SeiTaskAdCheckResult = {
  exists: boolean;
  matchedBy: 'rgLogin' | 'adId' | 'cpf' | null;
  checkedAt: string;
  message: string;
  user: AdUser | null;
};

export type SeiTaskFilters = {
  search?: string;
  status?: SeiTaskStatus | '';
  action?: SeiTaskAction | '';
  sector?: string;
  profile?: string;
};

export type AdUser = {
  id: string;
  adId: string;
  rg: string;
  rgLogin: string;
  name: string;
  sector: string | null;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string | null;
  isActive: boolean;
  memberOf: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdUserCreateInput = {
  sector?: string | null;
  name: string;
  rg?: string | null;
  rgLogin?: string | null;
  functionalId?: string | null;
  cpf?: string | null;
  role?: string | null;
  personalEmail?: string | null;
  personalPhone?: string | null;
  profile?: string;
  isActive?: boolean;
  adId?: string | null;
  memberOf?: string[];
};

export type AdUserUpdateInput = Partial<AdUserCreateInput>;
export type CreateAdUserInput = AdUserCreateInput;
export type UpdateAdUserInput = AdUserUpdateInput;

export type AdUserImportSummary = {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  invalidRows: number;
  users: AdUser[];
  errors: Array<{ rowNumber: number; message: string; fields: string[] }>;
};

export type ReportDomain = 'ALL' | 'AD' | 'SEI';
export type ReportGranularity = 'daily' | 'weekly' | 'monthly';

export type ReportSummary = {
  generatedAt: string;
  generatedBy: 'python' | 'typescript-fallback';
  filters: {
    domain: ReportDomain;
    granularity: ReportGranularity;
    startDate: string;
    endDate: string;
  };
  totals: {
    total: number;
    active: number;
    inactive: number;
    created: number;
    updated: number;
    deactivated: number;
  };
  bars: Array<{ label: string; value: number; color: string }>;
  donut: Array<{ label: string; value: number; color: string }>;
  timeline: Array<{ label: string; created: number; updated: number; deactivated: number }>;
  sectors: Array<{ label: string; value: number }>;
};

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const request = async <T>(path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers ?? {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (init.body && !headers.has('Content-Type') && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Não foi possível concluir a solicitação.';
    throw new ApiError(message, response.status);
  }

  return payload as T;
};

export const loginRequest = (rg: string, password: string) =>
  request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ rg, password }),
  });

export const logoutRequest = (accessToken: string, refreshToken: string) =>
  request<void>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

const authHeaders = (accessToken: string, headers: HeadersInit = {}) => ({
  Authorization: `Bearer ${accessToken}`,
  ...headers,
});

const buildQuery = (filters: SeiTaskFilters) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.status) params.set('status', filters.status);
  if (filters.action) params.set('action', filters.action);
  if (filters.sector?.trim()) params.set('sector', filters.sector.trim());
  if (filters.profile?.trim()) params.set('profile', filters.profile.trim());

  const query = params.toString();
  return query ? `?${query}` : '';
};

const buildReportQuery = (filters: ReportSummary['filters']) => {
  const params = new URLSearchParams({
    domain: filters.domain,
    granularity: filters.granularity,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  return `?${params.toString()}`;
};

export const listSeiTasks = (accessToken: string, filters: SeiTaskFilters = {}) =>
  request<SeiTask[]>(`/sei/tasks${buildQuery(filters)}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

export const createSeiTask = (accessToken: string, task: SeiTaskUpsertInput) =>
  request<SeiTask>('/sei/tasks', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(task),
  });

export const updateSeiTask = (accessToken: string, id: string, task: SeiTaskUpsertInput) =>
  request<SeiTask>(`/sei/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(task),
  });

export const checkSeiTaskInAd = (accessToken: string, id: string) =>
  request<SeiTaskAdCheckResult>(`/sei/tasks/${encodeURIComponent(id)}/check-ad`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });

export const importSeiTasksXlsx = (accessToken: string, file: File) =>
  request<SeiTaskImportSummary>('/sei/tasks/import', {
    method: 'POST',
    headers: authHeaders(accessToken, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'x-file-name': file.name,
    }),
    body: file,
  });

export const listAdUsers = (accessToken: string) =>
  request<AdUser[]>('/ad/users', {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

export const createAdUser = (accessToken: string, user: AdUserCreateInput) =>
  request<AdUser>('/ad/users', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(user),
  });

export const updateAdUser = (accessToken: string, id: string, user: AdUserUpdateInput) =>
  request<AdUser>(`/ad/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(user),
  });

export const deactivateAdUser = (accessToken: string, id: string) =>
  request<AdUser>(`/ad/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

export const importAdUsersXlsx = (accessToken: string, file: File) =>
  request<AdUserImportSummary>('/ad/users/import', {
    method: 'POST',
    headers: authHeaders(accessToken, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'x-file-name': file.name,
    }),
    body: file,
  });

export const getReportSummary = (accessToken: string, filters: ReportSummary['filters']) =>
  request<ReportSummary>(`/reports/summary${buildReportQuery(filters)}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

/* ─── BI Movements ──────────────────────────────────── */

export type BiMovementKind = 'EXONERACAO' | 'NOMEACAO';

export type BiMovement = {
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

export const listBiMovements = (accessToken: string, filters: { startDate?: string; endDate?: string; kind?: BiMovementKind | '' } = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.kind) params.set('kind', filters.kind);
  const query = params.toString();
  return request<BiMovement[]>(`/bi-movements${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  });
};

export const upsertBiMovements = (accessToken: string, movements: BiMovementUpsertInput[]) =>
  request<BiMovement[]>('/bi-movements/batch', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ movements }),
  });

export const removeBiMovement = (accessToken: string, id: string) =>
  request<void>(`/bi-movements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });
