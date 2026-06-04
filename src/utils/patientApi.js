import { api } from './api';
import { buildPatientRecord } from './reportParser';

const LOCAL_STORAGE_KEY = 'health_reports';

const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  return text !== '' && text !== '--' && text !== '未知' && text !== '未知客户';
};

const uniqueStrings = (values) => {
  return [...new Set((Array.isArray(values) ? values : []).filter(hasMeaningfulValue).map(value => String(value).trim()))];
};

const normalizeMatchText = (value) => String(value || '').trim().replace(/\s+/g, '').toLowerCase();
const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length > 11 ? digits.slice(-11) : digits;
};
const normalizeIdCard = (value) => String(value || '').trim().replace(/\s+/g, '').toUpperCase();

const createDynamicTable = (title = '') => ({
  title,
  headers: [],
  rows: []
});

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

const getReportValue = (reportData, labels, sources = ['profile', 'sleepProfile', 'inbodyProfile', 'eyeProfile', 'sleepMonitorInfo', 'sleepMonitorParams']) => {
  for (const source of sources) {
    const value = getProfileItemValue(reportData?.[source], labels);
    if (hasMeaningfulValue(value)) {
      return value;
    }
  }
  return '';
};

const hasLabeledItemsContent = (items) => {
  return Array.isArray(items) && items.some(item => hasMeaningfulValue(item?.label) && hasMeaningfulValue(item?.value));
};

const hasTableRowsContent = (rows) => {
  return Array.isArray(rows) && rows.some(row => Object.values(row || {}).some(hasMeaningfulValue));
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

const extractIdentifiers = (recordLike) => {
  const reportData = recordLike?.reportData || recordLike?.latestReport?.reportData || {};
  return {
    name: normalizeMatchText(getReportValue(reportData, ['姓名']) || recordLike?.name),
    phone: normalizePhone(getReportValue(reportData, ['手机号', '手机号码', '联系电话', '电话'])),
    idCard: normalizeIdCard(getReportValue(reportData, ['身份证号码', '身份证号', '证件号码', '证件号'])),
    birthDate: normalizeMatchText(getReportValue(reportData, ['出生日期', '生日'])),
    gender: normalizeMatchText(getReportValue(reportData, '性别') || recordLike?.gender),
    age: String(getReportValue(reportData, '年龄') || recordLike?.age || '').trim()
  };
};

const mergeReportData = (existingReportData = {}, incomingReportData = {}) => {
  const existingSourceTypes = Array.isArray(existingReportData?.sourceTypes) ? existingReportData.sourceTypes : [existingReportData?.type].filter(Boolean);
  const incomingSourceTypes = Array.isArray(incomingReportData?.sourceTypes) ? incomingReportData.sourceTypes : [incomingReportData?.type].filter(Boolean);
  const sourceTypes = uniqueStrings([...existingSourceTypes, ...incomingSourceTypes]);

  return {
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
};

const findLocalMatchedRecord = (records, payload) => {
  const incoming = extractIdentifiers(payload);
  const candidates = records.map(record => ({ record, identifiers: extractIdentifiers(record) }));

  if (incoming.idCard) {
    const idCardMatches = candidates.filter(item => item.identifiers.idCard && item.identifiers.idCard === incoming.idCard);
    if (idCardMatches.length === 1) return idCardMatches[0].record;
  }

  if (incoming.phone) {
    const phoneMatches = candidates.filter(item => item.identifiers.phone && item.identifiers.phone === incoming.phone);
    if (phoneMatches.length === 1) return phoneMatches[0].record;
  }

  if (incoming.name) {
    const sameName = candidates.filter(item => item.identifiers.name && item.identifiers.name === incoming.name);
    if (sameName.length === 1) return sameName[0].record;

    const supported = sameName.filter(item => {
      const current = item.identifiers;
      return (
        (incoming.birthDate && current.birthDate && incoming.birthDate === current.birthDate) ||
        (incoming.gender && current.gender && incoming.gender === current.gender && incoming.age && current.age && incoming.age === current.age) ||
        (incoming.gender && current.gender && incoming.gender === current.gender) ||
        (incoming.age && current.age && incoming.age === current.age)
      );
    });
    if (supported.length === 1) return supported[0].record;
  }

  return null;
};

const readLocalPatients = () => {
  try {
    const raw = uni.getStorageSync(LOCAL_STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (_error) {
    return [];
  }
};

const writeLocalPatients = (records) => {
  uni.setStorageSync(LOCAL_STORAGE_KEY, Array.isArray(records) ? records : []);
};

const sortByCreatedAtDesc = (records) => {
  return [...records].sort((a, b) => {
    const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
    const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
    return bTime - aTime;
  });
};

const buildLocalPatientRecord = (payload) => {
  const now = new Date();
  const nowIso = now.toISOString();
  const id = `local-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  const sourceLabels = Array.isArray(payload?.sourceLabels) ? payload.sourceLabels.filter(Boolean) : [];
  const reportData = payload?.reportData || {};

  return {
    id,
    patientCode: id,
    name: payload?.name || '未命名档案',
    gender: payload?.gender || '',
    age: payload?.age || '',
    status: payload?.status || 'ready',
    statusText: payload?.statusText || '待出报告',
    date: payload?.date || nowIso.slice(0, 10),
    score: payload?.score ?? null,
    sourceLabels,
    createdAt: nowIso,
    updatedAt: nowIso,
    reportData,
    latestReport: {
      id: `${id}-report`,
      sourceType: reportData?.type || (sourceLabels.length === 1 ? sourceLabels[0] : 'combined'),
      sourceTypes: Array.isArray(reportData?.sourceTypes) ? reportData.sourceTypes : sourceLabels,
      reportData,
      createdAt: nowIso
    },
    guidances: [],
    latestGuidance: null
  };
};

export const listPatients = async () => {
  try {
    const response = await api.get('/patients');
    const data = response?.data || [];
    return data.map(record => buildPatientRecord(record));
  } catch (_error) {
    const data = sortByCreatedAtDesc(readLocalPatients());
    return data.map(record => buildPatientRecord(record));
  }
};

export const getPatientDetail = async (id) => {
  try {
    const response = await api.get(`/patients/${id}`);
    const data = response?.data || null;
    return data ? buildPatientRecord(data) : null;
  } catch (_error) {
    const localData = readLocalPatients().find(item => item.id === id) || null;
    return localData ? buildPatientRecord(localData) : null;
  }
};

export const createPatientRecord = async (payload) => {
  try {
    const response = await api.post('/patients', payload);
    return response?.data || null;
  } catch (_error) {
    const current = readLocalPatients();
    const matchedRecord = findLocalMatchedRecord(current, payload);

    if (matchedRecord) {
      const mergedReportData = mergeReportData(matchedRecord.reportData || matchedRecord.latestReport?.reportData || {}, payload.reportData || {});
      const nowIso = new Date().toISOString();
      const nextRecord = {
        ...matchedRecord,
        name: payload?.name || matchedRecord.name,
        gender: payload?.gender || matchedRecord.gender,
        age: payload?.age || matchedRecord.age,
        status: payload?.status || matchedRecord.status || 'ready',
        statusText: payload?.statusText || matchedRecord.statusText || '待出报告',
        date: payload?.date || matchedRecord.date || nowIso.slice(0, 10),
        score: payload?.score ?? matchedRecord.score ?? null,
        sourceLabels: uniqueStrings([...(matchedRecord.sourceLabels || []), ...(payload?.sourceLabels || []), ...(mergedReportData?.sourceTypes || [])]),
        updatedAt: nowIso,
        reportData: mergedReportData,
        latestReport: {
          id: matchedRecord.latestReport?.id || `${matchedRecord.id}-report`,
          sourceType: mergedReportData?.type || 'combined',
          sourceTypes: Array.isArray(mergedReportData?.sourceTypes) ? mergedReportData.sourceTypes : [],
          reportData: mergedReportData,
          createdAt: nowIso
        }
      };

      writeLocalPatients(sortByCreatedAtDesc(current.map(item => item.id === matchedRecord.id ? nextRecord : item)));
      return nextRecord;
    }

    const record = buildLocalPatientRecord(payload);
    writeLocalPatients(sortByCreatedAtDesc([record, ...current]));
    return record;
  }
};

export const updatePatientRecord = async (id, payload) => {
  try {
    const response = await api.put(`/patients/${id}`, payload);
    return response?.data || null;
  } catch (_error) {
    const current = readLocalPatients();
    const index = current.findIndex(item => item.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...payload, updatedAt: new Date().toISOString() };
      writeLocalPatients(current);
      return current[index];
    }
    return null;
  }
};

export const deletePatientRecord = async (id) => {
  try {
    await api.delete(`/patients/${id}`);
  } catch (_error) {
    const current = readLocalPatients();
    writeLocalPatients(current.filter(item => item.id !== id));
  }
};

export const requestPatientGuidance = async (payload) => {
  const response = await api.post('/patients/guidance', payload);
  return response?.data || null;
};
