const getRuntimeBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const runtimeBaseUrl = window.__APP_CONFIG__?.VITE_API_BASE_URL;
  return runtimeBaseUrl ? String(runtimeBaseUrl).replace(/\/$/, '') : '';
};

const inferBaseUrl = () => {
  const runtimeBaseUrl = getRuntimeBaseUrl();
  if (runtimeBaseUrl) {
    return runtimeBaseUrl;
  }

  const envBaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : '';
  if (envBaseUrl) {
    return String(envBaseUrl).replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const { protocol, hostname, port, origin } = window.location;
    const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname);
    if (isLocalHost && port && port !== '3000') {
      return `${protocol}//${hostname}:3000/api`;
    }
    return `${origin}/api`;
  }
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = inferBaseUrl();

const request = ({ url, method = 'GET', data }) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      timeout: 60000,
      success: (response) => {
        const statusCode = response?.statusCode || 500;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(response.data);
          return;
        }

        reject(new Error(response?.data?.message || '请求失败'));
      },
      fail: (error) => {
        reject(new Error(error?.errMsg || '网络请求失败'));
      }
    });
  });
};

export const api = {
  get: (url) => request({ url, method: 'GET' }),
  post: (url, data) => request({ url, method: 'POST', data }),
  delete: (url) => request({ url, method: 'DELETE' })
};
