import instance from './axios';

export async function listAds(params = {}) {
  // Supported filters: category, min_price, max_price, date_from, date_to, search, ordering
  const resp = await instance.get('/api/ads/', { params });
  return resp.data;
}

export async function getAd(id) {
  const resp = await instance.get(`/api/ads/${id}/`);
  return resp.data;
}

export async function createAd(payload) {
  const resp = await instance.post('/api/ads/', payload);
  return resp.data;
}

export async function updateAd(id, payload) {
  const resp = await instance.put(`/api/ads/${id}/`, payload);
  return resp.data;
}

export async function deleteAd(id) {
  const resp = await instance.delete(`/api/ads/${id}/`);
  return resp.data;
}

export async function listMyAds() {
  const resp = await instance.get('/api/my/ads/');
  return resp.data;
}
