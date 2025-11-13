import instance from './axios';

export async function listCategories() {
  const resp = await instance.get('/api/categories/');
  return resp.data;
}
