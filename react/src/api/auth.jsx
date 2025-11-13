import instance from './axios';

export async function register(data) {
  const resp = await instance.post('/api/auth/register/', data);
  return resp.data;
}

export async function login({ username_or_email, password }) {
  const resp = await instance.post('/api/auth/login/', { username_or_email, password });
  const { access, refresh } = resp.data || {};
  if (access && refresh) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    // For compatibility with legacy interceptor
    localStorage.setItem('token', access);
  }
  return resp.data;
}

export async function refresh(refreshToken) {
  const resp = await instance.post('/api/auth/refresh/', { refresh: refreshToken });
  const { access } = resp.data || {};
  if (access) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('token', access);
  }
  return resp.data;
}

export function logout() {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
  } catch (e) {
    // noop
  }
}
