import 'dotenv/config';
import path from 'node:path';
import { prisma } from '../src/lib/prisma.js';

const normalizeFileStem = (value) => {
  return String(value || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[（(][^)）]*[)）]$/g, '')
    .replace(/\d+$/g, '')
    .trim();
};

const getSourceTypeFromImportKey = (importKey) => {
  const normalized = String(importKey || '').replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.includes('心率变异性')) return 'stress';
  if (segments.includes('目诊仪')) return 'eye';
  return 'combined';
};

const getSourceLabel = (type) => {
  if (type === 'stress') return 'stress';
  if (type === 'eye') return 'eye';
  return 'combined';
};

const needsNameRepair = (value) => {
  const text = String(value || '').trim();
  return !text || text.length < 2;
};

const main = async () => {
  const reports = await prisma.report.findMany({
    where: {
      rawRecord: {
        path: ['importSourceKey'],
        not: null
      }
    },
    include: {
      patient: true
    }
  });

  let reportUpdated = 0;
  let patientUpdated = 0;

  for (const report of reports) {
    const importSourceKey = report?.rawRecord?.importSourceKey;
    const sourceType = getSourceTypeFromImportKey(importSourceKey);
    const nextFileName = path.basename(String(importSourceKey || report.fileName || ''));
    const nextName = normalizeFileStem(nextFileName);

    const nextReportData = {
      ...(report.reportData || {}),
      fileName: nextFileName,
      type: sourceType,
      sourceTypes: [sourceType]
    };

    await prisma.report.update({
      where: { id: report.id },
      data: {
        fileName: nextFileName,
        sourceType,
        sourceTypes: [sourceType],
        reportData: nextReportData
      }
    });
    reportUpdated += 1;

    const patientNeedsUpdate =
      report.patient &&
      ((Array.isArray(report.patient.sourceLabels) && report.patient.sourceLabels[0] !== getSourceLabel(sourceType)) ||
        needsNameRepair(report.patient.name));

    if (patientNeedsUpdate) {
      await prisma.patient.update({
        where: { id: report.patientId },
        data: {
          name: needsNameRepair(report.patient.name) ? nextName : report.patient.name,
          sourceLabels: [getSourceLabel(sourceType)]
        }
      });
      patientUpdated += 1;
    }
  }

  console.log(`修复完成: 报告 ${reportUpdated} 条, 患者 ${patientUpdated} 条`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
