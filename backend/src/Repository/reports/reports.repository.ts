export type ReportDomain = 'ALL' | 'AD' | 'SEI';
export type ReportGranularity = 'daily' | 'weekly' | 'monthly';

export type ReportFilters = {
  domain: ReportDomain;
  granularity: ReportGranularity;
  startDate: string;
  endDate: string;
};

export type ReportAdUser = {
  id: string;
  name: string;
  sector: string | null;
  profile: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReportSeiTask = {
  id: string;
  sector: string;
  profile: string;
  action: 'CREATE' | 'UPDATE';
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportAuditLog = {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
};

export type ReportBiMovement = {
  id: string;
  date: string;
  kind: string;
  name: string;
  functionalId: string;
  sector: string;
  role: string;
  symbol: string;
  sourceFile: string;
};

export type ReportDataset = {
  adUsers: ReportAdUser[];
  seiTasks: ReportSeiTask[];
  auditLogs: ReportAuditLog[];
  biMovements: ReportBiMovement[];
};

export type ReportsRepository = {
  getDataset(filters: ReportFilters): Promise<ReportDataset>;
};
