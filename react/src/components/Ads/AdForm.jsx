import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAd, getAd, updateAd } from '../../api/ads.jsx';
import { listCategories } from '../../api/categories.jsx';

export default function AdForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({ title: '', description: '', price: '', category_id: '', contact_info: '', is_active: true });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await listCategories();
        if (mounted) setCategories(cats || []);
      } catch (e) {
        // ignore categories load error silently here
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getAd(id);
        if (mounted) {
          setForm({
            title: data.title || '',
            description: data.description || '',
            price: data.price ?? '',
            category_id: data.category ?? '',
            contact_info: data.contact_info || '',
            is_active: data.is_active ?? true,
          });
        }
      } catch (err) {
        setError('Не удалось загрузить объявление');
      }
    })();
    return () => { mounted = false; };
  }, [isEdit, id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      let result;
      if (isEdit) {
        result = await updateAd(id, payload);
      } else {
        result = await createAd(payload);
      }
      const adId = result?.id || id;
      if (isEdit) {
        navigate('/my-ads');
      } else {
        navigate(`/ads/${adId}`);
      }
    } catch (err) {
      const data = err?.response?.data;
      let msg = 'Ошибка сохранения объявления';
      if (typeof data === 'string') msg = data;
      else if (data?.detail) msg = data.detail;
      else if (data) {
        try {
          const keys = Object.keys(data);
          if (keys.length) msg = `${keys[0]}: ${Array.isArray(data[keys[0]]) ? data[keys[0]].join(', ') : String(data[keys[0]])}`;
        } catch (_) {}
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id6-src/components/Ads/AdForm.jsx" style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{isEdit ? 'Редактирование объявления' : 'Создание объявления'}</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Название</label>
          <input name="title" type="text" value={form.title} onChange={onChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Описание</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={4} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Цена</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label>Категория</label>
            <select name="category_id" value={form.category_id} onChange={onChange} required style={{ width: '100%', padding: 8 }}>
              <option value="" disabled>Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Контактная информация</label>
          <input name="contact_info" type="text" value={form.contact_info} onChange={onChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>
            <input name="is_active" type="checkbox" checked={!!form.is_active} onChange={onChange} /> Активно
          </label>
        </div>
        {error ? <div style={{ color: 'red', marginTop: 12 }}>{error}</div> : null}
        <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '10px 16px' }}>{loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать')}</button>
      </form>
    </div>
  );
}
