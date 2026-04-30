import { api } from './api';

const LOCAL_STORAGE_KEY = 'health_reports';

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
    return response?.data || [];
  } catch (_error) {
    return sortByCreatedAtDesc(readLocalPatients());
  }
};

export const getPatientDetail = async (id) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response?.data || null;
  } catch (_error) {
    return readLocalPatients().find(item => item.id === id) || null;
  }
};

export const createPatientRecord = async (payload) => {
  try {
    const response = await api.post('/patients', payload);
    return response?.data || null;
  } catch (_error) {
    const record = buildLocalPatientRecord(payload);
    const current = readLocalPatients();
    writeLocalPatients(sortByCreatedAtDesc([record, ...current]));
    return record;
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
