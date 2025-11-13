/* Attach additional interceptors without modifying axios.js */
import instance from './axios';

// Request interceptor to attach Authorization header using accessToken
instance.interceptors.request.use(
  (config) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    } catch (e) {
      // noop
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to auto-refresh on 401 and retry once
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isAuthEndpoint = url.startsWith('/api/auth/login/') || url.startsWith('/api/auth/register/') || url.startsWith('/api/auth/refresh/');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const refreshResp = await instance.post('/api/auth/refresh/', { refresh: refreshToken });
        const newAccess = refreshResp?.data?.access;
        if (!newAccess) {
          throw new Error('No access token in refresh response');
        }
        // Persist new tokens
        localStorage.setItem('accessToken', newAccess);
        // Keep compatibility with legacy interceptor if used elsewhere
        localStorage.setItem('token', newAccess);

        // Update header and retry original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return instance.request(originalRequest);
      } catch (refreshErr) {
        // Clear tokens on refresh failure
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
        } catch (e) {}
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
