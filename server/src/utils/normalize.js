export const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const normalizeNullableString = (value) => {
  const normalized = normalizeString(value);
  return normalized || null;
};

export const parseOptionalInt = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const buildPatientCode = () => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `KY${timestamp}${random}`;
};
