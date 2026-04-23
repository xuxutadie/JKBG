import { prisma } from '../lib/prisma.js';
import { notFound } from '../lib/httpError.js';
import { buildPatientCode, normalizeNullableString, normalizeString, parseOptionalInt } from '../utils/normalize.js';

const mapPatientSummary = (patient) => ({
  id: patient.id,
  patientCode: patient.patientCode,
  name: patient.name,
  gender: patient.gender,
  age: patient.age,
  status: patient.status,
  statusText: patient.statusText,
  date: patient.reportDate,
  score: patient.latestScore,
  sourceLabels: Array.isArray(patient.sourceLabels) ? patient.sourceLabels : [],
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
  latestReport: patient.reports?.[0]
    ? {
        id: patient.reports[0].id,
        fileName: patient.reports[0].fileName,
        sourceType: patient.reports[0].sourceType,
        sourceTypes: patient.reports[0].sourceTypes,
        reportData: patient.reports[0].reportData,
        createdAt: patient.reports[0].createdAt
      }
    : null,
  latestGuidance: patient.guidances?.[0] || null
});

const mapPatientDetail = (patient) => ({
  id: patient.id,
  patientCode: patient.patientCode,
  name: patient.name,
  gender: patient.gender,
  age: patient.age,
  status: patient.status,
  statusText: patient.statusText,
  date: patient.reportDate,
  score: patient.latestScore,
  sourceLabels: Array.isArray(patient.sourceLabels) ? patient.sourceLabels : [],
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
  reports: patient.reports || [],
  guidances: patient.guidances || [],
  latestReport: patient.reports?.[0] || null,
  latestGuidance: patient.guidances?.[0] || null
});

export const listPatients = async () => {
  const patients = await prisma.patient.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      guidances: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return patients.map(mapPatientSummary);
};

export const getPatientById = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      reports: { orderBy: { createdAt: 'desc' } },
      guidances: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!patient) throw notFound('患者档案不存在');
  return mapPatientDetail(patient);
};

export const createPatientWithReport = async (payload) => {
  const patientCode = normalizeString(payload.patientCode) || buildPatientCode();

  return prisma.patient.create({
    data: {
      patientCode,
      name: normalizeString(payload.name),
      gender: normalizeNullableString(payload.gender),
      age: normalizeNullableString(payload.age),
      status: payload.status || 'ready',
      statusText: normalizeNullableString(payload.statusText),
      reportDate: normalizeNullableString(payload.date),
      latestScore: parseOptionalInt(payload.score),
      sourceLabels: payload.sourceLabels || [],
      reports: {
        create: {
          fileName: normalizeNullableString(payload.reportData?.fileName),
          sourceType: normalizeNullableString(payload.reportData?.type),
          sourceTypes: payload.reportData?.sourceTypes || [],
          status: payload.status || 'ready',
          score: parseOptionalInt(payload.score),
          reportDate: normalizeNullableString(payload.date),
          rawRecord: payload.rawRecord || null,
          reportData: payload.reportData
        }
      }
    },
    include: {
      reports: true,
      guidances: true
    }
  });
};

export const createGuidanceRecord = async ({ patientId, reportId, result, rawResponse }) => {
  return prisma.guidance.create({
    data: {
      patientId,
      reportId: reportId || null,
      status: 'completed',
      summary: normalizeNullableString(result?.summary),
      healthAdvice: result?.healthAdvice || [],
      dietAdvice: result?.dietAdvice || [],
      exerciseAdvice: result?.exerciseAdvice || [],
      dietTags: result?.dietTags || [],
      provider: 'doubao',
      model: process.env.AI_MODEL || null,
      rawResponse: rawResponse || null
    }
  });
};

export const deletePatientById = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!patient) throw notFound('患者档案不存在');

  await prisma.patient.delete({
    where: { id }
  });
};
