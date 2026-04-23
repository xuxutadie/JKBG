import { api } from './api';

export const listPatients = async () => {
  const response = await api.get('/patients');
  return response?.data || [];
};

export const getPatientDetail = async (id) => {
  const response = await api.get(`/patients/${id}`);
  return response?.data || null;
};

export const createPatientRecord = async (payload) => {
  const response = await api.post('/patients', payload);
  return response?.data || null;
};

export const deletePatientRecord = async (id) => {
  await api.delete(`/patients/${id}`);
};

export const requestPatientGuidance = async (payload) => {
  const response = await api.post('/patients/guidance', payload);
  return response?.data || null;
};
