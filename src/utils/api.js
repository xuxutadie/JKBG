const inferBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
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
