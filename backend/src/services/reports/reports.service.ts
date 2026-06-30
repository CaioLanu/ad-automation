import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ActorContext } from '../../utils/auth/authenticated-user.js';
import { hasLoginPermission } from '../../utils/auth/permissions.js';
import type { ReportBiMovement, ReportDataset, ReportFilters, ReportsRepository } from '../../Repository/reports/reports.repository.js';

export type ReportSummary = {
  generatedAt: string;
  generatedBy: 'python' | 'typescript-fallback';
  filters: ReportFilters;
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

const assertAdmin = (actor: ActorContext) => {
  if (!hasLoginPermission(actor.permission) || actor.permission !== 'ADMINISTRATORS') {
    const error = new Error('Forbidden') as Error & { status: number };
    error.status = 403;
    throw error;
  }
};

const isInsidePeriod = (value: string, filters: ReportFilters) => {
  const timestamp = Date.parse(value);
  return timestamp >= Date.parse(`${filters.startDate}T00:00:00.000Z`) && timestamp <= Date.parse(`${filters.endDate}T23:59:59.999Z`);
};

const bucketLabel = (value: string, granularity: ReportFilters['granularity']) => {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  if (granularity === 'monthly') return `${year}-${month}`;
  if (granularity === 'weekly') {
    const first = new Date(Date.UTC(year, 0, 1));
    const diff = Math.floor((date.getTime() - first.getTime()) / 86400000);
    return `${year}-S${String(Math.ceil((diff + first.getUTCDay() + 1) / 7)).padStart(2, '0')}`;
  }
  return `${day}/${month}`;
};

const topSectors = (dataset: ReportDataset, filters: ReportFilters) => {
  const counts = new Map<string, number>();

  if (filters.domain === 'ALL') {
    for (const mov of dataset.biMovements) {
      const label = mov.sector || 'Sem setor';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  } else if (filters.domain !== 'SEI') {
    for (const user of dataset.adUsers) {
      const label = user.sector || user.profile || 'Sem setor';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  if (filters.domain !== 'AD') {
    for (const task of dataset.seiTasks) {
      const label = task.sector || task.profile || 'Sem setor';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

const computeSemMovimentacao = (movements: ReportBiMovement[]): number => {
  const lastByFuncId = new Map<string, ReportBiMovement>();
  for (const mov of movements) {
    const existing = lastByFuncId.get(mov.functionalId);
    if (!existing || mov.date > existing.date) {
      lastByFuncId.set(mov.functionalId, mov);
    }
  }
  return Array.from(lastByFuncId.values()).filter((m) => m.kind === 'EXONERACAO').length;
};

const buildBiReportSummary = (dataset: ReportDataset, filters: ReportFilters, generatedBy: ReportSummary['generatedBy']): ReportSummary => {
  const movements = dataset.biMovements;
  const nomeacoes = movements.filter((m) => m.kind === 'NOMEACAO').length;
  const exoneracoes = movements.filter((m) => m.kind === 'EXONERACAO').length;
  const semMovimentacao = computeSemMovimentacao(movements);
  const total = movements.length;
  const timelineMap = new Map<string, { label: string; created: number; updated: number; deactivated: number }>();

  const increment = (date: string, key: 'created' | 'updated' | 'deactivated') => {
    const label = bucketLabel(date, filters.granularity);
    const current = timelineMap.get(label) ?? { label, created: 0, updated: 0, deactivated: 0 };
    current[key] += 1;
    timelineMap.set(label, current);
  };

  for (const mov of movements) {
    increment(mov.date, mov.kind === 'NOMEACAO' ? 'created' : 'deactivated');
  }

  return {
    generatedAt: new Date().toISOString(),
    generatedBy,
    filters,
    totals: { total, active: nomeacoes, inactive: exoneracoes, created: nomeacoes, updated: 0, deactivated: exoneracoes },
    bars: [
      { label: 'Nomeações', value: nomeacoes, color: '#19bce3' },
      { label: 'Exonerações', value: exoneracoes, color: '#fb7a21' },
      { label: 'Sem movimentação', value: semMovimentacao, color: '#94a3b8' },
    ],
    donut: [
      { label: 'Nomeações', value: nomeacoes, color: '#19bce3' },
      { label: 'Exonerações', value: exoneracoes, color: '#fb7a21' },
    ],
    timeline: [...timelineMap.values()].sort((a, b) => a.label.localeCompare(b.label)).slice(-12),
    sectors: topSectors(dataset, filters),
  };
};

const buildAdSeiReportSummary = (dataset: ReportDataset, filters: ReportFilters, generatedBy: ReportSummary['generatedBy']): ReportSummary => {
  const adLogs = dataset.auditLogs.filter((log) => log.entityType === 'AdUser');
  const adCreated = adLogs.filter((log) => log.action === 'AD_USER_CREATED').length || dataset.adUsers.filter((user) => isInsidePeriod(user.createdAt, filters)).length;
  const adUpdated = adLogs.filter((log) => log.action === 'AD_USER_UPDATED').length;
  const adDeactivated = adLogs.filter((log) => log.action === 'AD_USER_DEACTIVATED').length;
  const adActive = dataset.adUsers.filter((user) => user.isActive).length;
  const adInactive = dataset.adUsers.length - adActive;
  const seiCreated = dataset.seiTasks.filter((task) => task.action === 'CREATE' && isInsidePeriod(task.createdAt, filters)).length;
  const seiUpdated = dataset.seiTasks.filter((task) => task.action === 'UPDATE' && isInsidePeriod(task.updatedAt, filters)).length;
  const seiActive = dataset.seiTasks.filter((task) => task.status !== 'COMPLETED' && task.status !== 'CANCELED').length;
  const seiInactive = dataset.seiTasks.length - seiActive;
  const created = filters.domain === 'SEI' ? seiCreated : adCreated;
  const updated = filters.domain === 'SEI' ? seiUpdated : adUpdated;
  const deactivated = filters.domain === 'SEI' ? 0 : adDeactivated;
  const active = filters.domain === 'SEI' ? seiActive : adActive;
  const inactive = filters.domain === 'SEI' ? seiInactive : adInactive;
  const total = filters.domain === 'SEI' ? dataset.seiTasks.length : dataset.adUsers.length;
  const timelineMap = new Map<string, { label: string; created: number; updated: number; deactivated: number }>();

  const increment = (date: string, key: 'created' | 'updated' | 'deactivated') => {
    const label = bucketLabel(date, filters.granularity);
    const current = timelineMap.get(label) ?? { label, created: 0, updated: 0, deactivated: 0 };
    current[key] += 1;
    timelineMap.set(label, current);
  };

  if (filters.domain !== 'AD') {
    for (const task of dataset.seiTasks) increment(task.action === 'CREATE' ? task.createdAt : task.updatedAt, task.action === 'CREATE' ? 'created' : 'updated');
  }
  if (filters.domain !== 'SEI') {
    for (const log of adLogs) {
      if (log.action === 'AD_USER_CREATED') increment(log.createdAt, 'created');
      if (log.action === 'AD_USER_UPDATED') increment(log.createdAt, 'updated');
      if (log.action === 'AD_USER_DEACTIVATED') increment(log.createdAt, 'deactivated');
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    generatedBy,
    filters,
    totals: { total, active, inactive, created, updated, deactivated },
    bars: [
      { label: 'Criados', value: created, color: '#19bce3' },
      { label: 'Alterados', value: updated, color: '#dd5fd2' },
      { label: 'Desativados', value: deactivated, color: '#fb7a21' },
    ],
    donut: [
      { label: 'Ativos', value: active, color: '#19bce3' },
      { label: 'Inativos', value: inactive, color: '#fb7a21' },
    ],
    timeline: [...timelineMap.values()].sort((a, b) => a.label.localeCompare(b.label)).slice(-12),
    sectors: topSectors(dataset, filters),
  };
};

const runPythonReport = (dataset: ReportDataset, filters: ReportFilters) => new Promise<ReportSummary>((resolvePromise, reject) => {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const scriptPath = resolve(currentDir, '../../../python/reports/report_charts.py');
  const payload = JSON.stringify({ dataset, filters });
  const candidates = [process.env.PYTHON_EXECUTABLE || 'python', 'python3'];
  let index = 0;

  const tryRun = () => {
    const child = spawn(candidates[index], [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => errors.push(chunk));
    child.on('error', (error) => {
      index += 1;
      if (index < candidates.length) tryRun();
      else reject(error);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        index += 1;
        if (index < candidates.length) return tryRun();
        return reject(new Error(Buffer.concat(errors).toString('utf8') || `Python exited with ${code}`));
      }
      try {
        resolvePromise(JSON.parse(Buffer.concat(chunks).toString('utf8')) as ReportSummary);
      } catch (error) {
        reject(error);
      }
    });
    child.stdin.end(payload);
  };

  tryRun();
});

export const createReportsService = (repository: ReportsRepository) => ({
  getSummary: async (actor: ActorContext, filters: ReportFilters) => {
    assertAdmin(actor);
    const dataset = await repository.getDataset(filters);

    try {
      return await runPythonReport(dataset, filters);
    } catch {
      return filters.domain === 'ALL'
        ? buildBiReportSummary(dataset, filters, 'typescript-fallback')
        : buildAdSeiReportSummary(dataset, filters, 'typescript-fallback');
    }
  },
});
