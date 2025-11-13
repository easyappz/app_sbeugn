import instance from './axios';

export async function getMe() {
  const resp = await instance.get('/api/profile/me/');
  return resp.data;
}

export async function updateMe(payload) {
  const resp = await instance.put('/api/profile/me/', payload);
  return resp.data;
}
