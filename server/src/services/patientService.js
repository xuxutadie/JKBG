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

const REPORT_VALUE_SOURCES = ['profile', 'sleepProfile', 'inbodyProfile', 'eyeProfile', 'sleepMonitorInfo', 'sleepMonitorParams'];

const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  return text !== '' && text !== '--' && text !== '未知' && text !== '未知客户';
};

const uniqueStrings = (values) => {
  return [...new Set((Array.isArray(values) ? values : []).filter(hasMeaningfulValue).map(value => String(value).trim()))];
};

const normalizeMatchText = (value) => {
  return normalizeString(value).replace(/\s+/g, '').toLowerCase();
};

const normalizePhone = (value) => {
  const digits = normalizeString(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.length > 11 ? digits.slice(-11) : digits;
};

const normalizeIdCard = (value) => {
  return normalizeString(value).replace(/\s+/g, '').toUpperCase();
};

const normalizeBirthDate = (value) => {
  const text = normalizeString(value);
  if (!text) return '';
  const digits = text.replace(/\D/g, '');
  if (digits.length === 8) return digits;
  return text
    .replace(/[年/.]/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

const getProfileItemValue = (items, labels) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  const rows = Array.isArray(items) ? items : [];
  for (const label of labelList) {
    const matched = rows.find(item => String(item?.label || '').trim() === label);
    if (hasMeaningfulValue(matched?.value)) {
      return String(matched.value).trim();
    }
  }
  return '';
};

const getReportValue = (reportData, labels, sources = REPORT_VALUE_SOURCES) => {
  for (const source of sources) {
    const value = getProfileItemValue(reportData?.[source], labels);
    if (hasMeaningfulValue(value)) {
      return value;
    }
  }
  return '';
};

const createDynamicTable = (title = '') => ({
  title,
  headers: [],
  rows: []
});

const hasLabeledItemsContent = (items) => {
  return Array.isArray(items) && items.some(item => hasMeaningfulValue(item?.label) && hasMeaningfulValue(item?.value));
};

const hasTableRowsContent = (rows) => {
  return Array.isArray(rows) && rows.some(row => {
    return Object.values(row || {}).some(hasMeaningfulValue);
  });
};

const hasDynamicTableContent = (table) => {
  return !!(
    table &&
    ((Array.isArray(table.headers) && table.headers.some(hasMeaningfulValue)) ||
      (Array.isArray(table.rows) && table.rows.some(row => Array.isArray(row) && row.some(hasMeaningfulValue))))
  );
};

const mergePlainObject = (existing, incoming) => {
  const merged = { ...(existing || {}) };
  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (hasMeaningfulValue(value)) {
      merged[key] = value;
    } else if (!(key in merged)) {
      merged[key] = value;
    }
  });
  return merged;
};

const splitFileNames = (value) => {
  return String(value || '')
    .split('/')
    .map(item => item.trim())
    .filter(hasMeaningfulValue);
};

const extractIdentifiers = (entity) => {
  const reportData = entity?.reportData || entity?.latestReport?.reportData || entity?.reports?.[0]?.reportData || {};
  return {
    name: normalizeMatchText(
      getReportValue(reportData, ['姓名']) ||
      entity?.name
    ),
    displayName: normalizeString(
      getReportValue(reportData, ['姓名']) ||
      entity?.name
    ),
    phone: normalizePhone(
      getReportValue(reportData, ['手机号', '手机号码', '联系电话', '电话'])
    ),
    idCard: normalizeIdCard(
      getReportValue(reportData, ['身份证号码', '身份证号', '证件号码', '证件号'])
    ),
    birthDate: normalizeBirthDate(
      getReportValue(reportData, ['出生日期', '生日'])
    ),
    gender: normalizeMatchText(
      getReportValue(reportData, '性别') ||
      entity?.gender
    ),
    age: normalizeString(
      getReportValue(reportData, '年龄') ||
      entity?.age
    ),
    reportDate: normalizeNullableString(
      getReportValue(reportData, ['测试日期', '报告时间', '开始时间', '结束时间']) ||
      entity?.date ||
      entity?.reportDate
    )
  };
};

const mergeReportData = (existingReportData = {}, incomingReportData = {}) => {
  const existingSourceTypes = Array.isArray(existingReportData?.sourceTypes) ? existingReportData.sourceTypes : [existingReportData?.type].filter(Boolean);
  const incomingSourceTypes = Array.isArray(incomingReportData?.sourceTypes) ? incomingReportData.sourceTypes : [incomingReportData?.type].filter(Boolean);
  const sourceTypes = uniqueStrings([...existingSourceTypes, ...incomingSourceTypes]);

  const merged = {
    ...existingReportData,
    ...incomingReportData,
    fileName: uniqueStrings([...splitFileNames(existingReportData?.fileName), ...splitFileNames(incomingReportData?.fileName)]).join(' / '),
    type: sourceTypes.length > 1 ? 'combined' : (incomingReportData?.type || existingReportData?.type || sourceTypes[0] || 'combined'),
    sourceTypes,
    inbodyProfile: hasLabeledItemsContent(incomingReportData?.inbodyProfile) ? incomingReportData.inbodyProfile : (hasLabeledItemsContent(existingReportData?.inbodyProfile) ? existingReportData.inbodyProfile : null),
    profile: hasLabeledItemsContent(incomingReportData?.profile) ? incomingReportData.profile : (hasLabeledItemsContent(existingReportData?.profile) ? existingReportData.profile : null),
    sleepProfile: hasLabeledItemsContent(incomingReportData?.sleepProfile) ? incomingReportData.sleepProfile : (hasLabeledItemsContent(existingReportData?.sleepProfile) ? existingReportData.sleepProfile : null),
    sleepMonitorInfo: hasLabeledItemsContent(incomingReportData?.sleepMonitorInfo) ? incomingReportData.sleepMonitorInfo : (hasLabeledItemsContent(existingReportData?.sleepMonitorInfo) ? existingReportData.sleepMonitorInfo : null),
    sleepMonitorParams: hasLabeledItemsContent(incomingReportData?.sleepMonitorParams) ? incomingReportData.sleepMonitorParams : (hasLabeledItemsContent(existingReportData?.sleepMonitorParams) ? existingReportData.sleepMonitorParams : null),
    sleepMetricsTable: hasTableRowsContent(incomingReportData?.sleepMetricsTable) ? incomingReportData.sleepMetricsTable : (hasTableRowsContent(existingReportData?.sleepMetricsTable) ? existingReportData.sleepMetricsTable : []),
    sleepStatistics: hasDynamicTableContent(incomingReportData?.sleepStatistics) ? incomingReportData.sleepStatistics : (hasDynamicTableContent(existingReportData?.sleepStatistics) ? existingReportData.sleepStatistics : createDynamicTable('睡眠数据统计')),
    dailyStatistics: hasDynamicTableContent(incomingReportData?.dailyStatistics) ? incomingReportData.dailyStatistics : (hasDynamicTableContent(existingReportData?.dailyStatistics) ? existingReportData.dailyStatistics : createDynamicTable('每日统计')),
    sleepSummaryText: hasMeaningfulValue(incomingReportData?.sleepSummaryText) ? incomingReportData.sleepSummaryText : (existingReportData?.sleepSummaryText || ''),
    inbody: hasLabeledItemsContent(incomingReportData?.inbody) ? incomingReportData.inbody : (hasLabeledItemsContent(existingReportData?.inbody) ? existingReportData.inbody : null),
    inbodyTable: hasTableRowsContent(incomingReportData?.inbodyTable) ? incomingReportData.inbodyTable : (hasTableRowsContent(existingReportData?.inbodyTable) ? existingReportData.inbodyTable : []),
    muscleFatAnalysis: hasTableRowsContent(incomingReportData?.muscleFatAnalysis) ? incomingReportData.muscleFatAnalysis : (hasTableRowsContent(existingReportData?.muscleFatAnalysis) ? existingReportData.muscleFatAnalysis : []),
    obesityAnalysis: hasTableRowsContent(incomingReportData?.obesityAnalysis) ? incomingReportData.obesityAnalysis : (hasTableRowsContent(existingReportData?.obesityAnalysis) ? existingReportData.obesityAnalysis : []),
    stress: hasLabeledItemsContent(incomingReportData?.stress) ? incomingReportData.stress : (hasLabeledItemsContent(existingReportData?.stress) ? existingReportData.stress : null),
    stressTable: hasTableRowsContent(incomingReportData?.stressTable) ? incomingReportData.stressTable : (hasTableRowsContent(existingReportData?.stressTable) ? existingReportData.stressTable : []),
    eyeProfile: hasLabeledItemsContent(incomingReportData?.eyeProfile) ? incomingReportData.eyeProfile : (hasLabeledItemsContent(existingReportData?.eyeProfile) ? existingReportData.eyeProfile : null),
    eyeFindingsTable: hasTableRowsContent(incomingReportData?.eyeFindingsTable) ? incomingReportData.eyeFindingsTable : (hasTableRowsContent(existingReportData?.eyeFindingsTable) ? existingReportData.eyeFindingsTable : []),
    eyeSummaryText: hasMeaningfulValue(incomingReportData?.eyeSummaryText) ? incomingReportData.eyeSummaryText : (existingReportData?.eyeSummaryText || ''),
    eyeAdviceText: hasMeaningfulValue(incomingReportData?.eyeAdviceText) ? incomingReportData.eyeAdviceText : (existingReportData?.eyeAdviceText || ''),
    eyeDetailSections: Array.isArray(incomingReportData?.eyeDetailSections) && incomingReportData.eyeDetailSections.length
      ? incomingReportData.eyeDetailSections
      : (Array.isArray(existingReportData?.eyeDetailSections) ? existingReportData.eyeDetailSections : []),
    eyeImages: mergePlainObject(existingReportData?.eyeImages, incomingReportData?.eyeImages),
    manualMetrics: mergePlainObject(existingReportData?.manualMetrics, incomingReportData?.manualMetrics)
  };

  return merged;
};

const getLatestScore = (payloadScore, reportData, fallbackScore) => {
  const payloadParsed = parseOptionalInt(payloadScore);
  if (payloadParsed !== null) return payloadParsed;
  const inbodyScore = getReportValue(reportData, 'InBody评分', ['inbodyProfile']);
  const matched = String(inbodyScore || '').match(/\d+/);
  if (matched) return Number(matched[0]);
  return fallbackScore ?? null;
};

const buildReportCreateInput = (payload, reportData, fallback) => ({
  fileName: normalizeNullableString(reportData?.fileName),
  sourceType: normalizeNullableString(reportData?.type),
  sourceTypes: Array.isArray(reportData?.sourceTypes) ? reportData.sourceTypes : [],
  status: payload.status || fallback?.status || 'ready',
  score: getLatestScore(payload.score, reportData, fallback?.score),
  reportDate: normalizeNullableString(payload.date || getReportValue(reportData, ['测试日期', '报告时间', '开始时间', '结束时间'])),
  rawRecord: payload.rawRecord || null,
  reportData
});

const loadPatientForList = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      reports: { orderBy: { createdAt: 'desc' } },
      guidances: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!patient) throw notFound('患者档案不存在');
  return patient;
};

const findMatchingPatient = async (payload, excludeId = null) => {
  const incoming = extractIdentifiers(payload);
  const patients = await prisma.patient.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    include: {
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  const candidates = patients.map(patient => ({
    patient,
    identifiers: extractIdentifiers(patient)
  }));

  if (incoming.name && incoming.birthDate) {
    const matchedCandidates = candidates.filter(item => {
      const current = item.identifiers;
      return (
        current.name &&
        current.birthDate &&
        current.name === incoming.name &&
        current.birthDate === incoming.birthDate
      );
    });

    if (matchedCandidates.length === 1) {
      return { patient: matchedCandidates[0].patient, matchedBy: 'name+birthDate' };
    }
  }

  return null;
};

const appendReportToExistingPatient = async (patientId, payload, archiveAction = 'updated', matchedBy = null) => {
  const currentPatient = await loadPatientForList(patientId);
  const latestReportData = currentPatient.reports?.[0]?.reportData || {};
  const mergedReportData = mergeReportData(latestReportData, payload.reportData || {});
  const mergedIdentifiers = extractIdentifiers({ ...payload, reportData: mergedReportData });
  const mergedSourceLabels = uniqueStrings([
    ...(Array.isArray(currentPatient.sourceLabels) ? currentPatient.sourceLabels : []),
    ...(Array.isArray(payload.sourceLabels) ? payload.sourceLabels : []),
    ...(Array.isArray(mergedReportData?.sourceTypes) ? mergedReportData.sourceTypes : [])
  ]);

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: normalizeString(payload.name) || mergedIdentifiers.displayName || currentPatient.name,
      gender: normalizeNullableString(payload.gender) || normalizeNullableString(mergedIdentifiers.gender) || currentPatient.gender,
      age: normalizeNullableString(payload.age) || normalizeNullableString(mergedIdentifiers.age) || currentPatient.age,
      status: payload.status || currentPatient.status,
      statusText: normalizeNullableString(payload.statusText) || currentPatient.statusText,
      reportDate: normalizeNullableString(payload.date) || mergedIdentifiers.reportDate || currentPatient.reportDate,
      latestScore: getLatestScore(payload.score, mergedReportData, currentPatient.latestScore),
      sourceLabels: mergedSourceLabels,
      reports: {
        create: buildReportCreateInput(payload, mergedReportData, {
          status: currentPatient.status,
          score: currentPatient.latestScore
        })
      }
    }
  });

  const patient = await loadPatientForList(patientId);
  return {
    ...mapPatientDetail(patient),
    archiveAction,
    matchedBy
  };
};

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
  const patient = await loadPatientForList(id);
  return mapPatientDetail(patient);
};

export const createPatientWithReport = async (payload) => {
  const matchedPatient = await findMatchingPatient(payload);
  if (matchedPatient?.patient?.id) {
    return appendReportToExistingPatient(matchedPatient.patient.id, payload, 'updated', matchedPatient.matchedBy);
  }

  const patientCode = normalizeString(payload.patientCode) || buildPatientCode();
  const created = await prisma.patient.create({
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
    select: { id: true }
  });

  const patient = await loadPatientForList(created.id);
  return {
    ...mapPatientDetail(patient),
    archiveAction: 'created',
    matchedBy: null
  };
};

export const updatePatientById = async (id, payload) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!patient) throw notFound('患者档案不存在');

  if (payload.reportData) {
    return appendReportToExistingPatient(id, payload, 'updated', 'manual');
  }

  await prisma.patient.update({
    where: { id },
    data: {
      name: hasMeaningfulValue(payload.name) ? normalizeString(payload.name) : undefined,
      gender: payload.gender !== undefined ? normalizeNullableString(payload.gender) : undefined,
      age: payload.age !== undefined ? normalizeNullableString(payload.age) : undefined,
      status: payload.status || undefined,
      statusText: payload.statusText !== undefined ? normalizeNullableString(payload.statusText) : undefined,
      reportDate: payload.date !== undefined ? normalizeNullableString(payload.date) : undefined,
      latestScore: payload.score !== undefined ? parseOptionalInt(payload.score) : undefined
    }
  });

  const updatedPatient = await loadPatientForList(id);
  return mapPatientDetail(updatedPatient);
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
